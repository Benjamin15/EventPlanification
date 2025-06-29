#!/bin/bash

# Test de connexion réseau pour l'application mobile
echo "🧪 Test de connexion réseau mobile - Chalet Vibe"
echo "================================================"

# Variables
LOCAL_IP="192.168.0.200"
API_PORT="8000"
API_URL="http://${LOCAL_IP}:${API_PORT}"

echo ""
echo "🔍 Configuration réseau:"
echo "   IP locale: $LOCAL_IP"
echo "   Port API: $API_PORT"
echo "   URL API: $API_URL"

echo ""
echo "🧪 Tests de connexion:"

# Test 1: Ping de l'IP
echo "1. Test ping IP locale..."
if ping -c 1 $LOCAL_IP > /dev/null 2>&1; then
    echo "   ✅ IP locale accessible"
else
    echo "   ❌ IP locale non accessible"
    exit 1
fi

# Test 2: Test du port API
echo "2. Test port API..."
if nc -z $LOCAL_IP $API_PORT 2>/dev/null; then
    echo "   ✅ Port API ouvert"
else
    echo "   ❌ Port API fermé ou serveur non démarré"
    echo "   💡 Démarrez le serveur avec: cd server && python main.py"
    exit 1
fi

# Test 3: Test requête HTTP
echo "3. Test requête HTTP..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/docs)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ API répond correctement (status: $HTTP_STATUS)"
else
    echo "   ❌ API ne répond pas correctement (status: $HTTP_STATUS)"
    exit 1
fi

# Test 4: Test endpoint événements
echo "4. Test endpoint événements..."
EVENTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/events/)
if [ "$EVENTS_STATUS" = "200" ]; then
    echo "   ✅ Endpoint événements accessible"
else
    echo "   ⚠️  Endpoint événements retourne: $EVENTS_STATUS"
fi

echo ""
echo "🎯 Tests réseau pour mobile:"

# Test 5: Simulation requête mobile
echo "5. Test simulation requête mobile..."
MOBILE_TEST=$(curl -s -X GET "$API_URL/events/" \
    -H "Content-Type: application/json" \
    -H "User-Agent: Expo/1.0 (Mobile)")

if [ $? -eq 0 ]; then
    echo "   ✅ Simulation requête mobile réussie"
    echo "   📱 Nombre d'événements trouvés: $(echo $MOBILE_TEST | jq '. | length' 2>/dev/null || echo "N/A")"
else
    echo "   ❌ Simulation requête mobile échouée"
fi

echo ""
echo "🔧 Configuration pour Expo:"
echo "   Dans mobile/App.js, utilisez:"
echo "   const API_BASE_URL = '$API_URL';"

echo ""
echo "📱 Instructions pour tester dans Expo:"
echo "   1. Assurez-vous que votre téléphone/simulateur est sur le même réseau WiFi"
echo "   2. L'adresse IP doit être: $LOCAL_IP"
echo "   3. Redémarrez l'app Expo après modification"

echo ""
if [ "$EVENTS_STATUS" = "200" ] && [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ SUCCÈS: Configuration réseau prête pour mobile!"
else
    echo "⚠️  ATTENTION: Vérifiez les étapes ci-dessus"
fi
