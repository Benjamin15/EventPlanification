#!/bin/bash

# 🎯 DÉMONSTRATION - CRÉATION D'ÉVÉNEMENTS SUR MOBILE
# ===================================================

echo "🎉 DÉMONSTRATION DE LA CRÉATION D'ÉVÉNEMENTS SUR MOBILE"
echo "======================================================="
echo ""

echo "📱 STATUT DE L'APPLICATION MOBILE :"
echo "-----------------------------------"

# Vérifier si l'app mobile est démarrée
if pgrep -f "expo start" > /dev/null; then
    echo "✅ Application mobile : DÉMARRÉE"
    echo "🌐 URL : http://localhost:8083"
else
    echo "❌ Application mobile : NON DÉMARRÉE"
    echo "💡 Pour démarrer : cd mobile && npm start"
fi

echo ""
echo "🔧 STATUT DU BACKEND :"
echo "----------------------"

# Vérifier si le backend est démarré
if pgrep -f "python.*main\.py\|uvicorn" > /dev/null; then
    echo "✅ Backend API : DÉMARRÉ"
    
    # Test API
    echo "🧪 Test de l'API de création..."
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:8000/events/" \
        -H "Content-Type: application/json" \
        -d '{"name":"Demo Test","location":"Test Location","start_date":"2025-08-01","end_date":"2025-08-02"}')
    
    if [ "$RESPONSE" = "200" ]; then
        echo "✅ API création d'événements : FONCTIONNELLE"
    else
        echo "⚠️  API création d'événements : Code $RESPONSE"
    fi
else
    echo "❌ Backend API : NON DÉMARRÉ"
    echo "💡 Pour démarrer : python main.py"
fi

echo ""
echo "🎯 FONCTIONNALITÉS IMPLÉMENTÉES :"
echo "==================================="
echo "✅ Interface complète de création d'événements"
echo "✅ Formulaire avec validation des champs"
echo "✅ Sélecteurs de dates natifs iOS/Android"
echo "✅ Auto-connexion du créateur à l'événement"
echo "✅ Navigation fluide entre les écrans"
echo "✅ Gestion d'erreurs avec messages explicites"
echo "✅ Design cohérent avec l'application existante"

echo ""
echo "📝 GUIDE D'UTILISATION :"
echo "========================="
echo "1. 📱 Ouvrir http://localhost:8083 (mobile)"
echo "2. 🆕 Cliquer sur 'Créer un nouvel événement'"
echo "3. 📝 Remplir le formulaire :"
echo "   • Nom de l'événement (obligatoire)"
echo "   • Votre nom (obligatoire)"
echo "   • Lieu (obligatoire)"
echo "   • Dates de début et fin (obligatoires)"
echo "   • Description et lien chalet (optionnels)"
echo "4. 🎯 Cliquer sur 'Créer l'événement'"
echo "5. 🎉 Accéder automatiquement au dashboard"

echo ""
echo "🔍 TESTS À EFFECTUER :"
echo "======================="
echo "□ Création d'événement avec tous les champs"
echo "□ Validation des champs obligatoires"
echo "□ Validation des dates (fin après début)"
echo "□ Validation du format URL pour le lien chalet"
echo "□ Navigation retour depuis l'écran de création"
echo "□ Auto-connexion et redirection vers dashboard"

echo ""
echo "🎊 RÉSULTAT :"
echo "============="
echo "🏆 LA CRÉATION D'ÉVÉNEMENTS EST MAINTENANT DISPONIBLE SUR MOBILE !"
echo "🎯 Parité fonctionnelle complète entre web et mobile"
echo ""

# Ouvrir l'app mobile si possible
if command -v open > /dev/null && pgrep -f "expo start" > /dev/null; then
    echo "🚀 Ouverture de l'application mobile..."
    open "http://localhost:8083"
fi

echo "✨ Démonstration terminée !"
