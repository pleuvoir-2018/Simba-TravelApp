import { put, list, del } from '@vercel/blob';

/* State is stored as VERSIONED, WRITE-ONCE blobs: state/japan_trip_v2-<ts>.json.
   Overwriting one URL (the old scheme) rode Vercel Blob's edge cache, which is
   eventually consistent for ~60s after an overwrite — the source of "saved to
   cloud, but a refresh shows old data". A brand-new pathname per save gets a
   brand-new URL, which no edge can have cached. GET lists the versions and
   reads the newest; POST prunes to the last 3 so storage stays flat.
   Date.now() is 13 digits until the year 2286, so lexical pathname sort is
   chronological. The legacy single blob remains as a read fallback for
   migration. */

const LEGACY_KEY = 'japan_trip_v2.json';
const VER_PREFIX = 'state/japan_trip_v2-';

export default async function handler(req, res) {

  if (req.method === 'GET') {
    if (req.query && req.query.test) {
      const report = {};
      try {
        await put('selftest.json', JSON.stringify({ ok: 1 }), {
          access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json'
        });
        report.write1 = 'ok';
        const { blobs } = await list({ prefix: 'selftest.json', limit: 1 });
        report.listed = blobs.length ? 'ok' : 'MISSING';
      } catch (e) { report.error = e.message; }
      return res.status(200).json(report);
    }

    try {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      const { blobs } = await list({ prefix: VER_PREFIX, limit: 20 });
      let target = null;
      if (blobs.length) {
        target = blobs.slice().sort((a, b) => b.pathname.localeCompare(a.pathname))[0];
      } else {
        const legacy = await list({ prefix: LEGACY_KEY, limit: 1 });
        if (legacy.blobs.length) target = legacy.blobs[0];
      }
      if (!target) return res.status(200).json({ value: null });
      const r = await fetch(`${target.url}?t=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) return res.status(500).json({ error: 'read-back failed: ' + r.status });
      return res.status(200).json({ value: await r.json() });
    } catch (e) {
      return res.status(500).json({ error: 'GET failed: ' + e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      let payload = req.body;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch (_) { payload = {}; }
      }
      if (!payload || typeof payload !== 'object') payload = {};

      await put(`${VER_PREFIX}${Date.now()}.json`, JSON.stringify(payload), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });

      // best-effort prune: keep the newest 3 versions
      try {
        const { blobs } = await list({ prefix: VER_PREFIX, limit: 100 });
        const sorted = blobs.slice().sort((a, b) => b.pathname.localeCompare(a.pathname));
        const stale = sorted.slice(3);
        if (stale.length) await del(stale.map(b => b.url));
      } catch (_) {}

      return res.status(200).json({ success: true });
    } catch (e) {
      console.error('POST /api/sync failed:', e);
      return res.status(500).json({ error: 'POST failed: ' + e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
