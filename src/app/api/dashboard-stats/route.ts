import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const range = url.searchParams.get('range') || '30d';

  let dateFrom: string;
  switch (range) {
    case '7d':
      dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case '30d':
      dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case '90d':
      dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      break;
    default:
      dateFrom = '1900-01-01T00:00:00.000Z';
      break;
  }

  try {
    const ordersResult = await pool.query(
      `SELECT COUNT(*) AS count FROM orders WHERE created_at >= $1`,
      [dateFrom]
    );

    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS sum FROM orders WHERE created_at >= $1`,
      [dateFrom]
    );

    const productsResult = await pool.query(
      `SELECT COUNT(*) AS count FROM products`
    );

    const customersResult = await pool.query(
      `SELECT COUNT(DISTINCT email) AS count FROM orders WHERE created_at >= $1`,
      [dateFrom]
    );

    const topProductsResult = await pool.query(
      `
      SELECT p.id, p.name, p.image_url AS image,
        COUNT(oi.product_id) AS "salesCount",
        SUM(oi.quantity * p.price) AS revenue
      FROM order_items oi
      JOIN products p ON oi.product_id::int = p.id::int
      JOIN orders o ON oi.order_id::int = o.id::int
      WHERE o.created_at >= $1
      GROUP BY p.id, p.name, p.image_url
      ORDER BY revenue DESC
      LIMIT 4
      `,
      [dateFrom]
    );

    const salesDataResult = await pool.query(
      `
      SELECT TO_CHAR(DATE_TRUNC('day', o.created_at), 'YYYY-MM-DD') AS date,
        SUM(o.total) AS sales
      FROM orders o
      WHERE o.created_at >= $1
      GROUP BY DATE_TRUNC('day', o.created_at)
      ORDER BY date
      `,
      [dateFrom]
    );

    const recentOrdersResult = await pool.query(
      `
      SELECT 
        o.id AS order_id,
        COALESCE(o.name, 'Guest') AS user_name,
        o.total,
        o.status,
        o.created_at,
        p.name AS product_name,
        p.image_url AS product_image
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id::int = p.id
      WHERE o.created_at >= $1
      ORDER BY o.created_at DESC
      LIMIT 5
      `,
      [dateFrom]
    );

    const now = new Date();
    const previousDateFrom = new Date(
      new Date(dateFrom).getTime() - (now.getTime() - new Date(dateFrom).getTime())
    ).toISOString();

    const previousOrders = await pool.query(
      `SELECT COUNT(*) AS count FROM orders WHERE created_at BETWEEN $1 AND $2`,
      [previousDateFrom, dateFrom]
    );

    const previousRevenue = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS sum FROM orders WHERE created_at BETWEEN $1 AND $2`,
      [previousDateFrom, dateFrom]
    );

    const previousCustomers = await pool.query(
      `SELECT COUNT(DISTINCT email) AS count FROM orders WHERE created_at BETWEEN $1 AND $2`,
      [previousDateFrom, dateFrom]
    );

    const orderGrowth = calculateGrowth(+previousOrders.rows[0].count, +ordersResult.rows[0].count);
    const revenueGrowth = calculateGrowth(+previousRevenue.rows[0].sum, +revenueResult.rows[0].sum);
    const customerGrowth = calculateGrowth(+previousCustomers.rows[0].count, +customersResult.rows[0].count);
    const productGrowth = 100; // Static placeholder

    return NextResponse.json({
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalRevenue: parseInt(revenueResult.rows[0].sum),
      totalProducts: parseInt(productsResult.rows[0].count),
      totalCustomers: parseInt(customersResult.rows[0].count),
      orderGrowth,
      revenueGrowth,
      productGrowth,
      customerGrowth,

      recentOrders: recentOrdersResult.rows.map((row) => {
        const productNameSlug = row.product_name
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w_]/g, '');

        const fallbackImage = `/${productNameSlug}.webp`;

        return {
          orderId: row.order_id,
          userName: row.user_name,
          total: Number(row.total),
          status: row.status,
          createdAt: row.created_at,
          productName: row.product_name,
          productImage:
            !row.product_image || row.product_image.trim() === ''
              ? fallbackImage
              : row.product_image,
        };
      }),

      topProducts: topProductsResult.rows.map((p) => {
        const productNameSlug = p.name
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w_]/g, '');

        const fallbackImage = `/${productNameSlug}.webp`;

        return {
          id: p.id,
          name: p.name,
          salesCount: Number(p.salesCount),
          revenue: Number(p.revenue),
          image:
            !p.image || p.image.trim() === ''
              ? fallbackImage
              : p.image,
        };
      }),

      salesData: salesDataResult.rows.map((r) => ({
        date: r.date,
        sales: Number(r.sales),
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function calculateGrowth(prev: number, curr: number): number {
  if (prev === 0 && curr > 0) return 100;
  if (prev === 0 && curr === 0) return 0;
  return Math.round(((curr - prev) / prev) * 100);
}
