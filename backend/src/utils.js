import { nanoid } from 'nanoid';

export function generateId() {
  return nanoid(10);
}

export function getCurrentTime(req) {
  // Support deterministic time for testing
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

export function getBaseUrl(req) {
  // Use BASE_URL env var if set, otherwise construct from request
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}
