import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://chniang.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Mot de passe incorrect" });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
  return res.status(200).json({ token });
}
