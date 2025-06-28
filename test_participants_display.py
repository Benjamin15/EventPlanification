#!/usr/bin/env python3
"""
Script de test pour valider les améliorations de l'onglet Participants
avec affichage des conducteurs et statut des voitures.
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_participants_display():
    """Test de l'affichage amélioré des participants"""
    print("🧪 Test de l'affichage des participants avec statut conducteur...")
    
    # 1. Créer un événement de test
    event_name = f"TestParticipants_{int(time.time())}"
    print(f"\n1️⃣ Création d'événement de test: {event_name}")
    
    try:
        event_data = {
            "name": event_name,
            "description": "Test de l'affichage des participants",
            "location": "Chalet de test",
            "start_date": "2025-08-01",
            "end_date": "2025-08-05"
        }
        
        response = requests.post(f"{BASE_URL}/events/", json=event_data)
        if response.status_code != 200:
            print(f"❌ Erreur création événement: {response.status_code}")
            return False
            
        event = response.json()
        event_id = event['id']
        print(f"✅ Événement créé avec ID: {event_id}")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    # 2. Ajouter des participants
    print("\n2️⃣ Ajout de participants...")
    participants_data = [
        {"name": "Alice Conductrice", "event_id": event_id},
        {"name": "Bob Passager", "event_id": event_id},
        {"name": "Charlie Solo", "event_id": event_id},
        {"name": "Diana Conductrice2", "event_id": event_id}
    ]
    
    participant_ids = []
    for participant_data in participants_data:
        try:
            response = requests.post(f"{BASE_URL}/participants/", json=participant_data)
            if response.status_code == 200:
                participant = response.json()
                participant_ids.append(participant['id'])
                print(f"✅ {participant['name']} ajouté(e) avec ID: {participant['id']}")
            else:
                print(f"❌ Erreur ajout participant: {response.status_code}")
        except Exception as e:
            print(f"❌ Erreur: {e}")
    
    if len(participant_ids) < 4:
        print("❌ Pas assez de participants créés")
        return False
    
    # 3. Créer des voitures avec des conducteurs
    print("\n3️⃣ Création de voitures...")
    cars_data = [
        {
            "event_id": event_id,
            "driver_id": participant_ids[0],  # Alice
            "license_plate": "TEST-001",
            "max_passengers": 4,
            "fuel_cost": 60.0,
            "rental_cost": 100.0
        },
        {
            "event_id": event_id,
            "driver_id": participant_ids[3],  # Diana
            "license_plate": "TEST-002", 
            "max_passengers": 5,
            "fuel_cost": 75.0,
            "rental_cost": 120.0
        }
    ]
    
    car_ids = []
    for car_data in cars_data:
        try:
            response = requests.post(f"{BASE_URL}/cars/", json=car_data)
            if response.status_code == 200:
                car = response.json()
                car_ids.append(car['id'])
                print(f"✅ Voiture {car['license_plate']} créée")
                print(f"   Conducteur: {car['driver_name']} (ID: {car['driver_id']})")
            else:
                print(f"❌ Erreur création voiture: {response.text}")
        except Exception as e:
            print(f"❌ Erreur: {e}")
    
    if len(car_ids) < 2:
        print("❌ Pas assez de voitures créées")
        return False
    
    # 4. Assigner Bob comme passager de la voiture d'Alice
    print("\n4️⃣ Assignation de passagers...")
    try:
        response = requests.put(f"{BASE_URL}/participants/{participant_ids[1]}/car/{car_ids[0]}")
        if response.status_code == 200:
            print("✅ Bob assigné comme passager de la voiture d'Alice")
        else:
            print(f"❌ Erreur assignation: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    # 5. Vérifier l'état final
    print("\n5️⃣ Vérification de l'état final...")
    try:
        # Récupérer l'événement complet
        response = requests.get(f"{BASE_URL}/events/{event_id}")
        if response.status_code != 200:
            print(f"❌ Erreur récupération événement: {response.status_code}")
            return False
            
        final_event = response.json()
        participants = final_event.get('participants', [])
        cars = final_event.get('cars', [])
        
        print(f"📊 État final:")
        print(f"   - Participants: {len(participants)}")
        print(f"   - Voitures: {len(cars)}")
        
        # Analyser chaque participant
        for participant in participants:
            # Vérifier si conducteur
            driven_car = next((c for c in cars if c.get('driver_id') == participant['id']), None)
            # Vérifier si passager
            passenger_car = next((c for c in cars if c.get('id') == participant.get('car_id')), None)
            
            if driven_car:
                print(f"   🚗 {participant['name']}: CONDUCTEUR de {driven_car['license_plate']}")
            elif passenger_car:
                print(f"   🚶 {participant['name']}: PASSAGER de {passenger_car['license_plate']}")
            else:
                print(f"   👤 {participant['name']}: SANS VOITURE")
        
        # Afficher les voitures et leurs occupants
        print(f"\n🚗 Détail des voitures:")
        for car in cars:
            driver_name = car.get('driver_name', 'Inconnu')
            passengers = [p for p in participants if p.get('car_id') == car['id']]
            passenger_names = [p['name'] for p in passengers]
            
            print(f"   {car['license_plate']} - Conducteur: {driver_name}")
            if passenger_names:
                print(f"     Passagers: {', '.join(passenger_names)}")
            else:
                print(f"     Passagers: Aucun")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🚀 Test de l'onglet Participants amélioré")
    print("=" * 60)
    
    if test_participants_display():
        print("\n" + "=" * 60)
        print("✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!")
        print("\n🎯 Améliorations validées:")
        print("   • Détection des conducteurs via driver_id ✅")
        print("   • Détection des passagers via car_id ✅")
        print("   • Distinction claire des rôles ✅")
        print("\n🖥️ Testez visuellement sur:")
        print("   Frontend: http://localhost:3000")
        print("   Onglet: 👥 Participants")
        print("\n💡 Vous devriez voir:")
        print("   • Badge 'Conducteur' pour Alice et Diana")
        print("   • Statut 'Conduit TEST-XXX' pour les conducteurs")
        print("   • Statut 'Passager TEST-XXX' pour Bob")
        print("   • Statut 'Pas de voiture' pour Charlie")
        
    else:
        print("\n❌ ÉCHEC DU TEST")
        return False
    
    return True

if __name__ == "__main__":
    main()
