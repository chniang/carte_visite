export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "url manquant" });

  // Autoriser uniquement Supabase CartViz
  if (!url.startsWith("https://xpdfwsirpdmmpxeqkpuj.supabase.co/")) {
    return res.status(403).json({ error: "URL non autorisee" });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(404).json({ error: "Photo introuvable" });

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: "Erreur proxy: " + err.message });
  }
}
