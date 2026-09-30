import { getTodayFeed } from './feed.js';
export async function handleApi(req, res, options = {}) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
  const url = new URL(req.url, 'http://localhost');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return send(405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } }); }
  if (url.search) return send(400, { error: { code: 'INVALID_REQUEST', message: 'This endpoint does not accept query parameters.' } });
  if (url.pathname === '/api/health') return send(200, { status: 'ok', service: 'cliplish' });
  if (url.pathname !== '/api/feed/today') return send(404, { error: { code: 'NOT_FOUND', message: 'API endpoint not found.' } });
  try {
    const feed = await getTodayFeed(options);
    if (feed.source === 'youtube') {
      const midnight = Date.parse(`${feed.date}T00:00:00Z`) + 86400000;
      const ttl = Math.max(0, Math.floor((midnight - Date.now()) / 1000));
      res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${ttl}`);
    }
    return send(200, feed);
  } catch (error) {
    return send(error.status || 503, { error: { code: error.code || 'FEED_UNAVAILABLE', message: error.code ? error.message : 'Today’s clips aren’t available right now. Please try again later.' } });
  }
}
