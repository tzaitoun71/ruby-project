import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const result = await sql`
      CREATE TABLE IF NOT EXISTS Complaints (
        id SERIAL PRIMARY KEY,
        userId VARCHAR(255),
        complaint BOOLEAN,
        summary TEXT,
        product VARCHAR(255),
        sub_product VARCHAR(255),
        date_sent TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
