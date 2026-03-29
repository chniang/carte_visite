# CLAUDE.md — carte_visite

## Contexte projet
Carte de visite numérique personnelle de Cheikh Niang, en cours de transformation en plateforme SaaS de génération de cartes de visite.

## Fichiers importants
- `index.html` : carte personnelle (version production)
- `images/` : toutes les images des services

## Conventions
- Encodage : UTF-8 strict
- Pas de CDN externe pour les assets critiques (CDN parfois bloqués depuis Dakar)
- QR code en base64 embarqué directement dans le HTML
- Images services : ml.jpg, nlp.jpg, data_viz.png, dashboard.gif, automatisation.jpg, web_scraping.jpg, site_web.png, portfolio.webp, carte_visite.png, script_python.jpg

## Stack
- Frontend : HTML/CSS/JS vanilla
- Fonts : Syne (titres) + DM Sans (corps) via Google Fonts
- Paiement futur : Wave API + Orange Money (pas Stripe)
- DB future : Firebase Firestore

## Commandes utiles
```powershell
# Ouvrir le projet
cd C:\Users\Lenovo\Desktop\carte_visite
code .

# Lancer Claude Code
claude

# Générer un QR code en base64
python -c "import qrcode,base64,io; ..."

# Pousser sur GitHub
git add . && git commit -m 'message' && git push
```

## Prochaine étape
Coder la page d'accueil du MVP SaaS avec formulaire de création de carte.
