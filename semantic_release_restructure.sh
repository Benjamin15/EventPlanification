#!/bin/bash

echo "🚀 RESTRUCTURATION GIT AVEC SEMANTIC RELEASE"
echo "============================================="

cd /Users/ben/workspace/chalet_vibe_coding

# Sauvegarde de l'état actuel
echo "📋 Sauvegarde de l'état actuel..."
git branch backup-$(date +%Y%m%d-%H%M%S)

# Créer un nouveau commit squashé avec tout le travail
echo "🔄 Création d'un historique clean..."

# Reset au premier commit et créer un historique propre
git reset --soft $(git rev-list --max-parents=0 HEAD)

# Créer des commits logiques par fonctionnalité
echo "📝 Création des commits semantic release..."

# Commit 1: Infrastructure de base
git add web/src/components/ web/src/App.js web/src/App.css
git commit -m "feat: initialize event planning web application

- Add core event dashboard with participant management
- Implement shopping list functionality
- Add transport and accommodation features
- Setup React application structure

BREAKING CHANGE: Initial application setup"

# Commit 2: Application mobile
git add mobile/
git commit -m "feat: add mobile React Native application

- Implement mobile version of event planning app
- Add cross-platform compatibility
- Include all web features in mobile interface
- Setup mobile navigation and components"

# Commit 3: Backend API
git add backend/
git commit -m "feat: implement REST API backend

- Add FastAPI server for event management
- Implement database models and endpoints
- Add CORS configuration for web/mobile clients
- Include participant and event CRUD operations"

# Commit 4: Documentation et configuration
git add *.md *.html *.py *.sh
git commit -m "docs: add comprehensive documentation and setup scripts

- Include user guides and implementation reports
- Add demo scripts for feature testing
- Document API endpoints and usage
- Provide setup and deployment instructions"

# Commit 5: Corrections et améliorations récentes
git add .
git commit -m "fix(mobile): resolve ScrollView layout issues

- Fix ScrollView contentContainerStyle prop usage
- Improve event creation form ergonomics
- Enhance mobile interface responsiveness
- Resolve React Native layout warnings"

echo "✅ Historique restructuré avec semantic release!"
echo "📊 Nouveaux commits:"
git log --oneline -5
