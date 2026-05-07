const admin = require('firebase-admin');
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://chniang.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { slug, plan, owner_token } = req.body || {};
  if (!slug || !plan || !owner_token) return res.status(400).json({ error: 'Parametres manquants' });
  const carteSnap = await db.collection('cartes').doc(slug).get();
  if (!carteSnap.exists) return res.status(404).json({ error: 'Carte introuvable' });
  if (carteSnap.data().owner_token !== owner_token) return res.status(403).json({ error: 'Token invalide' });
  const plans = { pro: { name: 'CarteViz Pro mensuel', amount: 2500 }, lifetime: { name: 'CarteViz A Vie', amount: 15000 } };
  const selectedPlan = plans[plan];
  if (!selectedPlan) return res.status(400).json({ error: 'Plan invalide' });
  const mode = process.env.PAYDUNYA_MODE || 'sandbox';
  const baseUrl = mode === 'live' ? 'https://app.paydunya.com/api/v1' : 'https://app.paydunya.com/sandbox-api/v1';
  try {
    const pdRes = await fetch(baseUrl + '/checkout-invoice/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY, 'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY, 'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN },
      body: JSON.stringify({
        invoice: { items: { item_0: { name: selectedPlan.name, quantity: 1, unit_price: selectedPlan.amount, total_price: selectedPlan.amount, description: 'Activation plan ' + plan + ' - ' + slug } }, total_amount: selectedPlan.amount, description: selectedPlan.name + ' pour ' + slug },
        store: { name: 'CarteViz', tagline: 'Cartes de visite numeriques', phone: '+221776362714', postal_address: 'Dakar, Senegal', website_url: 'https://chniang.github.io/carte_visite/' },
        actions: { cancel_url: 'https://chniang.github.io/carte_visite/paiement.html?slug=' + slug + '&owner=' + owner_token, return_url: 'https://chniang.github.io/carte_visite/merci.html?slug=' + slug + '&plan=' + plan, callback_url: 'https://carteviz-backend.vercel.app/api/ipn-callback' },
        custom_data: { slug: slug, plan: plan, owner_token: owner_token }
      })
    });
    const data = await pdRes.json();
    if (data.response_code === '00') return res.status(200).json({ success: true, redirect_url: data.invoice_url, token: data.token });
    return res.status(400).json({ error: data.response_text || 'Erreur PayDunya' });
  } catch (err) { console.error('create-payment error:', err); return res.status(500).json({ error: 'Erreur serveur' }); }
};
