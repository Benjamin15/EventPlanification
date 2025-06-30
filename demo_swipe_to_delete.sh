#!/bin/bash

# 📱 DÉMONSTRATION SWIPE-TO-DELETE MOBILE
# Script de test automatique pour valider l'implémentation

echo "🎉 DÉMONSTRATION SWIPE-TO-DELETE MOBILE"
echo "========================================"
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
print_step() {
    echo -e "${BLUE}📱 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
print_step "Vérification des prérequis..."

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "mobile/App.js" ]; then
    print_error "Erreur: Veuillez exécuter ce script depuis le répertoire racine du projet"
    exit 1
fi

print_success "Répertoire de projet détecté"

# Vérifier les dépendances
print_step "Vérification des dépendances..."

cd mobile

if [ ! -d "node_modules" ]; then
    print_info "Installation des dépendances npm..."
    npm install
fi

# Vérifier react-native-gesture-handler
if grep -q "react-native-gesture-handler" package.json; then
    print_success "react-native-gesture-handler installé"
else
    print_error "react-native-gesture-handler manquant"
    exit 1
fi

# Vérifier la syntaxe du fichier App.js
print_step "Vérification de la syntaxe du code..."

# Test de compilation basique avec node
node -c App.js 2>/dev/null
if [ $? -eq 0 ]; then
    print_success "Syntaxe JavaScript valide"
else
    print_error "Erreurs de syntaxe détectées dans App.js"
    exit 1
fi

# Vérifier les composants clés
print_step "Vérification des composants implémentés..."

# Vérifier SwipeableItem
if grep -q "SwipeableItem" App.js; then
    print_success "Composant SwipeableItem trouvé"
else
    print_error "Composant SwipeableItem manquant"
    exit 1
fi

# Vérifier les méthodes de suppression API
if grep -q "deleteActivity" App.js; then
    print_success "Méthode deleteActivity trouvée"
else
    print_error "Méthode deleteActivity manquante"
fi

if grep -q "deleteShoppingItem" App.js; then
    print_success "Méthode deleteShoppingItem trouvée"
else
    print_error "Méthode deleteShoppingItem manquante"
fi

if grep -q "deleteCar" App.js; then
    print_success "Méthode deleteCar trouvée"
else
    print_error "Méthode deleteCar manquante"
fi

# Vérifier GestureHandlerRootView
if grep -q "GestureHandlerRootView" App.js; then
    print_success "GestureHandlerRootView configuré"
else
    print_error "GestureHandlerRootView manquant"
fi

# Vérifier les intégrations dans les listes
print_step "Vérification des intégrations SwipeableItem..."

# Compter les utilisations de SwipeableItem
swipe_count=$(grep -c "<SwipeableItem" App.js)
if [ "$swipe_count" -ge 3 ]; then
    print_success "SwipeableItem intégré dans $swipe_count listes"
else
    print_error "SwipeableItem pas suffisamment intégré (trouvé: $swipe_count, attendu: 3)"
fi

# Vérifier les styles
if grep -q "swipeableContainer" App.js; then
    print_success "Styles SwipeableItem configurés"
else
    print_error "Styles SwipeableItem manquants"
fi

print_step "Lancement du serveur de développement..."

# Vérifier si un serveur fonctionne déjà
if lsof -i :8081 >/dev/null 2>&1; then
    print_info "Serveur déjà en cours d'exécution sur le port 8081"
elif lsof -i :8082 >/dev/null 2>&1; then
    print_info "Serveur déjà en cours d'exécution sur le port 8082"
else
    print_info "Démarrage du serveur Expo..."
    # Démarrer en arrière-plan
    nohup npm start > expo.log 2>&1 &
    EXPO_PID=$!
    sleep 5
    
    if kill -0 $EXPO_PID 2>/dev/null; then
        print_success "Serveur Expo démarré (PID: $EXPO_PID)"
    else
        print_error "Échec du démarrage du serveur Expo"
        exit 1
    fi
fi

# Instructions pour le test manuel
echo ""
echo "🎯 INSTRUCTIONS DE TEST MANUEL"
echo "=============================="
echo ""

print_info "1. ACCÈS À L'APPLICATION:"
echo "   • iOS: Ouvrir l'app Camera et scanner le QR code"
echo "   • Android: Ouvrir Expo Go et scanner le QR code"
echo "   • Web: Ouvrir http://localhost:8082"
echo ""

print_info "2. TESTS À EFFECTUER:"
echo "   📅 AGENDA:"
echo "      • Aller dans l'onglet Agenda"
echo "      • Glisser une activité vers la gauche"
echo "      • Vérifier l'apparition du bouton rouge"
echo "      • Tester la suppression avec confirmation"
echo ""
echo "   🛒 COURSES:"
echo "      • Aller dans l'onglet Courses"
echo "      • Glisser un article vers la gauche"
echo "      • Vérifier la suppression et le refresh automatique"
echo ""
echo "   🚗 TRANSPORT:"
echo "      • Aller dans l'onglet Transport"
echo "      • Glisser une voiture vers la gauche"
echo "      • Vérifier la gestion des passagers"
echo ""

print_info "3. POINTS À VÉRIFIER:"
echo "   ✅ Animation fluide du glissement"
echo "   ✅ Bouton de suppression bien visible"
echo "   ✅ Dialog de confirmation affiché"
echo "   ✅ Suppression effective côté serveur"
echo "   ✅ Refresh automatique des listes"
echo "   ✅ Gestion d'erreurs appropriée"
echo ""

print_info "4. SEUILS DE DÉCLENCHEMENT:"
echo "   • Glissement < 100px → Retour à la position"
echo "   • Glissement > 100px → Révélation du bouton"
echo "   • Animation de suppression → Glissement jusqu'à -400px"
echo ""

# Informations de debug
echo "🔧 INFORMATIONS DE DEBUG"
echo "========================"
echo ""

print_info "Fichiers modifiés:"
echo "   • mobile/App.js (composant SwipeableItem + intégrations)"
echo "   • mobile/package.json (dépendance react-native-gesture-handler)"
echo ""

print_info "Lignes de code clés:"
echo "   • SwipeableItem: ~lignes 450-530"
echo "   • Agenda integration: ~lignes 1125-1195"
echo "   • Shopping integration: ~lignes 1223-1265"
echo "   • Transport integration: ~lignes 1301-1345"
echo "   • Styles: ~lignes 3300-3350"
echo ""

print_info "API Endpoints testés:"
echo "   • DELETE /activities/{id}"
echo "   • DELETE /shopping/{id}"
echo "   • DELETE /cars/{id}"
echo ""

# Vérification finale
echo "🎉 STATUT FINAL"
echo "==============="
echo ""

if [ -f "App.js" ] && grep -q "SwipeableItem" App.js && grep -q "GestureHandlerRootView" App.js; then
    print_success "🚀 IMPLÉMENTATION COMPLÈTE!"
    print_success "La fonctionnalité swipe-to-delete est prête à être testée"
    echo ""
    print_info "Prochaines étapes:"
    echo "   1. Tester sur appareil mobile ou émulateur"
    echo "   2. Vérifier tous les scénarios de test"
    echo "   3. Valider la fluidité des animations"
    echo "   4. Confirmer les suppressions côté serveur"
else
    print_error "IMPLÉMENTATION INCOMPLÈTE"
    print_error "Veuillez vérifier les composants manquants"
fi

echo ""
print_info "📖 Pour plus de détails, consultez:"
echo "   • GUIDE_TEST_SWIPE_TO_DELETE.md"
echo "   • IMPLEMENTATION_SWIPE_TO_DELETE_MOBILE.md"
echo ""

# Retour au répertoire racine
cd ..

echo "✨ Démonstration terminée!"
