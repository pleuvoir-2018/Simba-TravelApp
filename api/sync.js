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

    // version history (9/9 incident tooling): ?versions=1 lists, ?ts=<13 digits> reads one
    if (req.query && (req.query.versions || req.query.ts)) {
      try {
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        const { blobs } = await list({ prefix: VER_PREFIX, limit: 100 });
        const vers = blobs.map(b => ({ ts: b.pathname.slice(VER_PREFIX.length).replace('.json',''), size: b.size, url: b.url }))
          .filter(v => /^\d{13}$/.test(v.ts)).sort((x, y) => y.ts.localeCompare(x.ts));
        if (req.query.versions) return res.status(200).json({ versions: vers.map(v => ({ ts: v.ts, size: v.size })) });
        const hit = vers.find(v => v.ts === String(req.query.ts));
        if (!hit) return res.status(404).json({ error: 'no such version' });
        const r = await fetch(`${hit.url}?t=${Date.now()}`, { cache: 'no-store' });
        if (!r.ok) return res.status(500).json({ error: 'read-back failed: ' + r.status });
        return res.status(200).json({ ts: hit.ts, value: await r.json() });
      } catch (e) { return res.status(500).json({ error: 'versions failed: ' + e.message }); }
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

      // best-effort prune: keep the newest 8. Runs on ~1 save in 8 — pruning
      // every save tripled advanced-op usage (put+list+del) against the Blob
      // quota; occasional pruning keeps storage just as flat at ~1/3 the cost.
      if (Math.random() < 0.125) try {
        const { blobs } = await list({ prefix: VER_PREFIX, limit: 100 });
        const sorted = blobs.slice().sort((a, b) => b.pathname.localeCompare(a.pathname));
        const stale = sorted.slice(40);   // was 8 — history is the recovery net (9/9)
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
