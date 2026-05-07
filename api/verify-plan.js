import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const db = getFirestore();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://chniang.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { slug, owner_token } = req.query;
  if (!slug || !owner_token) {
    return res.status(400).json({ error: "slug et owner_token requis" });
  }

  try {
    const doc = await db.collection('cartes').doc(slug).get();
    if (!doc.exists) return res.status(200).json({ isPro: false });

    const data = doc.data();

    if (!data.owner_token || data.owner_token !== owner_token) {
      return res.status(200).json({ isPro: false });
    }

    const plan = data.plan;
    const expire = data.plan_expire;
    const expireDate = expire && expire.toDate ? expire.toDate() : (expire ? new Date(expire) : null);
    const isPro = (plan === 'pro' || plan === 'lifetime') &&
      (!expireDate || expireDate > new Date());

    return res.status(200).json({ isPro });
  } catch (err) {
    console.error("verify-plan error:", err.message);
    return res.status(500).json({ error: "Erreur serveur", detail: err.message });
  }
}
