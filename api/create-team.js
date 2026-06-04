import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const db = getFirestore();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://chniang.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { slug, admin_token } = req.body;
  try {
    jwt.verify(admin_token, process.env.JWT_SECRET);
  } catch {
    return res.status(403).json({ error: "Token invalide" });
  }
  if (!slug) return res.status(400).json({ error: "slug requis" });

  try {
    const carteDoc = await db.collection("cartes").doc(slug).get();
    if (!carteDoc.exists) return res.status(404).json({ error: "Carte introuvable" });

    const carteData = carteDoc.data();
    if (carteData.plan !== "business") {
      return res.status(400).json({ error: "La carte doit avoir le plan business" });
    }

    if (carteData.team_code) {
      return res.status(200).json({
        success: true,
        team_code: carteData.team_code,
        message: "Equipe deja existante"
      });
    }

    const team_code = randomBytes(3).toString("hex").toUpperCase();

    // Synchroniser l expiration equipe avec le plan Business du manager
    const carteExpire = carteData.plan_expire;
    const expire = carteExpire
      ? new Date(carteExpire.toDate ? carteExpire.toDate() : carteExpire)
      : (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })();

    await db.collection("teams").doc(team_code).set({
      team_code,
      manager_slug: slug,
      member_slugs: [],
      max_members: 10,
      plan_expire: expire,
      createdAt: new Date()
    });

    await db.collection("cartes").doc(slug).update({
      team_code,
      team_role: "manager"
    });

    return res.status(200).json({ success: true, team_code, slug, expire: expire.toISOString() });
  } catch (err) {
    console.error("create-team error:", err.message);
    return res.status(500).json({ error: "Erreur serveur", detail: err.message });
  }
}
