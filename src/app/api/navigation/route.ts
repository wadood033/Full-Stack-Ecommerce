import {  NextResponse } from 'next/server';
import pool from '@/lib/db';

// =======================
// GET: Fetch all navigation
// =======================
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT * FROM navigation 
      ORDER BY COALESCE(parent_id, 0), position ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Navigation GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation' },
      { status: 500 }
    );
  }
}

// =======================
// POST: Create a navigation item (+ optional category)
// =======================
export async function POST(request: Request) {
  try {
    const { title, slug, parent_id, position, is_category } = await request.json();

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    if (parent_id) {
      const parentExists = await pool.query(
        'SELECT id FROM navigation WHERE id = $1',
        [parent_id]
      );
      if (parentExists.rows.length === 0) {
        return NextResponse.json(
          { error: 'Parent navigation item not found' },
          { status: 404 }
        );
      }
    }

    const navResult = await pool.query(
      `INSERT INTO navigation (title, slug, parent_id, position, is_category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, slug, parent_id || null, position || 0, is_category || false]
    );

    const navItem = navResult.rows[0];

    if (is_category) {
      await pool.query(
        `INSERT INTO categories (name, nav_item_id)
         VALUES ($1, $2)`,
        [title, navItem.id]
      );
    }

    return NextResponse.json(navItem);
  } catch (error) {
    console.error('Navigation POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create navigation item' },
      { status: 500 }
    );
  }
}

// =======================
// PUT: Update a navigation item
// =======================
export async function PUT(request: Request) {
  try {
    const { id, title, slug, parent_id, position, is_category } = await request.json();

    if (!id || !title || !slug) {
      return NextResponse.json(
        { error: 'ID, title, and slug are required' },
        { status: 400 }
      );
    }

    // Check if the navigation item exists
    const itemCheck = await pool.query('SELECT id FROM navigation WHERE id = $1', [id]);
    if (itemCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Navigation item not found' }, { status: 404 });
    }

    await pool.query(
      `UPDATE navigation
       SET title = $1, slug = $2, parent_id = $3, position = $4, is_category = $5
       WHERE id = $6`,
      [title, slug, parent_id || null, position || 0, is_category || false, id]
    );

    // If it's a category, update the category name
    if (is_category) {
      await pool.query(
        `UPDATE categories
         SET name = $1
         WHERE nav_item_id = $2`,
        [title, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Navigation PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update navigation item' },
      { status: 500 }
    );
  }
}

// =======================
// DELETE: Delete a navigation item (with category check)
// =======================
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Check if navigation item exists
    const itemExists = await pool.query(
      'SELECT id FROM navigation WHERE id = $1',
      [id]
    );
    if (itemExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Navigation item not found' },
        { status: 404 }
      );
    }

    // Check if item has children
    const childrenRes = await pool.query(
      'SELECT id FROM navigation WHERE parent_id = $1',
      [id]
    );
    if (childrenRes.rows.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete item with children. Please delete or reassign children first.',
          children: childrenRes.rows,
        },
        { status: 400 }
      );
    }

    // Delete category if it exists
    await pool.query(
      'DELETE FROM categories WHERE nav_item_id = $1',
      [id]
    );

    // Delete navigation item
    await pool.query(
      'DELETE FROM navigation WHERE id = $1',
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Navigation DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete navigation item' },
      { status: 500 }
    );
  }
}
