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

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

function generatePasteHtml(content, remainingViews, expiresAt) {
  const expiryInfo = expiresAt 
    ? `<p>Expires: ${new Date(parseInt(expiresAt)).toISOString()}</p>` 
    : '';
  const viewsInfo = remainingViews !== null 
    ? `<p>Remaining views: ${remainingViews}</p>` 
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pastebin Lite</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #1a1a1a; color: #fff; }
    pre { background: #2d2d2d; padding: 20px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
    .meta { color: #888; font-size: 14px; margin-bottom: 16px; }
    a { color: #60a5fa; }
  </style>
</head>
<body>
  <h1>Pastebin Lite</h1>
  <div class="meta">
    ${viewsInfo}
    ${expiryInfo}
  </div>
  <pre>${content}</pre>
  <p><a href="/">Create new paste</a></p>
</body>
</html>`;
}

function generateErrorHtml(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paste Unavailable - Pastebin Lite</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #1a1a1a; color: #fff; }
    .error { background: #7f1d1d; padding: 20px; border-radius: 8px; }
    a { color: #60a5fa; }
  </style>
</head>
<body>
  <h1>Pastebin Lite</h1>
  <div class="error">
    <h2>Paste Unavailable</h2>
    <p>${escapeHtml(message)}</p>
  </div>
  <p><a href="/">Create new paste</a></p>
</body>
</html>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(405).send(generateErrorHtml('Method not allowed'));
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
      res.setHeader('Content-Type', 'text/html');
      return res.status(404).send(generateErrorHtml('Paste not found'));
    }

    const paste = result[0];

    if (paste.expires_at && now >= parseInt(paste.expires_at)) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(404).send(generateErrorHtml('Paste has expired'));
    }

    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(404).send(generateErrorHtml('View limit exceeded'));
    }

    const updated = await sql`
      UPDATE pastes 
      SET view_count = view_count + 1 
      WHERE id = ${id} 
        AND (max_views IS NULL OR view_count < max_views)
      RETURNING view_count
    `;

    if (updated.length === 0) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(404).send(generateErrorHtml('View limit exceeded'));
    }

    const newViewCount = updated[0].view_count;
    const remainingViews = paste.max_views !== null 
      ? paste.max_views - newViewCount 
      : null;

    const escapedContent = escapeHtml(paste.content);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(generatePasteHtml(escapedContent, remainingViews, paste.expires_at));
  } catch (error) {
    console.error('Error:', error);
    res.setHeader('Content-Type', 'text/html');
    return res.status(500).send(generateErrorHtml('Internal server error'));
  }
}
