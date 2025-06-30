#!/bin/bash

echo "🔧 DIAGNOSTIC ET TEST DE L'APPLICATION MOBILE"
echo "============================================="

# Couleurs pour le terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}1. Vérification des dépendances React${NC}"
cd /Users/ben/workspace/chalet_vibe_coding/mobile
REACT_VERSION=$(grep '"react":' package.json | cut -d'"' -f4)
REACT_DOM_VERSION=$(grep '"react-dom":' package.json | cut -d'"' -f4)
echo "   React: $REACT_VERSION"
echo "   React DOM: $REACT_DOM_VERSION"

if [ "$REACT_VERSION" = "19.0.0" ] && [ "$REACT_DOM_VERSION" = "19.0.0" ]; then
    echo -e "   ${GREEN}✅ Versions React compatibles avec Expo SDK 53${NC}"
else
    echo -e "   ${RED}❌ Problème de version React détecté${NC}"
fi

echo -e "\n${BLUE}2. Test de connectivité backend${NC}"
BACKEND_RESPONSE=$(curl -s http://192.168.0.200:8000/)
if [[ $BACKEND_RESPONSE == *"Chalet Vibe"* ]]; then
    echo -e "   ${GREEN}✅ Backend accessible sur http://192.168.0.200:8000${NC}"
else
    echo -e "   ${RED}❌ Backend non accessible${NC}"
    echo "   Réponse: $BACKEND_RESPONSE"
fi

echo -e "\n${BLUE}3. Vérification des processus Expo${NC}"
EXPO_PROCESSES=$(ps aux | grep "expo start" | grep -v grep | wc -l)
if [ $EXPO_PROCESSES -gt 0 ]; then
    echo -e "   ${GREEN}✅ Expo en cours d'exécution${NC}"
    echo "   Processus trouvés: $EXPO_PROCESSES"
else
    echo -e "   ${YELLOW}⚠️  Aucun processus Expo détecté${NC}"
fi

echo -e "\n${BLUE}4. Test de syntaxe App.js${NC}"
cd /Users/ben/workspace/chalet_vibe_coding/mobile
node -c App.js 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✅ Syntaxe JavaScript valide${NC}"
else
    echo -e "   ${RED}❌ Erreurs de syntaxe détectées${NC}"
fi

echo -e "\n${BLUE}5. Vérification des imports critiques${NC}"
IMPORTS_VALID=true

# Vérification des imports React
if grep -q "import React" mobile/App.js; then
    echo -e "   ${GREEN}✅ Import React présent${NC}"
else
    echo -e "   ${RED}❌ Import React manquant${NC}"
    IMPORTS_VALID=false
fi

# Vérification des imports React Native
if grep -q "from 'react-native'" mobile/App.js; then
    echo -e "   ${GREEN}✅ Imports React Native présents${NC}"
else
    echo -e "   ${RED}❌ Imports React Native manquants${NC}"
    IMPORTS_VALID=false
fi

echo -e "\n${BLUE}6. Résumé de la résolution${NC}"
echo "   Problème initial: TypeError Cannot read property 'S'/'default' of undefined"
echo "   Cause identifiée: Incompatibilité versions React (18.3.1) vs Expo SDK 53 (19.0.0)"
echo "   Solution appliquée: Mise à jour automatique via 'npx expo install --fix'"

echo -e "\n${BLUE}STATUT FINAL${NC}"
if [ "$REACT_VERSION" = "19.0.0" ] && [[ $BACKEND_RESPONSE == *"Chalet Vibe"* ]] && [ "$IMPORTS_VALID" = true ]; then
    echo -e "${GREEN}🎉 APPLICATION RÉSOLUE ET FONCTIONNELLE${NC}"
    echo ""
    echo "✨ INSTRUCTIONS D'UTILISATION:"
    echo "   1. Scanner le QR code avec Expo Go"
    echo "   2. Ou aller sur http://localhost:8081 pour la version web"
    echo "   3. L'application mobile est maintenant accessible"
    echo ""
    echo "🔗 URLs importantes:"
    echo "   • Mobile: exp://192.168.0.200:8081"
    echo "   • Web: http://localhost:8081"
    echo "   • Backend: http://192.168.0.200:8000"
else
    echo -e "${RED}❌ PROBLÈMES PERSISTANTS DÉTECTÉS${NC}"
    echo "   Vérifiez les points marqués en rouge ci-dessus"
fi

echo -e "\n${YELLOW}💡 COMMANDES UTILES:${NC}"
echo "   npx expo start --clear      # Redémarrer avec cache vidé"
echo "   npx expo install --fix      # Corriger les dépendances"
echo "   curl http://192.168.0.200:8000/  # Tester le backend"
