import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// Define param type
interface RouteContext {
  params: {
    product_id: string;
  };
}

// Define body type for PUT request
interface ProductUpdateBody {
  gallery: string[];
  rating: number;
  full_description: string;
  care_instructions: string;
  material: string;
  fit: string;
  length: string;
  discount_price: number;
  discount_percentage: number;
  colors: string[];
  sizes: string[];
  gender: string;
  model_info: string;
  quantity: number;
}

// ✅ GET product details (includes quantity)
export async function GET(request: Request, context: RouteContext) {
  try {
    const { product_id } = await context.params;
    const productId = parseInt(product_id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT * FROM product_details WHERE product_id = $1`,
      [productId]
    );

    return result.rows.length > 0
      ? NextResponse.json(result.rows[0])
      : NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('GET Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ✅ PUT (update) product details (includes quantity)
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { product_id } = await context.params;
    const productId = parseInt(product_id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body: ProductUpdateBody = await request.json();

    const result = await pool.query(
      `UPDATE product_details SET
        gallery = $1,
        rating = $2,
        full_description = $3,
        care_instructions = $4,
        material = $5,
        fit = $6,
        length = $7,
        discount_price = $8,
        discount_percentage = $9,
        colors = $10,
        sizes = $11,
        gender = $12,
        model_info = $13,
        quantity = $14
      WHERE product_id = $15
      RETURNING *`,
      [
        body.gallery,
        body.rating,
        body.full_description,
        body.care_instructions,
        body.material,
        body.fit,
        body.length,
        body.discount_price,
        body.discount_percentage,
        body.colors,
        body.sizes,
        body.gender,
        body.model_info,
        body.quantity,
        productId,
      ]
    );

    return result.rows.length > 0
      ? NextResponse.json(result.rows[0])
      : NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('PUT Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ✅ DELETE product details
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { product_id } = context.params;
    const productId = parseInt(product_id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await pool.query(`DELETE FROM product_details WHERE product_id = $1`, [productId]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('DELETE Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
