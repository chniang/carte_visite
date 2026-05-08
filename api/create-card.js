import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const db = getFirestore();

const rateLimitMap = new Map();
const MAX_CREATES = 3;
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
  if (entry.count >= MAX_CREATES) return false;
  entry.count++;
  return true;
}

function cleanExpired() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > WINDOW_MS) rateLimitMap.delete(ip);
  }
}

function generateSlug(prenom, nom) {
  const clean = (s) => s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${clean(prenom)}-${clean(nom)}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://chniang.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = getIP(req);
  cleanExpired();
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Trop de creations. Reessayez dans une heure.' });
  }

  const { prenom, nom, titre, bio, tel, email, lieu, photo, services, liens } = req.body;

  if (!prenom || !nom || !titre || !tel) {
    return res.status(400).json({ error: 'Champs obligatoires manquants : prenom, nom, titre, tel' });
  }

  const baseSlug = generateSlug(String(prenom), String(nom));

  try {
    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      const doc = await db.collection('cartes').doc(finalSlug).get();
      if (!doc.exists) break;
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }

    const token = randomBytes(8).toString('hex');

    await db.collection('cartes').doc(finalSlug).set({
      slug: finalSlug,
      prenom: String(prenom),
      nom: String(nom),
      titre: String(titre),
      bio: bio ? String(bio) : '',
      tel: String(tel),
      email: email ? String(email) : '',
      lieu: lieu ? String(lieu) : '',
      photo: photo ? String(photo) : '',
      services: Array.isArray(services) ? services.slice(0, 20).map(String) : [],
      liens: Array.isArray(liens) ? liens.slice(0, 10) : [],
      owner_token: token,
      plan: 'free',
      vues: 0,
      clics_whatsapp: 0,
      createdAt: FieldValue.serverTimestamp()
    });

    return res.status(200).json({ success: true, slug: finalSlug, token });
  } catch (err) {
    console.error('create-card error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}
