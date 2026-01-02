import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDb, initDb, checkDbHealth } from './db.js';
import { generateId, getCurrentTime, getBaseUrl } from './utils.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://pate-data.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Debug root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pastebin Lite Backend is running!',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      BASE_URL: process.env.BASE_URL || 'NOT SET'
    }
  });
});

// Health check endpoint
app.get('/api/healthz', async (req, res) => {
  try {
    const dbOk = await checkDbHealth();
    res.status(200).json({ ok: dbOk });
  } catch (error) {
    res.status(200).json({ ok: false });
  }
});

// Create a paste
app.post('/api/pastes', async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

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
    const id = generateId();
    const now = getCurrentTime(req);
    const expiresAt = ttl_seconds ? now + ttl_seconds * 1000 : null;

    await sql`
      INSERT INTO pastes (id, content, created_at, expires_at, max_views, view_count)
      VALUES (${id}, ${content}, ${now}, ${expiresAt}, ${max_views || null}, 0)
    `;

    const baseUrl = getBaseUrl(req);
    const url = `${baseUrl}/p/${id}`;

    res.status(201).json({ id, url });
  } catch (error) {
    console.error('Error creating paste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch a paste (API)
app.get('/api/pastes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getDb();
    const now = getCurrentTime(req);

    // Get the paste
    const result = await sql`
      SELECT id, content, created_at, expires_at, max_views, view_count
      FROM pastes WHERE id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Paste not found' });
    }

    const paste = result[0];

    // Check expiry
    if (paste.expires_at && now >= parseInt(paste.expires_at)) {
      return res.status(404).json({ error: 'Paste has expired' });
    }

    // Check view limit
    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
      return res.status(404).json({ error: 'View limit exceeded' });
    }

    // Increment view count atomically
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

    res.status(200).json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: paste.expires_at ? new Date(parseInt(paste.expires_at)).toISOString() : null
    });
  } catch (error) {
    console.error('Error fetching paste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View a paste (HTML)
app.get('/p/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getDb();
    const now = getCurrentTime(req);

    // Get the paste
    const result = await sql`
      SELECT id, content, created_at, expires_at, max_views, view_count
      FROM pastes WHERE id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).send(generateErrorHtml('Paste not found'));
    }

    const paste = result[0];

    // Check expiry
    if (paste.expires_at && now >= parseInt(paste.expires_at)) {
      return res.status(404).send(generateErrorHtml('Paste has expired'));
    }

    // Check view limit
    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
      return res.status(404).send(generateErrorHtml('View limit exceeded'));
    }

    // Increment view count atomically
    const updated = await sql`
      UPDATE pastes 
      SET view_count = view_count + 1 
      WHERE id = ${id} 
        AND (max_views IS NULL OR view_count < max_views)
      RETURNING view_count
    `;

    if (updated.length === 0) {
      return res.status(404).send(generateErrorHtml('View limit exceeded'));
    }

    const newViewCount = updated[0].view_count;
    const remainingViews = paste.max_views !== null 
      ? paste.max_views - newViewCount 
      : null;

    // Escape HTML to prevent XSS
    const escapedContent = escapeHtml(paste.content);
    
    res.status(200).send(generatePasteHtml(escapedContent, remainingViews, paste.expires_at));
  } catch (error) {
    console.error('Error viewing paste:', error);
    res.status(500).send(generateErrorHtml('Internal server error'));
  }
});

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

// Initialize database and start server
async function start() {
  try {
    await initDb();
    console.log('Database initialized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
