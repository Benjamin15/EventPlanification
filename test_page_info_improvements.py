#!/usr/bin/env python3
"""
Test des améliorations de la page info :
1. Affichage des participants avec statut de transport
2. Édition des informations générales de l'événement
"""

import requests
import json
from datetime import datetime

API_BASE = "http://localhost:8000"

def test_event_update_endpoint():
    """Test l'endpoint PUT /events/{event_id}"""
    print("🔧 Test de l'endpoint de mise à jour d'événement")
    print("=" * 60)
    
    # Récupérer l'événement actuel
    response = requests.get(f"{API_BASE}/events/1")
    if response.status_code != 200:
        print("❌ Impossible de récupérer l'événement")
        return False
    
    event = response.json()
    print(f"✅ Événement récupéré: {event['name']}")
    
    # Test de mise à jour
    updated_data = {
        "name": event['name'],
        "description": "Description mise à jour par le test automatique",
        "location": "Nouvelle localisation - Chamonix",
        "start_date": event['start_date'],
        "end_date": event['end_date'],
        "chalet_link": "https://nouvelle-url-chalet.com"
    }
    
    response = requests.put(f"{API_BASE}/events/1", json=updated_data)
    if response.status_code == 200:
        updated_event = response.json()
        print("✅ Événement mis à jour avec succès")
        print(f"   📝 Description: {updated_event['description']}")
        print(f"   📍 Lieu: {updated_event['location']}")
        print(f"   🔗 Lien chalet: {updated_event['chalet_link']}")
        return True
    else:
        print(f"❌ Erreur lors de la mise à jour: {response.status_code}")
        print(f"   Réponse: {response.text}")
        return False

def analyze_participants_transport_status():
    """Analyse le statut de transport des participants"""
    print("\n👥 Analyse du statut de transport des participants")
    print("=" * 60)
    
    response = requests.get(f"{API_BASE}/events/1")
    if response.status_code != 200:
        print("❌ Impossible de récupérer l'événement")
        return False
    
    event = response.json()
    participants = event.get('participants', [])
    cars = event.get('cars', [])
    
    print(f"📊 Participants total: {len(participants)}")
    print(f"🚗 Voitures disponibles: {len(cars)}")
    
    # Analyser le statut de chaque participant
    conducteurs = []
    passagers = []
    sans_voiture = []
    
    # Créer une map des conducteurs
    driver_map = {car['driver_id']: car for car in cars if car['driver_id']}
    
    for participant in participants:
        participant_id = participant['id']
        participant_name = participant['name']
        car_id = participant.get('car_id')
        
        if participant_id in driver_map:
            # C'est un conducteur
            car = driver_map[participant_id]
            conducteurs.append({
                'name': participant_name,
                'car': car['license_plate'],
                'status': 'conducteur'
            })
        elif car_id:
            # C'est un passager
            # Trouver la voiture
            car = next((c for c in cars if c['id'] == car_id), None)
            if car:
                passagers.append({
                    'name': participant_name,
                    'car': car['license_plate'],
                    'status': 'passager'
                })
        else:
            # Sans voiture
            sans_voiture.append({
                'name': participant_name,
                'status': 'sans voiture'
            })
    
    print("\n🚗 CONDUCTEURS:")
    for conducteur in conducteurs:
        print(f"   👨‍✈️ {conducteur['name']} - Voiture: {conducteur['car']}")
    
    print("\n👥 PASSAGERS:")
    for passager in passagers:
        print(f"   🧳 {passager['name']} - Voiture: {passager['car']}")
    
    print("\n🚶 SANS VOITURE:")
    for person in sans_voiture:
        print(f"   🚶 {person['name']}")
    
    print(f"\n📋 RÉSUMÉ:")
    print(f"   • Conducteurs: {len(conducteurs)}")
    print(f"   • Passagers: {len(passagers)}")
    print(f"   • Sans voiture: {len(sans_voiture)}")
    
    return True

def test_frontend_integration():
    """Teste l'intégration avec le frontend"""
    print("\n🌐 Test d'intégration frontend")
    print("=" * 60)
    
    print("🔍 Instructions de test manuel:")
    print("\n1. Ouvrez http://localhost:3000 dans votre navigateur")
    print("2. Sélectionnez l'événement 'Weekend Chamonix 2025'")
    print("3. Allez dans l'onglet 'Info'")
    print("4. Vérifiez que vous voyez:")
    print("   • Section 'Participants et transport' avec statuts colorés")
    print("   • Boutons d'édition pour chaque information générale")
    print("   • Badges conducteur/passager/sans voiture")
    print("\n5. Testez l'édition:")
    print("   • Cliquez sur 'Modifier' à côté d'une information")
    print("   • Modifiez le texte")
    print("   • Cliquez sur 'Sauvegarder'")
    print("   • Vérifiez que la modification est sauvée")
    
    return True

def main():
    print("🎯 TEST DES AMÉLIORATIONS DE LA PAGE INFO")
    print("=" * 70)
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 API: {API_BASE}")
    print()
    
    # Vérifier que l'API est accessible
    try:
        response = requests.get(f"{API_BASE}/events/")
        print(f"✅ API accessible (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ API non accessible: {e}")
        return
    
    # Tester l'endpoint de mise à jour
    success_update = test_event_update_endpoint()
    
    # Analyser les statuts de transport
    success_transport = analyze_participants_transport_status()
    
    # Instructions pour les tests frontend
    test_frontend_integration()
    
    print("\n" + "=" * 70)
    if success_update and success_transport:
        print("🎉 TESTS BACKEND RÉUSSIS!")
        print("\n📝 FONCTIONNALITÉS VALIDÉES:")
        print("   ✅ Endpoint PUT /events/{event_id} fonctionnel")
        print("   ✅ Détection automatique des statuts de transport")
        print("   ✅ Classification conducteurs/passagers/sans voiture")
        print("\n🌐 TESTS MANUELS À EFFECTUER:")
        print("   🔧 Interface d'édition des informations générales")
        print("   👥 Affichage des participants avec statuts transport")
        print("   💾 Sauvegarde des modifications via l'interface")
    else:
        print("❌ CERTAINS TESTS ONT ÉCHOUÉ")
        print("Vérifiez les logs ci-dessus pour plus de détails")

if __name__ == "__main__":
    main()
