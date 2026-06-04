import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

  const { slug, owner_token, team_code } = req.body;
  if (!slug || !owner_token || !team_code) {
    return res.status(400).json({ error: "slug, owner_token et team_code requis" });
  }

  try {
    const carteDoc = await db.collection("cartes").doc(slug).get();
    if (!carteDoc.exists) return res.status(404).json({ error: "Carte introuvable" });

    const carte = carteDoc.data();
    if (carte.owner_token !== owner_token) {
      return res.status(403).json({ error: "Token invalide" });
    }
    if (carte.team_code) {
      return res.status(400).json({ error: "Cette carte est deja dans une equipe" });
    }

    // Securite : plan payant requis pour rejoindre
    const plansPayants = ['annual', 'business', 'lifetime', 'pro'];
    if (!plansPayants.includes(carte.plan)) {
      return res.status(403).json({ error: 'Plan payant requis pour rejoindre une equipe Business' });
    }

    const teamDoc = await db.collection("teams").doc(team_code.toUpperCase()).get();
    if (!teamDoc.exists) return res.status(404).json({ error: "Code equipe invalide" });

    const team = teamDoc.data();

    if (team.manager_slug === slug) {
      return res.status(400).json({ error: "Vous etes deja le manager de cette equipe" });
    }
    if (team.member_slugs.length >= team.max_members - 1) {
      return res.status(400).json({ error: "Equipe complete (10 membres max)" });
    }
    if (new Date(team.plan_expire.toDate ? team.plan_expire.toDate() : team.plan_expire) < new Date()) {
      return res.status(400).json({ error: "Plan Business expire" });
    }

    await db.collection("teams").doc(team_code.toUpperCase()).update({
      member_slugs: FieldValue.arrayUnion(slug)
    });

    await db.collection("cartes").doc(slug).update({
      team_code: team_code.toUpperCase(),
      team_role: "member",
      plan: "business",
      plan_expire: team.plan_expire
    });

    return res.status(200).json({
      success: true,
      message: "Vous avez rejoint l equipe",
      manager_slug: team.manager_slug,
      team_code: team_code.toUpperCase()
    });
  } catch (err) {
    console.error("join-team error:", err.message);
    return res.status(500).json({ error: "Erreur serveur", detail: err.message });
  }
}
