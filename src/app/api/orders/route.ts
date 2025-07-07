import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { users } from '@clerk/clerk-sdk-node';
import pool from '@/lib/db';

// Interfaces
interface OrderItem {
  product_id: number;
  quantity: number;
}

interface CreateOrderBody {
  items: OrderItem[];
  total: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface UpdateOrderStatusBody {
  orderId: number;
  status: string;
}

interface DeleteOrderBody {
  orderId: number;
}

// ✅ GET: Fetch all enriched orders
export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const result = await pool.query(`
      SELECT
        o.id,
        o.total,
        o.created_at,
        o.name,
        o.email,
        o.phone,
        o.address,
        o.user_id,
        o.status,
        COUNT(oi.id) AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.id ASC
    `);

    const userIds = result.rows.map(row => row.user_id).filter(Boolean);
    const uniqueUserIds = [...new Set(userIds)];

    const usersData = await Promise.all(
      uniqueUserIds.map(async id => {
        try {
          const user = await users.getUser(id);
          return {
            id,
            email: user.emailAddresses[0]?.emailAddress || 'No Email',
          };
        } catch {
          return { id, email: 'Unknown' };
        }
      })
    );

    const userMap = new Map(usersData.map(u => [u.id, u.email]));

    const itemsResult = await pool.query(`
      SELECT
        oi.order_id,
        p.name AS product_name,
        p.image AS product_image,
        p.price,
        oi.quantity
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id::int
    `);

    const itemsGroupedByOrder: Record<number, {
      productName: string;
      productImage: string;
      price: number;
      quantity: number;
    }[]> = {};

    for (const item of itemsResult.rows) {
      if (!itemsGroupedByOrder[item.order_id]) {
        itemsGroupedByOrder[item.order_id] = [];
      }
      itemsGroupedByOrder[item.order_id].push({
        productName: item.product_name,
        productImage: item.product_image,
        price: item.price,
        quantity: item.quantity,
      });
    }

    const enriched = result.rows.map(order => ({
      id: order.id,
      total: order.total,
      createdAt: order.created_at,
      userName: order.name || 'Unknown',
      userEmail: order.email || userMap.get(order.user_id) || 'Unknown',
      userPhone: order.phone || 'N/A',
      userAddress: order.address || 'N/A',
      itemCount: order.item_count,
      status: order.status || 'Processing',
      items: itemsGroupedByOrder[order.id] || [],
    }));

    return NextResponse.json(enriched);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET_ORDERS_ERROR]', message);
    return new NextResponse('Error fetching orders', { status: 500 });
  }
}

// ✅ POST: Create new order
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const body: CreateOrderBody = await req.json();
    const { items, total, name, email, phone, address } = body;

    if (!items || !total || !name || !email || !phone || !address) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const order = await pool.query(
      `INSERT INTO orders (user_id, total, name, email, phone, address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [userId, total, name, email, phone, address, 'Processing']
    );

    const orderId = order.rows[0].id;

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [orderId, item.product_id, item.quantity]
      );
    }

    return NextResponse.json({ message: 'Order placed', orderId });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('[POST_ORDER_ERROR]', message);
    return new NextResponse('Order failed', { status: 500 });
  }
}

// ✅ PATCH: Update order status
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const body: UpdateOrderStatusBody = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return new NextResponse('Missing orderId or status', { status: 400 });
    }

    await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2`,
      [status, orderId]
    );

    return new NextResponse('Status updated', { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('[PATCH_ORDER_ERROR]', message);
    return new NextResponse('Failed to update status', { status: 500 });
  }
}

// ✅ DELETE: Remove order + items by orderId and reset sequence if empty
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const body: DeleteOrderBody = await req.json();
    const { orderId } = body;

    if (!orderId) return new NextResponse('Missing orderId', { status: 400 });

    await pool.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);
    await pool.query(`DELETE FROM orders WHERE id = $1`, [orderId]);

    const countRes = await pool.query(`SELECT COUNT(*) FROM orders`);
    const count = parseInt(countRes.rows[0].count);

    if (count === 0) {
      await pool.query(`ALTER SEQUENCE orders_id_seq RESTART WITH 1`);
    }

    return new NextResponse('Order deleted', { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('[DELETE_ORDER_ERROR]', message);
    return new NextResponse('Failed to delete order', { status: 500 });
  }
}
