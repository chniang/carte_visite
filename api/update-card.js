import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const db = getFirestore();

const ALLOWED_FIELDS = ['theme_color', 'services_descriptions'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://chniang.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { slug, owner_token, champs } = req.body;

  if (!slug || !owner_token || !champs || typeof champs !== 'object') {
    return res.status(400).json({ error: 'slug, owner_token et champs requis' });
  }

  const keys = Object.keys(champs);
  if (keys.length === 0) {
    return res.status(400).json({ error: 'champs vide' });
  }
  const forbidden = keys.filter(k => !ALLOWED_FIELDS.includes(k));
  if (forbidden.length > 0) {
    return res.status(400).json({ error: 'Champ(s) non autorise(s) : ' + forbidden.join(', ') });
  }

  if ('theme_color' in champs) {
    if (typeof champs.theme_color !== 'string' || champs.theme_color.length > 20) {
      return res.status(400).json({ error: 'theme_color invalide' });
    }
  }
  if ('services_descriptions' in champs) {
    const sd = champs.services_descriptions;
    if (typeof sd !== 'object' || Array.isArray(sd) || Object.keys(sd).length > 50) {
      return res.status(400).json({ error: 'services_descriptions invalide' });
    }
    for (const [k, v] of Object.entries(sd)) {
      if (typeof k !== 'string' || typeof v !== 'string') {
        return res.status(400).json({ error: 'services_descriptions : cles et valeurs doivent etre des strings' });
      }
    }
  }

  try {
    const doc = await db.collection('cartes').doc(String(slug)).get();
    if (!doc.exists) return res.status(404).json({ error: 'Carte introuvable' });
    if (doc.data().owner_token !== String(owner_token)) {
      return res.status(403).json({ error: 'Token invalide' });
    }

    const updateData = {};
    if ('theme_color' in champs) updateData.theme_color = champs.theme_color;
    if ('services_descriptions' in champs) updateData.services_descriptions = champs.services_descriptions;

    await db.collection('cartes').doc(String(slug)).update(updateData);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('update-card error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
