// /app/api/product-details/[product_id]/reduce-stock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest, context: { params: { product_id: string } }) {
  const productId = parseInt(await context.params.product_id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  try {
    // 1. Check current quantity
    const existing = await pool.query(
      'SELECT quantity FROM product_details WHERE product_id = $1',
      [productId]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const currentQty = existing.rows[0].quantity;

    if (currentQty <= 0) {
      return NextResponse.json({ error: 'Product is out of stock' }, { status: 400 });
    }

    // 2. Decrease quantity
    const updated = await pool.query(
      'UPDATE product_details SET quantity = quantity - 1 WHERE product_id = $1 RETURNING quantity',
      [productId]
    );

    return NextResponse.json(
      { message: 'Quantity reduced', quantity: updated.rows[0].quantity },
      { status: 200 }
    );
  } catch (err) {
    console.error('❌ Error reducing stock quantity:', err);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
