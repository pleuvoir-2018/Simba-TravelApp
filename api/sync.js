import { put, list } from '@vercel/blob';

const KEY = 'japan_trip_v2.json';

export default async function handler(req, res) {
// Phone-friendly self-test: /api/sync?test=1 runs a write+read cycle and reports each step
    if (req.query && req.query.test) {
      const report = {};
      try {
        await put('selftest.json', JSON.stringify({ok:1,t:Date.now()}), {
          access:'private', addRandomSuffix:false, allowOverwrite:true, contentType:'application/json'
        });
        report.write1 = 'ok';
        await put('selftest.json', JSON.stringify({ok:2,t:Date.now()}), {
          access:'private', addRandomSuffix:false, allowOverwrite:true, contentType:'application/json'
        });
        report.overwrite = 'ok';
        const { blobs } = await list({ prefix:'selftest.json', limit:1 });
        report.listed = blobs.length ? 'ok' : 'MISSING';
        if (blobs.length) {
          const r = await fetch(blobs[0].downloadUrl || blobs[0].url, { cache:'no-store' });
          report.readback = r.ok ? await r.json() : 'HTTP '+r.status;
        }
      } catch(e) { report.error = e.message; }
      return res.status(200).json(report);
    }
  
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: KEY, limit: 1 });
      if (!blobs.length) return res.status(200).json({ value: null });
      const url = blobs[0].downloadUrl || blobs[0].url;
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) return res.status(500).json({ error: 'read-back failed: ' + r.status });
      return res.status(200).json({ value: await r.json() });
    } catch (e) {
      return res.status(500).json({ error: 'GET failed: ' + e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      await put(KEY, JSON.stringify(req.body ?? {}), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'POST failed: ' + e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
