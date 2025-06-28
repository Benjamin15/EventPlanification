# Chalet Vibe - Gestionnaire de Weekends en Chalet

Une application mobile et web pour organiser des weekends en chalet entre amis.

## Structure du Projet

```
chalet_vibe_coding/
├── mobile/          # Application React Native (iOS/Android)
├── web/            # Application web React
├── server/         # API Python FastAPI
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
