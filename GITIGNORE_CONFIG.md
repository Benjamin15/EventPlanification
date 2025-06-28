# 📋 Configuration .gitignore - Chalet Vibe

## ✅ Fichiers et Dossiers Exclus du Repository

### 🔧 **Dépendances et Build**
- `node_modules/` - Dépendances npm/yarn
- `__pycache__/` - Cache Python
- `build/` - Builds de production
- `dist/` - Distributions compilées
- `.expo/` - Cache Expo

### 📱 **Spécifique Mobile/React Native**
- `.expo/` - Fichiers Expo
- `.expo-shared/` - Configuration Expo partagée
- `*.jsbundle` - Bundles JavaScript
- iOS et Android builds

### 🐍 **Spécifique Python**
- `*.pyc` - Fichiers Python compilés
- `venv/`, `.venv/` - Environnements virtuels
- `*.egg-info/` - Packages Python
- Coverage et tests

### 🖼️ **Uploads et Médias**
- `uploads/**/*` - Tous les fichiers uploadés
- `*.jpg`, `*.png`, `*.gif`, `*.webp` - Images uploadées
- ⚠️ **Exception** : `.gitkeep` files gardés pour la structure

### 🔑 **Secrets et Configuration**
- `.env*` - Variables d'environnement
- `*.key`, `*.pem` - Certificats et clés
- `secrets.json` - Fichiers de secrets
- `config.local.json` - Configurations locales

### 💻 **IDE et Editeurs**
- `.vscode/` - Configuration VS Code (sauf settings partagés)
- `.idea/` - Configuration IntelliJ
- `*.sublime-*` - Configuration Sublime Text

### 🗃️ **Bases de Données** (Partiellement)
- `test.db` - Bases de données de test
- `*.dump`, `*.sql` - Dumps de DB
- ⚠️ **Exception** : `chalet_vibe.db` gardée pour le développement

### 🧪 **Tests et Coverage**
- `coverage/` - Rapports de couverture
- `.pytest_cache/` - Cache pytest
- `htmlcov/` - Rapports HTML

### 📝 **Documentation Temporaire**
- `TODO.md`, `NOTES.md`, `SCRATCH.md`
- `*.backup`, `*.bak` - Fichiers de sauvegarde

## 🏗️ **Structure Préservée avec .gitkeep**

```
server/uploads/.gitkeep              # Structure uploads
server/uploads/event_images/.gitkeep # Structure images
shared/.gitkeep                      # Dossier partagé web/mobile
```

## ✅ **Fichiers Inclus dans le Repository**

### 📄 **Code Source**
- Tous les fichiers `.js`, `.jsx`, `.ts`, `.tsx`
- Tous les fichiers `.py`
- Fichiers `.css`

### 📋 **Configuration**
- `package.json`, `tsconfig.json`
- `requirements.txt`
- `app.json` (Expo)

### 🗃️ **Base de Données de Développement**
- `chalet_vibe.db` - Base de données SQLite pour le développement

### 📚 **Documentation**
- `README.md`
- `DEVELOPMENT_STATUS.md`
- `INTEGRATION_COMPLETE.md`
- `SESSION_COMPLETE.md`

### 🛠️ **Scripts**
- `start.sh` - Script de démarrage
- `test_api.py` - Tests API
- `test_integration.sh` - Tests d'intégration

## 🎯 **Objectifs de cette Configuration**

1. **🔒 Sécurité** : Exclure secrets, clés, variables d'environnement
2. **⚡ Performance** : Éviter les gros dossiers (`node_modules`, builds)
3. **🧹 Propreté** : Exclure cache, temporaires, logs
4. **👥 Collaboration** : Garder seule la configuration nécessaire
5. **📱 Multi-plateforme** : Support React Native + Web + Python

Cette configuration garantit un repository propre, sécurisé et facilement clonnable pour tous les développeurs.
