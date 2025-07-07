import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// ============================
// GET /api/products
// ============================
export async function GET() {
  console.log('🚀 Loaded /api/products route');
  try {
const result = await pool.query(`
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.original_price,
    p.description,
    p.image,
    p.category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    parent.slug AS parent_category_slug,
    pd.rating, -- ✅ Pull rating from product_details
    p.created_at
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN categories parent ON c.parent_id = parent.id
  LEFT JOIN product_details pd ON pd.product_id = p.id -- ✅ Join for rating
  ORDER BY p.created_at DESC;
`);


    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('❌ Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// ============================
// POST /api/products
// ============================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.price || !body.image || !body.category_id) {
      return badRequest('All required fields must be filled');
    }

    // Verify category exists
    const categoryCheck = await pool.query(
      'SELECT slug FROM categories WHERE id = $1',
      [body.category_id]
    );

    if (categoryCheck.rowCount === 0) {
      return badRequest('Invalid category');
    }

    const category_slug = categoryCheck.rows[0].slug;
    const slug = body.slug || generateSlug(body.name);

    const price = Number(body.price);
    const originalPrice =
      body.original_price && Number(body.original_price) > price
        ? Number(body.original_price)
        : null;

    const result = await pool.query(
      `
      INSERT INTO products 
        (name, slug, description, price, original_price, image, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        body.name,
        slug,
        body.description || '',
        price,
        originalPrice, // ✅ Store if valid, else null
        body.image,
        body.category_id,
      ]
    );

    return NextResponse.json(
      {
        ...result.rows[0],
        category_slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================
// Utilities
// ============================
function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50) + '-' + Date.now().toString().slice(-6);
}
