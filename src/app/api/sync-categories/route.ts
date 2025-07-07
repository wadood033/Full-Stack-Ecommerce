import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Find categories without nav items
    const missingNav = await pool.query(`
      SELECT * FROM categories 
      WHERE nav_item_id IS NULL
    `);

    // Find nav items marked as categories without linked categories
    const missingCategories = await pool.query(`
      SELECT * FROM navigation 
      WHERE is_category = true 
      AND id NOT IN (SELECT nav_item_id FROM categories WHERE nav_item_id IS NOT NULL)
    `);

    return NextResponse.json({
      categories_needing_nav: missingNav.rows,
      nav_needing_categories: missingCategories.rows
    });
  } catch (error) {
    console.error('[SYNC_ERROR]', error);
    return new NextResponse('Sync failed', { status: 500 });
  }
}

export async function POST() {
  try {
    await pool.query('BEGIN');

    // 1. Create nav items for categories that don't have them
    await pool.query(`
      INSERT INTO navigation (title, slug, is_category)
      SELECT name, name, true
      FROM categories
      WHERE nav_item_id IS NULL
    `);

    // 2. Link them back to categories
    await pool.query(`
      UPDATE categories c
      SET nav_item_id = n.id
      FROM navigation n
      WHERE n.title = c.name
      AND n.is_category = true
      AND c.nav_item_id IS NULL
    `);

    await pool.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('[SYNC_ERROR]', error);
    return new NextResponse('Sync failed', { status: 500 });
  }
}