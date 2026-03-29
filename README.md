# 🪪 CarteViz — Carte de visite numérique pour l'Afrique

> Créez votre carte de visite numérique professionnelle en 2 minutes.  
> Partagez-la par WhatsApp avec un lien personnalisé — sans rien imprimer.

---

## 🌍 À propos

**CarteViz** est un SaaS de cartes de visite numériques pensé pour le marché sénégalais et africain.  
Un client remplit un formulaire → une carte est générée automatiquement → il partage son lien `carteviz.com/prenom-nom`.

---

## ✨ Fonctionnalités MVP

- 📝 Formulaire de création avec prévisualisation en direct
- 🔗 URL personnalisée : `carteviz.com/prenom-nom`
- 📱 QR code téléchargeable en PNG
- 💬 Bouton WhatsApp avec message pré-rempli
- 👁️ Compteur de vues en temps réel
- 🌍 16 secteurs d'activité africains (Beauté, Commerce, BTP, Restauration, Religion...)
- ➕ Ajout de services personnalisés
- 🔥 Sauvegarde Firebase Firestore

---

## 🗂️ Structure du projet

```
carte_visite/
├── index_saas.html   ← Landing page + formulaire de création
├── carte.html        ← Page publique de la carte (lecture Firestore)
├── index.html        ← Carte personnelle de l'auteur
├── images/           ← Assets visuels
├── CLAUDE.md         ← Contexte de développement
└── README.md
```

---

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Frontend | HTML / CSS / JavaScript vanilla |
| Base de données | Firebase Firestore |
| Hébergement | GitHub Pages |
| Fonts | Plus Jakarta Sans + DM Sans |
| QR Code | qrcodejs (CDN) |

---

## 🚀 Lancer en local

1. Clone le repo
```bash
git clone https://github.com/chniang/carte_visite.git
cd carte_visite
```

2. Ouvre `index_saas.html` avec **Live Server** (VSCode)

3. Teste une carte :
```
http://127.0.0.1:5501/carte.html?slug=cheikh-niang
```

---

## 💰 Modèle de revenus

| Offre | Prix |
|---|---|
| Gratuit | 0 FCFA |
| Pro (mensuel) | 5 000 FCFA/mois |
| À vie | 25 000 FCFA |

Paiement via **Wave** et **Orange Money** (Phase 2).

---

## 🗺️ Roadmap

- [x] Phase 1 — MVP : formulaire, Firebase, page carte, QR code
- [ ] Phase 2 — Dashboard analytics, paiement Wave/Orange Money
- [ ] Phase 3 — API entreprise, multi-cartes, Looker Studio

---

## 👨‍💻 Auteur

**Cheikh Niang** — Data Scientist & Dev Python  
📍 Dakar, Sénégal  
🔗 [portfolio-cheikh-niang.vercel.app](https://portfolio-cheikh-niang.vercel.app)  
🐙 [@chniang](https://github.com/chniang)
