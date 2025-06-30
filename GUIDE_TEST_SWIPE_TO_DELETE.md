# 📱 GUIDE DE TEST - Fonctionnalité Swipe-to-Delete Mobile

## 🎯 OBJECTIF
Tester la nouvelle fonctionnalité de **glissement vers la gauche pour supprimer** les éléments dans les listes d'agenda, courses et transport de l'application mobile.

## 🚀 DÉMARRAGE RAPIDE

### 1. Lancement de l'application
```bash
cd /Users/ben/workspace/chalet_vibe_coding/mobile
npm start
```

### 2. Accès mobile
- **iOS** : Ouvrir l'app "Camera" et scanner le QR code
- **Android** : Ouvrir "Expo Go" et scanner le QR code
- **Web** : Ouvrir http://localhost:8082

---

## 🧪 SCÉNARIOS DE TEST

### 📅 **1. TEST AGENDA (Onglet Agenda)**

#### Préparation
1. Rejoindre un événement existant ou créer des activités de test
2. Aller dans l'onglet **"Agenda"** 📅

#### Test du swipe-to-delete
1. **Glisser vers la gauche** sur une carte d'activité
2. ✅ **Vérifier** : Le bouton rouge "🗑️ Supprimer" apparaît
3. **Appuyer** sur le bouton de suppression
4. ✅ **Vérifier** : Dialog de confirmation s'affiche
5. **Confirmer** la suppression
6. ✅ **Vérifier** : 
   - L'activité est supprimée de la liste
   - L'interface se met à jour automatiquement
   - Message de succès s'affiche

#### Test d'annulation
1. **Glisser vers la gauche** sur une activité
2. **Appuyer** sur "Supprimer"
3. **Appuyer** sur "Annuler" dans le dialog
4. ✅ **Vérifier** : L'activité revient à sa position normale

---

### 🛒 **2. TEST COURSES (Onglet Courses)**

#### Préparation
1. Aller dans l'onglet **"Courses"** 🛒
2. Ajouter quelques articles si nécessaire

#### Test du swipe-to-delete
1. **Glisser vers la gauche** sur une carte d'article
2. ✅ **Vérifier** : Le bouton rouge "🗑️ Supprimer" apparaît
3. **Appuyer** sur le bouton de suppression
4. ✅ **Vérifier** : Dialog de confirmation s'affiche
5. **Confirmer** la suppression
6. ✅ **Vérifier** : 
   - L'article est supprimé de la liste
   - Le total des courses se met à jour
   - L'interface se rafraîchit automatiquement

#### Test sur article acheté
1. **Marquer** un article comme acheté (appui normal sur la carte)
2. **Glisser vers la gauche** sur cet article acheté
3. ✅ **Vérifier** : La suppression fonctionne même pour les articles achetés

---

### 🚗 **3. TEST TRANSPORT (Onglet Transport)**

#### Préparation
1. Aller dans l'onglet **"Transport"** 🚗
2. Ajouter quelques voitures si nécessaire

#### Test du swipe-to-delete
1. **Glisser vers la gauche** sur une carte de voiture
2. ✅ **Vérifier** : Le bouton rouge "🗑️ Supprimer" apparaît
3. **Appuyer** sur le bouton de suppression
4. ✅ **Vérifier** : Dialog de confirmation s'affiche
5. **Confirmer** la suppression
6. ✅ **Vérifier** : 
   - La voiture est supprimée de la liste
   - Les passagers assignés sont libérés
   - Le coût total se met à jour

#### Test voiture avec passagers
1. **Assigner** des participants à une voiture
2. **Glisser vers la gauche** pour supprimer cette voiture
3. ✅ **Vérifier** : La suppression fonctionne et les participants sont désassignés

---

## 🎨 TESTS VISUELS

### Animation et feedback
- ✅ **Animation fluide** lors du glissement
- ✅ **Bouton rouge** clairement visible
- ✅ **Retour tactile** approprié
- ✅ **Animation de suppression** (glissement vers la gauche jusqu'à disparition)

### Interface utilisateur
- ✅ **Hint text** mis à jour : "Glisser ← pour supprimer"
- ✅ **Boutons de suppression** bien positionnés
- ✅ **Couleurs** appropriées (rouge pour danger)
- ✅ **Icônes** claires (🗑️)

---

## 🔧 TESTS TECHNIQUES

### API et synchronisation
- ✅ **Appels API** de suppression fonctionnent
- ✅ **Gestion d'erreurs** appropriée
- ✅ **Refresh automatique** après suppression
- ✅ **États cohérents** entre client et serveur

### Gestion des gestes
- ✅ **PanGestureHandler** fonctionne correctement
- ✅ **Seuil de déclenchement** approprié (100px)
- ✅ **Animations** fluides
- ✅ **Pas de conflits** avec les autres interactions

---

## 📊 ENDPOINTS API TESTÉS

### Suppression d'activité
```
DELETE /activities/{activity_id}
```

### Suppression d'article de course
```
DELETE /shopping/{item_id}
```

### Suppression de voiture
```
DELETE /cars/{car_id}
```

---

## 🚨 POINTS D'ATTENTION

### Cas d'erreur à tester
1. **Connexion réseau** : Tester sans internet
2. **Permissions** : Vérifier les droits de suppression
3. **Éléments liés** : Voiture avec passagers, etc.

### Performance
1. **Fluidité** sur différents appareils
2. **Réactivité** des animations
3. **Temps de réponse** des API

---

## ✅ CHECKLIST FINALE

- [ ] **Agenda** : Swipe-to-delete fonctionne
- [ ] **Courses** : Swipe-to-delete fonctionne  
- [ ] **Transport** : Swipe-to-delete fonctionne
- [ ] **Animations** : Fluides et appropriées
- [ ] **Confirmations** : Dialogs de sécurité présents
- [ ] **API** : Suppressions effectives côté serveur
- [ ] **UI/UX** : Interface intuitive et responsive
- [ ] **Gestion d'erreurs** : Messages clairs pour l'utilisateur

---

## 📱 COMPATIBILITÉ

### Plateformes testées
- [ ] **iOS** (iPhone/iPad)
- [ ] **Android** (Phone/Tablet)  
- [ ] **Web** (navigateur mobile)

### Versions React Native
- ✅ **react-native-gesture-handler** : v2.26.0
- ✅ **expo** : Compatible avec la version installée

---

## 🎉 RÉSULTAT ATTENDU

Après ces tests, les utilisateurs pourront :
1. **Supprimer rapidement** des éléments par glissement
2. **Bénéficier d'une UX moderne** et intuitive
3. **Éviter les suppressions accidentelles** grâce aux confirmations
4. **Voir les changements** reflétés immédiatement dans l'interface

---

*Guide créé le 30 juin 2025 - Fonctionnalité Swipe-to-Delete Mobile*
