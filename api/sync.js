import { put, list } from '@vercel/blob';

const KEY = 'japan_trip_v2.json';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: KEY, limit: 1 });
      if (!blobs.length) return res.status(200).json({ value: null });
      const r = await fetch(`${blobs[0].url}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
      });
      if (!r.ok) return res.status(500).json({ error: 'read-back failed: ' + r.status });
      return res.status(200).json({ value: await r.json() });
    } catch (e) {
      return res.status(500).json({ error: 'GET failed: ' + e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      await put(KEY, JSON.stringify(req.body ?? {}), {
        access: 'private',            // ← matches your store
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 0,
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'POST failed: ' + e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
