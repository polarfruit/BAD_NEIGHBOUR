/* ============================================================
   /api/instagram.js — Vercel Serverless Function
   Fetches recent posts from the Instagram Graph API.
   Env var required: INSTAGRAM_ACCESS_TOKEN
   ============================================================ */

let cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return res.status(503).json({ error: 'Instagram feed not configured.' });
  }

  try {
    // Return cached data if fresh
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cache.data);
    }

    const igUserId = process.env.INSTAGRAM_USER_ID || '17841477444146061';
    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const url = `https://graph.facebook.com/v19.0/${igUserId}/media?fields=${fields}&limit=12&access_token=${token}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Instagram API error:', response.status, errBody);
      return res.status(502).json({ error: 'Failed to fetch Instagram posts.' });
    }

    const json = await response.json();

    // Filter to images and carousels (skip standalone videos)
    const posts = (json.data || [])
      .filter(p => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM')
      .map(p => ({
        id: p.id,
        image: p.media_url,
        caption: p.caption || '',
        url: p.permalink,
        date: p.timestamp
      }));

    const result = { posts };
    cache = { data: result, ts: Date.now() };

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(result);

  } catch (err) {
    console.error('Instagram fetch error:', err);
    return res.status(500).json({ error: 'Something went wrong fetching Instagram posts.' });
  }
};
