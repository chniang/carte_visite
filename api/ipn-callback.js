const admin = require('firebase-admin');
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = req.body || {};
    const customData = body.custom_data || (body.data && body.data.custom_data);
    const status = body.status || (body.data && body.data.status);
    if (!customData) return res.status(400).json({ error: 'custom_data manquant' });
    const { slug, plan, owner_token } = customData;
    if (status !== 'completed') return res.status(200).json({ message: 'Statut non complete, ignore' });
    const carteRef = db.collection('cartes').doc(slug);
    const carteSnap = await carteRef.get();
    if (!carteSnap.exists) return res.status(404).json({ error: 'Carte introuvable' });
    if (carteSnap.data().owner_token !== owner_token) return res.status(403).json({ error: 'Token invalide' });
    const now = new Date();
    const updateData = { plan: plan === 'lifetime' ? 'lifetime' : 'pro', plan_activated_at: now, plan_source: 'paydunya' };
    if (plan === 'pro') { const expiry = new Date(now); expiry.setMonth(expiry.getMonth() + 1); updateData.plan_expire = expiry; }
    await carteRef.update(updateData);
    const totalAmount = body.total_amount || (body.data && body.data.total_amount) || 0;
    await db.collection('paiements').add({ slug: slug, plan: plan, amount: Number(totalAmount), payment_method: 'paydunya', paydunya_token: body.token || '', created_at: now.toISOString(), status: 'completed' });
    return res.status(200).json({ success: true, message: 'Plan ' + plan + ' active' });
  } catch (err) { console.error('IPN error:', err); return res.status(500).json({ error: 'Erreur serveur' }); }
};
