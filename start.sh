#!/bin/bash

# Script pour démarrer tout le projet Chalet Vibe

echo "🏔️ Démarrage de Chalet Vibe..."

# Démarrer le serveur Python
echo "📡 Démarrage du serveur API..."
cd server
source venv/bin/activate 2>/dev/null || echo "⚠️  Environnement virtuel non trouvé, continuons..."
python main.py &
SERVER_PID=$!
cd ..

# Attendre que le serveur démarre
sleep 3

# Démarrer l'application web
# echo "🌐 Démarrage de l'application web..."
# cd web
# if [ -f "package.json" ]; then
#     npm start &
#     WEB_PID=$!
# else
#     echo "⚠️  Application web non configurée"
# fi
# cd ..

# Démarrer l'application mobile
echo "📱 Démarrage de l'application mobile..."
cd mobile
if [ -f "package.json" ]; then
    npx expo start &
    MOBILE_PID=$!
else
    echo "⚠️  Application mobile non configurée"
fi
cd ..

echo ""
echo "✅ Applications démarrées !"
echo "📡 API: http://localhost:8000"
echo "🌐 Web: http://localhost:3000"
echo "📱 Mobile: Suivez les instructions d'Expo"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter tous les services"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    [ ! -z "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null
    [ ! -z "$WEB_PID" ] && kill $WEB_PID 2>/dev/null
    [ ! -z "$MOBILE_PID" ] && kill $MOBILE_PID 2>/dev/null
    echo "✅ Services arrêtés"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Attendre indéfiniment
wait
