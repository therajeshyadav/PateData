import { neon } from '@neondatabase/serverless';

let sql = null;

export function getDb() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export async function initDb() {
  const sql = getDb();
  
  await sql`
    CREATE TABLE IF NOT EXISTS pastes (
      id VARCHAR(12) PRIMARY KEY,
      content TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      expires_at BIGINT,
      max_views INTEGER,
      view_count INTEGER DEFAULT 0
    )
  `;
  
  // Create index for faster expiry lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at)
  `;
  
  return true;
}

export async function checkDbHealth() {
  try {
    const sql = getDb();
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
