import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// import { query } from '../../util/db'; // Import your db utility file

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,  // Make sure this is defined in your .env.local file
  });
  
  // Function to execute a simple query to check the database connection
  async function checkDatabaseConnection() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      return result.rows[0];
    } finally {
      client.release();  // Release the client back to the pool
    }
  }
  
  // Handle GET requests
  export async function GET(req: NextRequest) {
    try {
      const time = await checkDatabaseConnection();
      return NextResponse.json({ success: true, time });
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
    }
  }
