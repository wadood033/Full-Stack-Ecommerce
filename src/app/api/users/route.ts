// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import  pool  from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// GET all users
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await pool.query(`
      SELECT id, email, name, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET_USERS_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
