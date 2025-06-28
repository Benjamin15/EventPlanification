#!/bin/bash

# Script de validation finale des améliorations de l'onglet Participants
# Date: 28 juin 2025

echo "🎯 VALIDATION FINALE - AMÉLIORATION ONGLET PARTICIPANTS"
echo "=================================================="
echo

# Vérifier que les serveurs sont en marche
echo "1️⃣ Vérification des serveurs..."

# Backend
if curl -s http://localhost:8000/events/ > /dev/null; then
    echo "✅ Backend accessible sur http://localhost:8000"
else
    echo "❌ Backend non accessible"
    exit 1
fi

# Frontend  
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend accessible sur http://localhost:3000"
else
    echo "❌ Frontend non accessible"
    exit 1
fi

echo

# Vérifier la structure des données
echo "2️⃣ Vérification des données de test..."

response=$(curl -s http://localhost:8000/events/1)
if echo "$response" | grep -q "participants"; then
    participants_count=$(echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(len(data.get('participants', [])))
")
    cars_count=$(echo "$response" | python3 -c "
import sys, json  
data = json.load(sys.stdin)
print(len(data.get('cars', [])))
")
    
    echo "✅ Événement trouvé avec $participants_count participants et $cars_count voitures"
else
    echo "❌ Données d'événement non trouvées"
    exit 1
fi

echo

# Vérifier les fichiers modifiés
echo "3️⃣ Vérification des fichiers modifiés..."

files_to_check=(
    "web/src/components/ParticipantsTab.tsx"
    "web/src/components/EventDashboard.tsx" 
    "web/src/components/EventDashboard.css"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file manquant"
        exit 1
    fi
done

echo

# Vérifier le contenu spécifique
echo "4️⃣ Vérification du contenu des améliorations..."

# Vérifier ParticipantsTab
if grep -q "getTransportStatus" web/src/components/ParticipantsTab.tsx; then
    echo "✅ Fonction getTransportStatus présente"
else
    echo "❌ Fonction getTransportStatus manquante"
fi

if grep -q "driver-badge" web/src/components/ParticipantsTab.tsx; then
    echo "✅ Badge conducteur implémenté"
else
    echo "❌ Badge conducteur manquant"
fi

# Vérifier EventDashboard
if grep -q "cars={event.cars" web/src/components/EventDashboard.tsx; then
    echo "✅ Passage des voitures au ParticipantsTab"
else
    echo "❌ Passage des voitures manquant"
fi

# Vérifier CSS
if grep -q "driver-badge" web/src/components/EventDashboard.css; then
    echo "✅ Styles pour badge conducteur"
else
    echo "❌ Styles pour badge manquants"
fi

if grep -q "transport-status" web/src/components/EventDashboard.css; then
    echo "✅ Styles pour statut transport"
else
    echo "❌ Styles pour statut manquants"
fi

echo

# Affichage des résultats
echo "5️⃣ Analyse des données actuelles..."

python3 -c "
import requests
import json

try:
    response = requests.get('http://localhost:8000/events/1')
    event = response.json()
    
    participants = event.get('participants', [])
    cars = event.get('cars', [])
    
    print(f'📊 Analyse des {len(participants)} participants:')
    
    conductors = 0
    passengers = 0  
    without_car = 0
    
    for p in participants:
        # Vérifier si conducteur
        driven_car = next((c for c in cars if c.get('driver_id') == p['id']), None)
        # Vérifier si passager (mais pas conducteur)
        passenger_car = next((c for c in cars if c.get('id') == p.get('car_id') and c.get('driver_id') != p['id']), None)
        
        if driven_car:
            conductors += 1
            print(f'   🚗 {p[\"name\"]}: CONDUCTEUR de {driven_car[\"license_plate\"]}')
        elif passenger_car:
            passengers += 1
            print(f'   🚶 {p[\"name\"]}: PASSAGER de {passenger_car[\"license_plate\"]}')
        else:
            without_car += 1
            print(f'   👤 {p[\"name\"]}: SANS VOITURE')
    
    print()
    print(f'📈 Répartition:')
    print(f'   Conducteurs: {conductors}')
    print(f'   Passagers: {passengers}')
    print(f'   Sans voiture: {without_car}')
    print(f'   Total: {len(participants)}')
    
except Exception as e:
    print(f'❌ Erreur: {e}')
"

echo
echo "=================================================="
echo "✅ VALIDATION TERMINÉE"
echo
echo "🎯 PROCHAINES ÉTAPES:"
echo "1. Ouvrir http://localhost:3000"
echo "2. Rejoindre l'événement 'Weekend Chamonix 2025'"
echo "3. Cliquer sur l'onglet '👥 Participants'"
echo "4. Vérifier l'affichage des badges et statuts"
echo
echo "💡 CE QUE VOUS DEVRIEZ VOIR:"
echo "• Badge orange '👨‍✈️ Conducteur' pour les conducteurs"
echo "• Messages '🚗 Conduit [PLAQUE]' en vert"  
echo "• Messages '🚗 Passager [PLAQUE]' en bleu"
echo "• Messages '🚶 Pas de voiture' en gris"
echo "• Informations détaillées sur les voitures"
echo
echo "🎉 L'amélioration de l'onglet Participants est terminée!"
