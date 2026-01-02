import { neon } from '@neondatabase/serverless';

async function checkDbHealth() {
  try {
    if (!process.env.DATABASE_URL) {
      return false;
    }
    const sql = neon(process.env.DATABASE_URL);
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const dbOk = await checkDbHealth();
  return res.status(200).json({ ok: dbOk });
}
