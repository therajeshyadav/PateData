import { neon } from '@neondatabase/serverless';
import { nanoid } from 'nanoid';

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

function getBaseUrl(req) {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-test-now-ms');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initDb();

    if (req.method === 'POST') {
      const { content, ttl_seconds, max_views } = req.body || {};

      // Validate content
      if (content === undefined || content === null) {
        return res.status(400).json({ error: 'content is required' });
      }
      if (typeof content !== 'string') {
        return res.status(400).json({ error: 'content must be a string' });
      }
      if (content.trim() === '') {
        return res.status(400).json({ error: 'content must be a non-empty string' });
      }

      // Validate ttl_seconds
      if (ttl_seconds !== undefined && ttl_seconds !== null) {
        if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
          return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
        }
      }

      // Validate max_views
      if (max_views !== undefined && max_views !== null) {
        if (!Number.isInteger(max_views) || max_views < 1) {
          return res.status(400).json({ error: 'max_views must be an integer >= 1' });
        }
      }

      const sql = getDb();
      const id = nanoid(10);
      const now = getCurrentTime(req);
      const expiresAt = ttl_seconds ? now + ttl_seconds * 1000 : null;

      await sql`
        INSERT INTO pastes (id, content, created_at, expires_at, max_views, view_count)
        VALUES (${id}, ${content}, ${now}, ${expiresAt}, ${max_views || null}, 0)
      `;

      const baseUrl = getBaseUrl(req);
      const pasteUrl = `${baseUrl}/p/${id}`;

      return res.status(201).json({ id, url: pasteUrl });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
