# CLAUDE.md — CarteViz SaaS

## Contexte projet
Plateforme SaaS de cartes de visite numériques ciblant le marché sénégalais et africain.
Un professionnel crée sa carte en 2 minutes, reçoit un lien personnalisé et le partage par WhatsApp.

## Structure des fichiers
- `index_saas.html` : landing page + formulaire de création de carte
- `carte.html` : page publique de la carte + dashboard analytics (owner)
- `paiement.html` : page de choix de plan (Gratuit / Pro / À vie)
- `merci.html` : page de confirmation après paiement
- `admin.html` : tableau de bord admin interne (KPIs, revenus, liste cartes)
- `images/` : assets visuels
- `CLAUDE.md` : ce fichier

## Stack technique
- Frontend : HTML/CSS/JS vanilla
- Base de données : Firebase Firestore (projet: carteviz, région: europe-west1)
- Hébergement frontend : GitHub Pages
- Hébergement backend : Vercel (carteviz-backend.vercel.app)
- Fonts : Plus Jakarta Sans + DM Sans (hébergées localement dans /fonts/)
- Thème : violet/indigo — bg #0a0a14, accent #a78bfa
- Paiement : Wave manuel (PayTech abandonné — nécessite RCCM/NINEA)
- Géolocalisation visiteurs : ipapi.co (lazy, cache sessionStorage)
- QR Code : qrcodejs (CDN Cloudflare)
- Stockage photos : Supabase Storage (bucket "photos", projet xpdfwsirpdmmpxeqkpuj, eu-west-1)

## Firebase
- Projet ID : carteviz
- App ID : 1:891996442394:web:8558489da54b398cdf66a3
- Clé API : AIzaSyDZbf0-9QLpk0fqQhgKas0d-PbqpPZHfw8 (restreinte à chniang.github.io + 127.0.0.1:5501)
- Collections : cartes/{slug} + visites/{auto-id}
- Index : visites — slug ASC + timestamp DESC
- Service account : C:\Users\Lenovo\Downloads\carteviz-service-account.json

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
- api/create-payment.js : initie la transaction PayTech (mode test)
- api/ipn-callback.js : confirme paiement + met à jour Firestore (HMAC vérifié)
- api/upload-photo.js : reçoit base64, upload vers Supabase Storage, retourne URL publique
- api/ai-chat.js : assistant IA analytique (Claude Haiku) pour admin
- Variables d'env : PAYTECH_API_KEY, PAYTECH_API_SECRET, FIREBASE_API_KEY, PRODUCTION_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY

## Variables Vercel backend (ne jamais committer les valeurs secrètes)
- PRODUCTION_URL = https://carteviz-backend.vercel.app
- FIREBASE_API_KEY = AIzaSyDZbf0-9QLpk0fqQhgKas0d-PbqpPZHfw8
- SUPABASE_URL = https://xpdfwsirpdmmpxeqkpuj.supabase.co
- SUPABASE_SERVICE_KEY = [voir Supabase Dashboard → Settings → API → service_role]
- PAYTECH_API_KEY = [voir dashboard paytech.sn]
- PAYTECH_API_SECRET = [voir dashboard paytech.sn]

## Infos techniques importantes
- Firebase Storage inaccessible (conflit région europe-west1 vs US gratuit) → photos en Supabase
- Clé Firebase restreinte à chniang.github.io/* et 127.0.0.1:5501/*
- GitHub Pages → URLs avec ?slug= query parameter
- PayTech nécessite RCCM/NINEA → remplacé par Wave manuel + activation script Python
- Vercel team : chniangs-projects / team_C9yry5MqrskCA5YMGRbba3hd
- Vercel projet backend : prj_pRkTiNAbs8Mi61mNDTca0ArurTOO
- Cloudflare Account ID : 837c374a4ccbd5978556aac2fe9b69bd (Images payant, non utilisé)
- Supabase org : uveexngqecxlgvensqwo
- Token admin : carteviz_admin_2025

## Modèle de revenus
- Gratuit : carte + URL + QR code + compteur vues
- Pro : 2 500 FCFA/mois — dashboard analytics + personnalisation thème + modal service + descriptions
- À vie : 15 000 FCFA — tout Pro + accès illimité

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

## Activation manuelle d'un plan (Wave)
Quand un client paie par Wave/WhatsApp, utiliser :
```
python C:\Users\Lenovo\Downloads\activer_plan.py
```
- Demande le slug + plan (mensuel/lifetime)
- Met à jour Firestore automatiquement via service account
- Affiche l'URL owner à envoyer au client

## Règles de travail ABSOLUES
1. Jamais d'édition directe VSCode — toujours scripts Python patch pour HTML
2. Apostrophes typographiques dans les strings JS = erreur fatale → guillemets doubles ou unicode
3. Commits après chaque feature stable
4. Claude Code peut exécuter directement via son terminal intégré
5. Jamais de remplacement direct de fichiers HTML
6. vercel.json doit être généré via Python (encodage PowerShell défaillant)
7. Firestore rules déployées : plan/plan_expire/owner_token non modifiables côté client

## Commandes utiles
```bash
# Pousser sur GitHub
git add .
git commit -m "message"
git push

# Activer un plan manuellement (client Wave)
python C:\Users\Lenovo\Downloads\activer_plan.py

# Exécuter un patch HTML
python C:\Users\Lenovo\Downloads\nom_du_patch.py

# Redéployer le backend
cd C:\Users\Lenovo\Desktop\carteviz-backend
npx vercel --prod
```

## Phase actuelle
Phase 2 terminée ✅ — Phase 3 en cours

### État
- Migration photos : Supabase Storage (bucket "photos", projet xpdfwsirpdmmpxeqkpuj, eu-west-1) ✅
- Firestore sécurisé : rules déployées, cartes de test supprimées ✅
- Carte cheikh-niang active (owner URL : carte.html?slug=cheikh-niang&owner=8rtxla0w9grq4860)
- PayTech abandonné (nécessite RCCM/NINEA) → Wave manuel + script activation ✅
- Admin dashboard : KPIs + revenus + liste cartes + IA analytique ✅
- Script activation plan : C:\Users\Lenovo\Downloads\activer_plan.py ✅

### Ce qui reste (Phase 3)
1. **Obtenir NINEA** (entrepreneur individuel, DGE Dakar, gratuit) → débloque PayDunya
2. **Intégrer PayDunya** → Wave + Orange Money + carte bancaire automatique
3. **Acheter domaine carteviz.sn** (~50 000 FCFA avec RCCM)
4. **Migration Vercel + domaine custom**
5. **Multi-cartes équipes**
6. **Phase 4** : déclencher quand 10 clients actifs

## PayTech (suspendu)
- Compte Business créé sur paytech.sn
- Nécessite RCCM/NINEA — remplacé par Wave manuel en attendant NINEA
- Mode test uniquement — transactions réelles bloquées
