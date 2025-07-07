import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Properly await the params if needed (though usually params is synchronous)
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

   const result = await pool.query(
  `SELECT 
    p.id,
    p.name,
    p.slug,
    p.price::float,
    p.description,
    p.image,
    p.category_id,
    c.name AS category_name,
    pd.rating -- ✅ Join with product_details to get rating
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN product_details pd ON pd.product_id = p.id
  WHERE p.id = $1`,
  [id]
);


    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }
    if (!body.price) {
      return NextResponse.json(
        { error: 'Price is required' },
        { status: 400 }
      );
    }
    if (!body.image) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE products 
       SET 
         name = $1,
         slug = $2,
         description = $3,
         price = $4,
         image = $5,
         category_id = $6
       WHERE id = $7
       RETURNING *;`,
      [
        body.name,
        body.slug,
        body.description || '',
        Number(body.price),
        body.image,
        body.category_id || null,
        id
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 RETURNING *;`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}