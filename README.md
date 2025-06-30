# 🚀 Event Planification - Application de Gestion d'Événements

## 📖 Description

Application web et mobile complète pour la planification et gestion d'événements de type weekend au chalet. Permet de gérer les participants, les activités, le shopping, le transport et le budget de manière collaborative.

## ✨ Fonctionnalités Principales

### 🌐 Application Web
- **Gestion des participants** : Ajout, modification, suppression
- **Planning d'activités** : Organisation par jour avec descriptions
- **Liste de shopping** : Gestion collaborative des achats
- **Transport** : Organisation des voitures et covoiturage
- **Budget** : Calcul automatique des coûts et équilibrage

### 📱 Application Mobile (React Native)
- **Interface responsive** adaptée aux smartphones
- **Création d'événements** directement depuis mobile
- **Navigation intuitive** avec onglets
- **Synchronisation** avec l'API backend

### 🔧 Backend API (FastAPI)
- **API RESTful** complète
- **Base de données** SQLite avec gestion des relations
- **CORS** configuré pour web/mobile
- **Documentation** automatique Swagger

## 🛠️ Technologies Utilisées

- **Frontend Web** : React.js, CSS3, HTML5
- **Mobile** : React Native, Expo
- **Backend** : Python FastAPI, SQLAlchemy
- **Base de données** : SQLite
- **Outils** : Git, Semantic Release

## 📁 Structure du Projet

```
├── web/                 # Application web React
├── mobile/             # Application mobile React Native  
├── backend/            # API FastAPI (anciennement server/)
├── docs/              # Documentation et rapports
└── scripts/           # Scripts de démonstration et tests
```

## 🚀 Installation et Lancement

### Prérequis
- Node.js (v14+)
- Python (v3.8+)
- Git

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Application Web
```bash
cd web
npm install
npm start
# Accessible sur http://localhost:3000
```

### Application Mobile
```bash
cd mobile
npm install
npx expo start
# Accessible sur http://localhost:8083
```

## 📊 Semantic Release

Ce projet utilise les conventions de [Semantic Release](https://semantic-release.gitbook.io/semantic-release/) :

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug  
- `docs:` - Documentation
- `style:` - Formatage, style
- `refactor:` - Refactoring de code
- `test:` - Ajout de tests
- `chore:` - Maintenance

## 🎯 Roadmap

- [ ] Notifications push mobile
- [ ] Synchronisation offline
- [ ] Intégration calendrier
- [ ] Export PDF des plannings
- [ ] Système d'authentification avancé

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 👥 Contributeurs

- Benjamin - Développeur principal

---

*Application développée pour simplifier l'organisation d'événements entre amis et en famille.* 🏔️
└── shared/         # Types et utilitaires partagés
```

## Fonctionnalités

- 🔗 Connexion à un événement avec son nom
- 📅 Calendrier des repas collaboratif
- 🛒 Liste de courses avec prix
- 🏠 Informations sur le chalet (photos, lien, localisation)
- 🚗 Gestion du transport (voitures, immatriculation, passagers)
- 💰 Calcul automatique des prix par personne

## Installation

### Serveur Python
```bash
cd server
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python main.py
```

### Application Mobile
```bash
cd mobile
npm install
npx expo start
```

### Application Web
```bash
cd web
npm install
npm start
```

## API

Le serveur expose une API REST sur http://localhost:8000
Documentation interactive : http://localhost:8000/docs
