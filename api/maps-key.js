/* Returns the Google Maps API key for frontend use.
   The key should be restricted in Google Cloud Console to:
   - HTTP referrers: your domain only (e.g. bad-neighbour.vercel.app, badneighbour.au)
   - API restrictions: Maps JavaScript API + Places API only */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key) {
    return res.status(200).json({ key: null });
  }
  return res.status(200).json({ key });
};
