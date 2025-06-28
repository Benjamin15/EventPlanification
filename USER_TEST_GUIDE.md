# 🧪 Guide de Test Utilisateur - Correction 404

## 🎯 Objectif
Valider que la création et l'accès aux événements fonctionne correctement après les corrections.

## 🚀 Tests à Effectuer

### Test 1 : Création d'Événement ✅
1. Ouvrir http://localhost:3000
2. Cliquer sur "Créer un événement"
3. Remplir le formulaire :
   - **Nom** : "Mon Chalet Test"
   - **Lieu** : "Alpes françaises"
   - **Date début** : Une date future
   - **Date fin** : 2-3 jours après
   - **Description** : "Test de validation"
4. *(Optionnel)* Ajouter une image
5. Cliquer "Créer l'événement"

**Résultat attendu** : L'événement est créé et on est redirigé vers le dashboard.

### Test 2 : Accès à l'Événement ✅
1. Noter le nom de l'événement créé
2. Aller sur l'écran d'accueil
3. Saisir le nom exact de l'événement
4. Saisir votre nom comme participant
5. Cliquer "Rejoindre l'événement"

**Résultat attendu** : Accès au dashboard de l'événement sans erreur 404.

### Test 3 : Dashboard Complet ✅
Une fois dans le dashboard, vérifier :
- ✅ Informations de l'événement affichées
- ✅ Section participants visible
- ✅ Navigation mobile (réduire la fenêtre)
- ✅ Boutons d'ajout (repas, courses, transport) fonctionnels

### Test 4 : Fonctionnalités Avancées ✅
1. Ajouter un repas (tester la modal)
2. Ajouter un article de courses
3. Ajouter une voiture
4. Vérifier le calcul des coûts

### Test 5 : Temps Réel ✅
1. Ouvrir un second onglet sur le même événement
2. Modifier quelque chose dans un onglet
3. Observer les notifications dans l'autre onglet

## 🐛 Erreurs Résolues

### ❌ Ancien Problème
```
127.0.0.1:59035 - "GET /events/Chalet1 HTTP/1.1" 404 Not Found
```

### ✅ Nouveau Comportement
```
127.0.0.1:59209 - "GET /events/Chalet1 HTTP/1.1" 200 OK
```

## 📊 Validation Backend

### Tests API Directs
```bash
# Test création
curl -X POST "http://localhost:8000/events/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test API", "location": "Test", "start_date": "2025-07-01T10:00:00", "end_date": "2025-07-03T18:00:00"}'

# Test récupération  
curl "http://localhost:8000/events/Test API"

# Test images
curl "http://localhost:8000/events/1/images"
```

### Validation Base de Données
```bash
cd server
sqlite3 chalet_vibe.db "SELECT name, location FROM events ORDER BY created_at DESC LIMIT 5;"
```

## ✅ Critères de Réussite

- [ ] Création d'événement depuis l'UI réussie
- [ ] Accès à l'événement sans erreur 404
- [ ] Dashboard complètement fonctionnel
- [ ] Navigation mobile opérationnelle
- [ ] Upload d'images fonctionnel
- [ ] Notifications temps réel actives
- [ ] Toutes les modales d'ajout fonctionnelles
- [ ] Calculs de coûts corrects

## 🎉 Confirmation

Si tous les tests passent, le problème 404 est **complètement résolu** et l'application est prête pour l'utilisation normale.

---
*Guide de test - Problème 404 résolu le 28 juin 2025*
