import { put, list } from '@vercel/blob';

const KEY = 'japan_trip_v2.json';

export default async function handler(req, res) {
  // Optional but recommended: shared-secret auth
  const secret = process.env.TRIP_KEY;
  if (secret && req.headers['x-trip-key'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // READ
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: KEY, limit: 1 });
      if (!blobs.length) return res.status(200).json({ value: null });

      // Cache-bust the CDN so you never read a stale save
      const r = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: 'no-store' });
      const data = await r.json();
      return res.status(200).json({ value: data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // WRITE
  if (req.method === 'POST') {
    try {
      await put(KEY, JSON.stringify(req.body), {
        access: 'public',
        addRandomSuffix: false,   // keep one stable file, overwrite in place
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 0,    // minimize CDN staleness on the blob URL
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
