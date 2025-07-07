import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

const IS_DEV_MODE = true; // Toggle false in production

// ==============================
// GET: Fetch All Categories
// ==============================
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.nav_item_id,
        n.title AS category,
        n.slug AS nav_slug,
        n.position,
        parent.title AS parent_category
      FROM categories c
      LEFT JOIN navigation n ON c.nav_item_id = n.id
      LEFT JOIN navigation parent ON n.parent_id = parent.id
      ORDER BY COALESCE(n.parent_id, 0), n.position ASC, c.name ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET_CATEGORIES_ERROR]', error);
    return new NextResponse('Failed to load categories', { status: 500 });
  }
}

// ==============================
// POST: Create New Category
// ==============================
export async function POST(req: Request) {
  try {
    if (!IS_DEV_MODE) {
      const { userId } = await auth();
      if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { name, parent_id, position } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    await pool.query('BEGIN');

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Step 1: Insert into navigation table
    const navInsert = await pool.query(
      `INSERT INTO navigation (title, slug, parent_id, position, is_category)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [name.trim(), slug, parent_id || null, position || 0]
    );

    const navItem = navInsert.rows[0];
    if (!navItem?.id) throw new Error('Navigation item insert failed');

    // Step 2: Insert into categories table
    const categoryInsert = await pool.query(
      `INSERT INTO categories (name, nav_item_id)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), navItem.id]
    );

    const category = categoryInsert.rows[0];
    if (!category?.id) throw new Error('Category insert failed');

    await pool.query('COMMIT');

    return NextResponse.json({ category, navigation: navItem }, { status: 201 });
  } catch (error) {
    console.error('[POST_CATEGORY_ERROR]', error);
    await pool.query('ROLLBACK');
    return NextResponse.json(
      { error: 'Failed to create category', details: (error as Error).message },
      { status: 500 }
    );
  }
}
