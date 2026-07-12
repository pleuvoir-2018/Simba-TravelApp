export default async function handler(req, res) {
  const { VERCEL_API_TOKEN, EDGE_CONFIG_ID } = process.env;

  // READ DATA
  if (req.method === 'GET') {
    try {
      const fetchRes = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/item/japan_trip_v2`, {
        headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` }
      });
      if (fetchRes.status === 404) return res.status(200).json({ value: null });
      const data = await fetchRes.json();
      return res.status(200).json({ value: data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // WRITE DATA
  if (req.method === 'POST') {
    try {
      await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${VERCEL_API_TOKEN}`
        },
        body: JSON.stringify({
          items: [{ operation: 'upsert', key: 'japan_trip_v2', value: req.body }]
        })
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
