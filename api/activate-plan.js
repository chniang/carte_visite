import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

  const { slug, plan, admin_token } = req.body;
  if (admin_token !== "carteviz_admin_2025") return res.status(403).json({ error: "Token invalide" });
  if (!slug || !plan) return res.status(400).json({ error: "slug et plan requis" });

  try {
    var expire;
    if (plan === 'pro') {
      expire = new Date();
      expire.setMonth(expire.getMonth() + 1);
    } else if (plan === 'lifetime') {
      expire = new Date('2125-01-01');
    } else {
      return res.status(400).json({ error: "plan invalide (pro ou lifetime)" });
    }

    await db.collection('cartes').doc(slug).update({
      plan: plan,
      plan_activated_at: new Date(),
      plan_expire: expire
    });

    return res.status(200).json({ success: true, slug, plan, expire: expire.toISOString() });
  } catch (err) {
    console.error("activate-plan error:", err.message);
    return res.status(500).json({ error: "Erreur serveur", detail: err.message });
  }
}
