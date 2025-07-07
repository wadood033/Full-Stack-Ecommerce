import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, email_addresses, first_name, last_name } = body.data;
    const email = email_addresses?.[0]?.email_address || '';
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    await pool.query(
      `INSERT INTO users (id, email, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING;`,
      [id, email, name]
    );

    return NextResponse.json({ message: 'User created' });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}