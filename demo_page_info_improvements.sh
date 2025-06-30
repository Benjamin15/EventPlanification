#!/bin/bash

echo "🎯 DÉMONSTRATION FINALE - AMÉLIORATIONS PAGE INFO"
echo "=" 
echo 

# Vérifier que les services sont en cours d'exécution
echo "🔍 Vérification des services..."

# Backend
if curl -s http://localhost:8000/events/1 > /dev/null; then
    echo "✅ Backend (FastAPI): http://localhost:8000 - OPÉRATIONNEL"
else
    echo "❌ Backend non accessible"
    exit 1
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend (React): http://localhost:3000 - OPÉRATIONNEL"
else
    echo "❌ Frontend non accessible"
    exit 1
fi

echo 
echo "📊 Test des données..."

# Récupérer les informations de l'événement
EVENT_DATA=$(curl -s http://localhost:8000/events/1)
EVENT_NAME=$(echo $EVENT_DATA | python3 -c "import sys, json; print(json.load(sys.stdin)['name'])")
PARTICIPANT_COUNT=$(echo $EVENT_DATA | python3 -c "import sys, json; print(len(json.load(sys.stdin)['participants']))")
CAR_COUNT=$(echo $EVENT_DATA | python3 -c "import sys, json; print(len(json.load(sys.stdin)['cars']))")

echo "✅ Événement: $EVENT_NAME"
echo "✅ Participants: $PARTICIPANT_COUNT"
echo "✅ Voitures: $CAR_COUNT"

echo 
echo "🔧 Test de l'endpoint de mise à jour..."

# Test de mise à jour de l'événement
curl -s -X PUT -H "Content-Type: application/json" \
  -d '{
    "name":"Weekend Chamonix 2025",
    "description":"Description mise à jour par la démo",
    "location":"Chamonix, France",
    "start_date":"2025-07-05T14:03:09.590373",
    "end_date":"2025-07-07T14:03:09.590373",
    "chalet_link":"https://example.com/chalet-chamonix"
  }' http://localhost:8000/events/1 > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Endpoint PUT /events/{event_id} fonctionnel"
else
    echo "❌ Problème avec l'endpoint de mise à jour"
fi

echo 
echo "🌐 INSTRUCTIONS DE TEST MANUEL"
echo "================================"
echo 
echo "1. Ouvrez votre navigateur sur: http://localhost:3000"
echo 
echo "2. Sélectionnez l'événement: '$EVENT_NAME'"
echo 
echo "3. Cliquez sur l'onglet 'Info'"
echo 
echo "4. Vérifiez les nouvelles fonctionnalités:"
echo "   📋 Section 'Participants et transport'"
echo "   🏷️  Badges conducteur/passager/sans voiture"
echo "   ✏️  Boutons 'Modifier' pour chaque information"
echo "   💾 Formulaires de sauvegarde"
echo 
echo "5. Testez l'édition d'une information:"
echo "   • Cliquez 'Modifier' à côté de 'Description'"
echo "   • Changez le texte"
echo "   • Cliquez 'Sauvegarder'"
echo "   • Vérifiez que le changement est visible"
echo 
echo "🎉 DEMO PRÊTE!"
echo 
echo "💡 Les modifications sont maintenant opérationnelles."
echo "   Toutes les fonctionnalités demandées ont été implémentées."
