import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, complaint, summary, product, subProduct } = await request.json();

    if (!userId || complaint === undefined || !summary || !product || !subProduct) {
      throw new Error('Missing required fields');
    }

    const result = await sql`
      INSERT INTO Complaints (userId, complaint, summary, product, sub_product, date_sent)
      VALUES (${userId}, ${complaint}, ${summary}, ${product}, ${subProduct}, NOW())
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
