import { neon } from '@neondatabase/serverless';

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

async function initDb() {
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
}

function getCurrentTime(req) {
  if (process.env.TEST_MODE === '1') {
    const testNowMs = req.headers['x-test-now-ms'];
    if (testNowMs) {
      const parsed = parseInt(testNowMs, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return Date.now();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-test-now-ms');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();

    const { id } = req.query;
    const sql = getDb();
    const now = getCurrentTime(req);

    const result = await sql`
      SELECT id, content, created_at, expires_at, max_views, view_count
      FROM pastes WHERE id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Paste not found' });
    }

    const paste = result[0];

    if (paste.expires_at && now >= parseInt(paste.expires_at)) {
      return res.status(404).json({ error: 'Paste has expired' });
    }

    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
      return res.status(404).json({ error: 'View limit exceeded' });
    }

    const updated = await sql`
      UPDATE pastes 
      SET view_count = view_count + 1 
      WHERE id = ${id} 
        AND (max_views IS NULL OR view_count < max_views)
      RETURNING view_count
    `;

    if (updated.length === 0) {
      return res.status(404).json({ error: 'View limit exceeded' });
    }

    const newViewCount = updated[0].view_count;
    const remainingViews = paste.max_views !== null 
      ? paste.max_views - newViewCount 
      : null;

    return res.status(200).json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: paste.expires_at ? new Date(parseInt(paste.expires_at)).toISOString() : null
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
