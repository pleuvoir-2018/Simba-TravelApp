import { put, list, head } from '@vercel/blob';

const KEY = 'japan_trip_v2.json';

export default async function handler(req, res) {

  // ---------- GET ----------
  if (req.method === 'GET') {

    // Self-test: /api/sync?test=1 — runs write → overwrite → list → read-back, reports each step
    if (req.query && req.query.test) {
      const report = {};
      try {
        await put('selftest.json', JSON.stringify({ ok: 1, t: Date.now() }), {
          access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json'
        });
        report.write1 = 'ok';

        await put('selftest.json', JSON.stringify({ ok: 2, t: Date.now() }), {
          access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json'
        });
        report.overwrite = 'ok';

        const { blobs } = await list({ prefix: 'selftest.json', limit: 1 });
        report.listed = blobs.length ? 'ok' : 'MISSING';

        if (blobs.length) {
          const meta = await head(blobs[0].url);
          const r = await fetch(meta.downloadUrl, { cache: 'no-store' });
          report.readback = r.ok ? await r.json() : 'HTTP ' + r.status;
        }
      } catch (e) {
        report.error = e.message;
      }
      return res.status(200).json(report);
    }

    // Normal read
    try {
      const { blobs } = await list({ prefix: KEY, limit: 1 });
      if (!blobs.length) return res.status(200).json({ value: null });

      const meta = await head(blobs[0].url);            // fresh signed URL for private blob
      const r = await fetch(meta.downloadUrl, { cache: 'no-store' });
      if (!r.ok) return res.status(500).json({ error: 'read-back failed: ' + r.status });

      return res.status(200).json({ value: await r.json() });
    } catch (e) {
      return res.status(500).json({ error: 'GET failed: ' + e.message });
    }
  }

  // ---------- POST ----------
  if (req.method === 'POST') {
    try {
      // Normalize: body may arrive as object, string, or undefined
      let payload = req.body;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch (_) { payload = {}; }
      }
      if (!payload || typeof payload !== 'object') payload = {};

      await put(KEY, JSON.stringify(payload), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error('POST /api/sync failed:', e);
      return res.status(500).json({ error: 'POST failed: ' + e.message });
    }
  }

  // ---------- other ----------
  res.status(405).json({ error: 'Method not allowed' });
}
