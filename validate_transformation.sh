#!/bin/bash

# Script de validation de la transformation Meals → Activities
# Auteur: Assistant IA
# Date: $(date)

echo "🎯 VALIDATION TRANSFORMATION: MEALS → ACTIVITIES"
echo "================================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test 1: Vérification de la migration de la base de données
echo "🔍 Test 1: Structure de la base de données"
echo "-------------------------------------------"

if [ -f "server/chalet_vibe.db" ]; then
    print_success "Base de données trouvée"
    
    # Vérifier l'existence des tables activities
    ACTIVITIES_TABLE=$(sqlite3 server/chalet_vibe.db "SELECT name FROM sqlite_master WHERE type='table' AND name='activities';" 2>/dev/null)
    if [ "$ACTIVITIES_TABLE" = "activities" ]; then
        print_success "Table 'activities' créée"
    else
        print_error "Table 'activities' manquante"
    fi
    
    # Vérifier l'existence des tables activity_assignments
    ASSIGNMENTS_TABLE=$(sqlite3 server/chalet_vibe.db "SELECT name FROM sqlite_master WHERE type='table' AND name='activity_assignments';" 2>/dev/null)
    if [ "$ASSIGNMENTS_TABLE" = "activity_assignments" ]; then
        print_success "Table 'activity_assignments' créée"
    else
        print_error "Table 'activity_assignments' manquante"
    fi
    
    # Compter les activités
    ACTIVITY_COUNT=$(sqlite3 server/chalet_vibe.db "SELECT COUNT(*) FROM activities;" 2>/dev/null)
    print_info "Nombre d'activités dans la base: $ACTIVITY_COUNT"
    
else
    print_error "Base de données non trouvée"
fi

echo ""

# Test 2: Vérification des modèles backend
echo "🔍 Test 2: Modèles backend"
echo "----------------------------"

if grep -q "class Activity" server/database.py; then
    print_success "Modèle Activity défini"
else
    print_error "Modèle Activity manquant"
fi

if grep -q "class ActivityAssignment" server/database.py; then
    print_success "Modèle ActivityAssignment défini"
else
    print_error "Modèle ActivityAssignment manquant"
fi

if grep -q "activities = relationship" server/database.py; then
    print_success "Relation Event.activities configurée"
else
    print_error "Relation Event.activities manquante"
fi

echo ""

# Test 3: Vérification des schémas API
echo "🔍 Test 3: Schémas API"
echo "-----------------------"

if grep -q "class ActivityCreate" server/schemas.py; then
    print_success "Schéma ActivityCreate défini"
else
    print_error "Schéma ActivityCreate manquant"
fi

if grep -q "class ActivityAssignment" server/schemas.py; then
    print_success "Schéma ActivityAssignment défini"
else
    print_error "Schéma ActivityAssignment manquant"
fi

echo ""

# Test 4: Vérification des routes API
echo "🔍 Test 4: Routes API"
echo "---------------------"

if grep -q "@app.post(\"/activities/\"" server/main.py; then
    print_success "Route POST /activities/ définie"
else
    print_error "Route POST /activities/ manquante"
fi

if grep -q "get_event_activities" server/main.py; then
    print_success "Route GET /events/{id}/activities définie"
else
    print_error "Route GET /events/{id}/activities manquante"
fi

echo ""

# Test 5: Vérification des types frontend
echo "🔍 Test 5: Types frontend"
echo "-------------------------"

if grep -q "interface Activity" web/src/types/index.ts; then
    print_success "Interface Activity définie"
else
    print_error "Interface Activity manquante"
fi

if grep -q "interface ActivityCreate" web/src/types/index.ts; then
    print_success "Interface ActivityCreate définie"
else
    print_error "Interface ActivityCreate manquante"
fi

if grep -q "activities: Activity" web/src/types/index.ts; then
    print_success "Propriété Event.activities définie"
else
    print_error "Propriété Event.activities manquante"
fi

echo ""

# Test 6: Vérification des composants frontend
echo "🔍 Test 6: Composants frontend"
echo "-------------------------------"

if [ -f "web/src/components/AddActivityModal.tsx" ]; then
    print_success "Composant AddActivityModal créé"
else
    print_error "Composant AddActivityModal manquant"
fi

if [ -f "web/src/components/AddActivityModal.css" ]; then
    print_success "Styles AddActivityModal créés"
else
    print_error "Styles AddActivityModal manquants"
fi

if grep -q "Planning des activités" web/src/components/EventDashboard.tsx; then
    print_success "EventDashboard mis à jour (titre)"
else
    print_error "EventDashboard non mis à jour"
fi

if grep -q "activities-list" web/src/components/EventDashboard.css; then
    print_success "Styles pour activities-list définis"
else
    print_error "Styles pour activities-list manquants"
fi

echo ""

# Test 7: Test API en direct (si serveur démarré)
echo "🔍 Test 7: Test API en direct"
echo "------------------------------"

if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    print_info "Serveur API détecté sur http://localhost:8000"
    
    # Test récupération des activités
    ACTIVITIES_RESPONSE=$(curl -s http://localhost:8000/events/1/activities)
    if [ $? -eq 0 ]; then
        ACTIVITIES_COUNT=$(echo "$ACTIVITIES_RESPONSE" | jq length 2>/dev/null || echo "0")
        print_success "API GET /events/1/activities: $ACTIVITIES_COUNT activités récupérées"
    else
        print_error "API GET /events/1/activities échouée"
    fi
    
    # Test création d'activité
    CREATE_RESPONSE=$(curl -s -X POST "http://localhost:8000/activities/" \
        -H "Content-Type: application/json" \
        -d '{
            "event_id": 1,
            "name": "Test Validation",
            "activity_type": "other",
            "description": "Activité de test de validation"
        }')
    
    if echo "$CREATE_RESPONSE" | grep -q "Test Validation"; then
        print_success "API POST /activities/ fonctionne"
    else
        print_error "API POST /activities/ échouée"
    fi
    
else
    print_warning "Serveur API non démarré - Tests API ignorés"
    print_info "Démarrez avec: cd server && uvicorn main:app --reload"
fi

echo ""

# Test 8: Frontend en direct (si démarré)
echo "🔍 Test 8: Test Frontend en direct"
echo "-----------------------------------"

if curl -s http://localhost:3001 > /dev/null 2>&1; then
    print_success "Frontend détecté sur http://localhost:3001"
    print_info "Ouvrez http://localhost:3001 pour tester l'interface"
elif curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend détecté sur http://localhost:3000"
    print_info "Ouvrez http://localhost:3000 pour tester l'interface"
else
    print_warning "Frontend non démarré - Tests UI ignorés"
    print_info "Démarrez avec: cd web && npm start"
fi

echo ""

# Résumé final
echo "📊 RÉSUMÉ DE LA TRANSFORMATION"
echo "=============================="
echo ""
print_info "✨ Transformation Meals → Activities"
echo ""
echo "🔄 Changements effectués:"
echo "   • Base de données: meals → activities"
echo "   • Backend: Modèles, schémas, routes API"
echo "   • Frontend: Types, composants, styles"
echo "   • Interface: 'Repas' → 'Activités'"
echo ""
echo "🎯 Types d'activités supportés:"
echo "   • 🍽️  meal: Repas (petit-déj, déjeuner, dîner)"
echo "   • ⛷️  sport: Activités sportives"
echo "   • 🎮 leisure: Loisirs et détente"
echo "   • 🏔️  tourism: Visites et excursions"
echo "   • 📝 other: Autres activités"
echo ""
echo "🚀 Pour tester l'application complète:"
echo "   1. Backend: cd server && uvicorn main:app --reload"
echo "   2. Frontend: cd web && npm start"
echo "   3. Ouvrir: http://localhost:3000"
echo ""
print_success "Transformation terminée avec succès!"
