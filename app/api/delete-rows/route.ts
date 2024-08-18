// File: app/api/delete-complaints/route.ts

import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const result = await sql`
      DELETE FROM Complaints
      RETURNING *;
    `;

    return NextResponse.json({ success: true, deletedRows: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
