import jwt from 'jsonwebtoken';

const rateLimitMap = new Map();
const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 60 * 1000;

function getIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

function cleanExpired() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > WINDOW_MS) rateLimitMap.delete(ip);
  }
}

function isAdminRequest(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return false;
  try {
    jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://chniang.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getIP(req);
  cleanExpired();
  if (!isAdminRequest(req) && !checkRateLimit(ip)) {
    return res.status(429).json({ error: "Trop de requetes. Reessayez dans une heure." });
  }

  const { question, context } = req.body;
  if (!question) return res.status(400).json({ error: "question required" });

  const systemPrompt = "Tu es l'assistant analytique de CarteViz. " + (context || "") + " Reponds en francais, max 4 phrases.";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error FULL:", JSON.stringify(data));
      return res.status(500).json({ error: "Erreur API IA", detail: JSON.stringify(data) });
    }

    const reply = data.choices?.[0]?.message?.content || "Pas de reponse";
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Handler error:", err.message);
    return res.status(500).json({ error: "Erreur serveur", detail: err.message });
  }
}
