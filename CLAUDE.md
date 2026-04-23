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
- Fonts : Plus Jakarta Sans + DM Sans (hébergées localement dans /fonts/)
- Thème : violet/indigo — bg #0a0a14, accent #a78bfa
- Paiement : PayTech (Wave + Orange Money + Carte bancaire)
- Géolocalisation visiteurs : ipapi.co (lazy, cache sessionStorage)
- QR Code : qrcodejs (CDN Cloudflare)
- Stockage photos : Supabase Storage (bucket "photos", projet xpdfwsirpdmmpxeqkpuj, eu-west-1)

## Firebase
- Projet ID : carteviz
- App ID : 1:891996442394:web:8558489da54b398cdf66a3
- Clé API : AIzaSyDZbf0-9QLpk0fqQhgKas0d-PbqpPZHfw8 (restreinte à chniang.github.io + 127.0.0.1:5501)
- Collections : cartes/{slug} + visites/{auto-id}
- Index : visites — slug ASC + timestamp DESC

## Structure document Firestore cartes/{slug}
- prenom, nom, titre, bio, tel, email, lieu
- services: [] — liste des services
- services_descriptions: {} — descriptions personnalisées par service (Pro)
- liens: [{type, url}] — réseaux sociaux
- photo: URL Supabase Storage (ex: https://xpdfwsirpdmmpxeqkpuj.supabase.co/storage/v1/object/public/photos/...) ou base64 fallback
- owner_token: string — token secret propriétaire
- vues: number
- clics_whatsapp: number
- plan: "free" | "pro" | "lifetime"
- plan_expire: timestamp
- plan_activated_at: timestamp
- theme_color: string — couleur accent choisie (Pro)
- createdAt: timestamp

## Backend Vercel
- URL : https://carteviz-backend.vercel.app
- api/create-payment.js : initie la transaction PayTech
- api/ipn-callback.js : confirme paiement + met à jour Firestore (HMAC vérifié)
- api/upload-photo.js : reçoit base64, upload vers Supabase Storage, retourne URL publique
- Variables d'env : PAYTECH_API_KEY, PAYTECH_API_SECRET, FIREBASE_API_KEY, PRODUCTION_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY

## Variables Vercel backend (ne jamais committer les valeurs secrètes)
- PRODUCTION_URL = https://carteviz-backend.vercel.app
- FIREBASE_API_KEY = AIzaSyDZbf0-9QLpk0fqQhgKas0d-PbqpPZHfw8
- SUPABASE_URL = https://xpdfwsirpdmmpxeqkpuj.supabase.co
- SUPABASE_SERVICE_KEY = [voir Supabase Dashboard → Settings → API → service_role]
- PAYTECH_API_KEY = [voir dashboard paytech.sn]
- PAYTECH_API_SECRET = [voir dashboard paytech.sn]

## Modèle de revenus
- Gratuit : carte + URL + QR code + compteur vues
- Pro : 5 000 FCFA/mois — dashboard analytics + personnalisation thème + modal service + descriptions
- À vie : 25 000 FCFA — tout Pro + accès illimité

## Features Pro
1. Dashboard analytics (vues, clics, appareils, sources, pays)
2. Personnalisation couleur thème (8 couleurs)
3. Modal service au clic — description + bouton WhatsApp commander
4. Personnalisation descriptions de services
- Toutes les features Pro nécessitent owner_token valide dans l'URL

## URLs production
- Landing : https://chniang.github.io/carte_visite/index_saas.html
- Carte publique : https://chniang.github.io/carte_visite/carte.html?slug=cheikh-niang
- Carte owner : https://chniang.github.io/carte_visite/carte.html?slug=cheikh-niang&owner=TOKEN
- Paiement : https://chniang.github.io/carte_visite/paiement.html?slug=cheikh-niang&owner=TOKEN

## Règles importantes
1. Toujours modifier les HTML via scripts Python patch (jamais remplacement direct)
2. Photos uploadées via api/upload-photo.js → Supabase Storage → URL stockée dans Firestore. Fallback base64 si Supabase indisponible.
3. Dashboard et features Pro accessibles via &owner=TOKEN uniquement
4. Token validé côté client : owner === d.owner_token
5. Clés secrètes (PayTech, Supabase, Firebase) uniquement dans les variables d'env Vercel — jamais dans le code
6. vercel.json doit être généré via Python (encodage PowerShell défaillant)
7. Pas d'apostrophes simples dans les strings JS — utiliser guillemets doubles ou unicode
8. Firestore rules déployées : plan/plan_expire/owner_token non modifiables côté client

## Commandes utiles
```powershell
# Aller dans le projet
cd C:\Users\Lenovo\Desktop\carte_visite

# Pousser sur GitHub
git add .
git commit -m 'message'
git push

# Exécuter un patch depuis Téléchargements
python C:\Users\Lenovo\Downloads\nom_du_patch.py

# Aller dans le backend
cd C:\Users\Lenovo\Desktop\carteviz-backend

# Redéployer le backend
npx vercel --prod
```

## Phase actuelle
Phase 2 terminée ✅ — Phase 3 en cours

### État
- Migration photos : Supabase Storage (bucket "photos", projet xpdfwsirpdmmpxeqkpuj, eu-west-1) ✅
- Firestore sécurisé : rules déployées, cartes de test supprimées ✅
- Carte cheikh-niang active (owner URL : carte.html?slug=cheikh-niang&owner=8rtxla0w9grq4860)
- PayTech mode TEST — activation production prochaine (recharger 10 000 FCFA)
- Domaine carteviz.sn — achat prévu prochainement (~15 000 FCFA)

### Ce qui reste (Phase 3)
1. Activer PayTech production (recharger solde 10 000 FCFA)
2. Acheter domaine carteviz.sn
3. Migration Vercel + domaine custom
4. Multi-cartes, API REST, analytics Looker Studio

## PayTech
- Compte Business créé sur paytech.sn
- Solde : -10 000 FCFA (frais inscription à payer avant activation production)
- Mode test actif — transactions réelles bloquées jusqu'au rechargement
- URLs configurées dans dashboard PayTech :
  - IPN : https://carteviz-backend.vercel.app/api/ipn-callback
  - Succès : https://chniang.github.io/carte_visite/merci.html
  - Annulation : https://chniang.github.io/carte_visite/paiement.html
