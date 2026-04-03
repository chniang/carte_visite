# CLAUDE.md — CarteViz SaaS

## Contexte projet
Plateforme SaaS de cartes de visite numériques ciblant le marché sénégalais et africain.
Un professionnel crée sa carte en 2 minutes, reçoit un lien personnalisé et le partage par WhatsApp.

## Structure des fichiers
- `index_saas.html` : landing page + formulaire de création de carte
- `carte.html` : page publique de la carte + dashboard analytics (owner)
- `paiement.html` : page de choix de plan (Gratuit / Pro / À vie)
- `merci.html` : page de confirmation après paiement
- `images/` : assets visuels
- `CLAUDE.md` : ce fichier

## Stack technique
- Frontend : HTML/CSS/JS vanilla
- Base de données : Firebase Firestore (projet: carteviz, région: europe-west1)
- Hébergement frontend : GitHub Pages
- Hébergement backend : Vercel (carteviz-backend.vercel.app)
- Fonts : Plus Jakarta Sans + DM Sans (Google Fonts)
- Thème : violet/indigo — bg #0a0a14, accent #a78bfa
- Paiement : PayTech (Wave + Orange Money + Carte bancaire)
- Géolocalisation visiteurs : ipapi.co
- QR Code : qrcodejs (CDN Cloudflare)

## Firebase
- Projet ID : carteviz
- App ID : 1:891996442394:web:8558489da54b398cdf66a3
- Clé API : AIzaSyDZbf0-9QLpk0fqQhgKas0d-PbqpPZHfw8 (restreinte à chniang.github.io + 127.0.0.1:5501)
- Collections : cartes/{slug} + visites/{auto-id}
- Index : visites — slug ASC + timestamp DESC

## Backend Vercel
- URL : https://carteviz-backend.vercel.app
- api/create-payment.js : initie la transaction PayTech
- api/ipn-callback.js : confirme paiement + met à jour Firestore
- Variables d'env : PAYTECH_API_KEY, PAYTECH_API_SECRET

## Modèle de revenus
- Gratuit : carte + URL + QR code + compteur vues
- Pro : 5 000 FCFA/mois — dashboard analytics + personnalisation thème
- À vie : 25 000 FCFA — tout Pro + accès illimité

## URLs production
- Landing : https://chniang.github.io/carte_visite/index_saas.html
- Carte publique : https://chniang.github.io/carte_visite/carte.html?slug=cheikh-niang
- Carte owner : https://chniang.github.io/carte_visite/carte.html?slug=cheikh-niang&owner=TOKEN
- Paiement : https://chniang.github.io/carte_visite/paiement.html?slug=cheikh-niang&owner=TOKEN

## Règles importantes
1. Toujours modifier les HTML via scripts Python patch (jamais remplacement direct)
2. Photos stockées en base64 compressé 300x300px JPEG 0.7 (Firebase Storage indisponible)
3. Dashboard accessible via &owner=TOKEN uniquement
4. Clés PayTech uniquement dans les variables d'env Vercel
5. vercel.json doit être généré via Python (encodage PowerShell défaillant)

## Commandes utiles
```powershell
# Aller dans le projet
cd C:\Users\Lenovo\Desktop\carte_visite

# Pousser sur GitHub
git add .
git commit -m "message"
git push

# Exécuter un patch depuis Téléchargements
python C:\Users\Lenovo\Downloads\nom_du_patch.py

# Aller dans le backend
cd C:\Users\Lenovo\Desktop\carteviz-backend

# Redéployer le backend
npx vercel --prod
```

## Phase actuelle
Phase 2 terminée ✅
Phase 3 à venir : multi-cartes, API REST, analytics Looker Studio
