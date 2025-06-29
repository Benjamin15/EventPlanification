# 🎯 Guide de test des nouvelles fonctionnalités

## 📋 Nouvelles fonctionnalités implémentées

### 1. 💰 Contribution financière par article
- Possibilité de définir qui contribue au paiement de chaque article
- Par défaut : tous les participants
- Option : sélection spécifique de participants

### 2. ⚖️ Équilibre financier
- Remplacement de l'onglet "Coûts" par "Équilibre financier"
- Calcul automatique de qui doit quoi à qui
- Recommandations de transferts pour équilibrer les comptes

## 🧪 Tests à effectuer

### Test 1: Interface des contributeurs dans l'onglet Shopping

1. **Navigation**
   - Aller sur http://localhost:3000
   - Se connecter avec n'importe quel participant
   - Aller dans l'onglet "Shopping"

2. **Modifier les contributeurs d'un article**
   - Cliquer sur "Modifier" pour un article existant
   - Observer l'interface de sélection des contributeurs :
     - ⚪ "Tous les participants" (option par défaut)
     - ⚪ "Participants spécifiques" (avec cases à cocher)
   - Sélectionner "Participants spécifiques"
   - Cocher/décocher des participants
   - Sauvegarder

3. **Vérifications**
   - L'article doit afficher les contributeurs sélectionnés
   - Les badges des contributeurs doivent s'afficher correctement

### Test 2: Onglet Équilibre financier

1. **Navigation**
   - Aller dans l'onglet "Équilibre financier" (anciennement "Coûts")

2. **Vérifier les informations affichées**
   - **Cartes de résumé** :
     - Coût par personne
     - Total shopping
     - Total transport
   - **Balance des participants** :
     - Liste des participants avec leur balance
     - Indicateurs visuels (créditeur/débiteur)
   - **Transferts recommandés** :
     - Qui doit donner de l'argent à qui
     - Montants précis

3. **Tests dynamiques**
   - Modifier les contributeurs d'un article dans l'onglet Shopping
   - Retourner dans l'onglet Équilibre financier
   - Vérifier que les balances se mettent à jour automatiquement

## 🔍 État actuel de test

### Articles avec contributeurs spécifiques :
- **Fromage à raclette** (25.5€) : Alice, Bob, Charlie
- **Vin blanc** (12€) : Alice, Bob, Diana, Benjamin  
- **Bière** (8.5€) : Bob, Benjamin

### Balance actuelle :
- **Ben** : +2.5€ (créditeur)
- **Alice Martin** : -23.5€
- **Bob Durand** : -100.0€ 
- **Charlie Moreau** : -43.5€
- **Diana Petit** : -57.5€
- **Benjamin** : -65.0€

### Transfert recommandé :
- Alice Martin → Ben : 2.5€

## ✅ Critères de succès

### Fonctionnalité Contributors
- [ ] Interface de sélection des contributeurs fonctionne
- [ ] Sauvegarde des contributeurs spécifiques
- [ ] Affichage correct des badges de contributeurs
- [ ] Boutons radio "tous" vs "spécifiques" fonctionnent

### Fonctionnalité Équilibre financier
- [ ] Onglet "Équilibre financier" accessible
- [ ] Cartes de résumé affichent les bonnes données
- [ ] Balance des participants calculée correctement
- [ ] Transferts recommandés pertinents
- [ ] Mise à jour en temps réel lors des changements

## 🐛 Problèmes potentiels à surveiller

1. **Erreurs TypeScript** : Vérifier qu'il n'y a pas d'erreurs dans la console
2. **API calls** : Vérifier que les appels API fonctionnent (Network tab)
3. **Synchronisation** : Les changements dans Shopping doivent se refléter dans Équilibre
4. **Responsive design** : Tester sur différentes tailles d'écran
5. **Performance** : Les calculs doivent être rapides

## 📱 URLs de test

- **Application principale** : http://localhost:3000
- **API docs** : http://127.0.0.1:8000/docs
- **API financial-balance** : http://127.0.0.1:8000/events/1/financial-balance
- **API costs** : http://127.0.0.1:8000/events/1/costs

## 🔧 Commands utiles pour les tests

```bash
# Redémarrer le backend
cd /Users/ben/workspace/chalet_vibe_coding/server && python -m uvicorn main:app --reload

# Redémarrer le frontend  
cd /Users/ben/workspace/chalet_vibe_coding/web && npm start

# Tester l'API directement
curl -X GET "http://127.0.0.1:8000/events/1/financial-balance" | python -m json.tool

# Voir les logs backend
cd /Users/ben/workspace/chalet_vibe_coding/server && tail -f uvicorn.log
```
