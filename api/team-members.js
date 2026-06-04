import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
    const carteDoc = await db.collection("cartes").doc(slug).get();
    if (!carteDoc.exists) return res.status(404).json({ error: "Carte introuvable" });

    const carte = carteDoc.data();
    if (carte.owner_token !== owner_token) {
      return res.status(403).json({ error: "Token invalide" });
    }
    if (carte.team_role !== "manager") {
      return res.status(403).json({ error: "Acces manager uniquement" });
    }
    if (!carte.team_code) {
      return res.status(404).json({ error: "Aucune equipe trouvee" });
    }

    const teamDoc = await db.collection("teams").doc(carte.team_code).get();
    if (!teamDoc.exists) return res.status(404).json({ error: "Equipe introuvable" });

    const team = teamDoc.data();

    const memberDocs = await Promise.all(
      team.member_slugs.map(s => db.collection("cartes").doc(s).get())
    );

    const members = memberDocs
      .filter(d => d.exists)
      .map(d => {
        const m = d.data();
        return {
          slug: m.slug,
          prenom: m.prenom,
          nom: m.nom,
          titre: m.titre,
          tel: m.tel,
          email: m.email,
          vues: m.vues || 0,
          photo_url: m.photo || m.photo_url || ""
        };
      });

    return res.status(200).json({
      success: true,
      team_code: carte.team_code,
      manager_slug: slug,
      max_members: team.max_members,
      member_count: members.length,
      plan_expire: team.plan_expire,
      members
    });
  } catch (err) {
    console.error("team-members error:", err.message);
    return res.status(500).json({ error: "Erreur serveur", detail: err.message });
  }
}
