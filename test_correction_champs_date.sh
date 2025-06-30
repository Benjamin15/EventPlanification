#!/bin/zsh

echo "🧪 TEST VALIDATION - CORRECTION CHAMPS DATE"
echo "==========================================="
echo ""

echo "📋 **Vérifications automatiques:**"
echo ""

echo "1️⃣ **Vérification serveur en marche:**"
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs 2>/dev/null)
if [ "$SERVER_STATUS" = "200" ]; then
    echo "   ✅ Serveur API en marche (http://localhost:8000)"
else
    echo "   ❌ Serveur API non accessible"
    echo "   → Démarrer avec: cd server && uvicorn main:app --reload"
    exit 1
fi

echo ""
echo "2️⃣ **Test création d'activité avec le bon champ 'date':**"
RESPONSE=$(curl -s -X POST http://localhost:8000/activities/ \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "name": "Test Validation Date",
    "activity_type": "leisure",
    "description": "Test pour valider la correction des champs de date",
    "location": "Chalet Test",
    "date": "2025-07-02T16:45:00Z"
  }' 2>/dev/null)

if echo "$RESPONSE" | grep -q '"name":"Test Validation Date"' && echo "$RESPONSE" | grep -q '"date":"2025-07-02T16:45:00"'; then
    echo "   ✅ Activité créée avec succès avec le champ 'date'"
    ACTIVITY_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    echo "   📄 ID activité créée: $ACTIVITY_ID"
else
    echo "   ❌ Erreur lors de la création d'activité"
    echo "   📄 Réponse: $RESPONSE"
fi

echo ""
echo "3️⃣ **Vérification récupération activités:**"
ACTIVITIES=$(curl -s -X GET http://localhost:8000/events/1/activities 2>/dev/null)
if echo "$ACTIVITIES" | grep -q '"Test Validation Date"' && echo "$ACTIVITIES" | grep -q '"date":"2025-07-02T16:45:00"'; then
    echo "   ✅ Activité récupérée avec le champ 'date' correct"
else
    echo "   ❌ Problème lors de la récupération"
fi

echo ""
echo "4️⃣ **Vérification app mobile en marche:**"
EXPO_STATUS=$(ps aux | grep -E "expo.*start" | grep -v grep)
if [ -n "$EXPO_STATUS" ]; then
    echo "   ✅ Application mobile Expo en marche"
    echo "   📱 Port: $(echo "$EXPO_STATUS" | grep -o '808[0-9]' | head -1)"
else
    echo "   ⚠️  Application mobile non détectée"
    echo "   → Démarrer avec: cd mobile && npx expo start --clear"
fi

echo ""
echo "=========================="
echo "📱 **TESTS UTILISATEUR À EFFECTUER:**"
echo ""

echo "1️⃣ **Test ajout d'activité:**"
echo "   ▶️  Scanner le QR code pour ouvrir l'app mobile"
echo "   ▶️  Rejoindre l'événement 'Weekend Test'"
echo "   ▶️  Aller dans l'onglet '📅 Agenda'"
echo "   ▶️  Cliquer '+ Ajouter'"
echo "   ▶️  Remplir :"
echo "       • Nom: 'Test Mobile Date'"
echo "       • Type: Sport"
echo "       • Description: 'Test correction champs date'"
echo "   ▶️  Cliquer '📅 Sélectionner une date'"
echo "   ▶️  Choisir: Demain à 14:00"
echo "   ▶️  Cliquer 'Ajouter'"
echo ""

echo "✅ **RÉSULTATS ATTENDUS:**"
echo "   • Message 'Activité ajoutée avec succès!'"
echo "   • Activité apparaît dans la liste avec date visible"
echo "   • Date affichée au format: 'mar. juil. 1, 14:00' (au lieu de 'Date non définie')"
echo "   • Activité correctement positionnée selon sa date (tri chronologique)"
echo ""

echo "2️⃣ **Test modification d'activité:**"
echo "   ▶️  Cliquer sur l'activité 'Test Mobile Date'"
echo "   ▶️  Modifier sa date pour Après-demain 16:30"
echo "   ▶️  Cliquer 'Sauvegarder'"
echo ""

echo "✅ **RÉSULTATS ATTENDUS:**"
echo "   • Activité mise à jour avec nouvelle date"
echo "   • Nouvelle date affichée correctement"
echo "   • Activité repositionnée dans la liste selon la nouvelle date"
echo ""

echo "3️⃣ **Vérification console (optionnel):**"
echo "   ▶️  Ouvrir les outils de développement de l'app"
echo "   ▶️  Naviguer dans l'agenda"
echo "   ▶️  Chercher les logs : '🔍 Debug activité:'"
echo ""

echo "✅ **LOGS ATTENDUS:**"
echo "   • Plus de messages 'scheduled_date: undefined, planned_date: undefined'"
echo "   • Logs simplifiés : '{ id: X, name: Y, date: Z, activity_type: W }'"
echo "   • Aucun message '⚠️ Aucune date trouvée pour l'activité'"
echo ""

echo "🎯 **CRITÈRES DE SUCCÈS GLOBAUX:**"
echo "✅ Plus de 'Date non définie' dans l'agenda"
echo "✅ DatePicker/TimePicker complètement fonctionnels"
echo "✅ Dates persistées et affichées correctement"
echo "✅ Tri chronologique opérationnel"
echo "✅ Édition de dates fonctionnelle"
echo ""

echo "🚨 **EN CAS DE PROBLÈME:**"
echo "- Vérifier que l'app mobile a bien le cache nettoyé (expo start --clear)"
echo "- Contrôler que le serveur API est bien en marche"
echo "- Examiner les logs console pour d'éventuelles erreurs"
echo ""

read -p "▶️ Appuyez sur Entrée pour continuer les tests manuels..."
