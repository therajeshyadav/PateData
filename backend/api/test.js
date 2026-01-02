export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({ 
    message: 'Backend is working',
    method: req.method,
    url: req.url,
    query: req.query,
    env_check: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      TEST_MODE: process.env.TEST_MODE || 'NOT SET'
    }
  });
}