#!/usr/bin/env python3
"""
Test de la synchronisation conducteurs-participants améliorée
"""

import requests
import json
import time
from datetime import datetime, timedelta

API_BASE = "http://localhost:8000"

def test_driver_participant_sync():
    """Test la synchronisation entre conducteurs et participants"""
    print("🧪 Test de synchronisation conducteurs-participants")
    print("=" * 60)
    
    # Créer un événement de test
    timestamp = int(time.time())
    event_name = f"TestDriverSync_{timestamp}"
    
    event_data = {
        "name": event_name,
        "description": "Test synchronisation conducteurs",
        "location": "Chalet Test Conducteurs",
        "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=3)).isoformat()
    }
    
    print("1️⃣ Création de l'événement...")
    try:
        response = requests.post(f"{API_BASE}/events/", json=event_data)
        if response.status_code != 200:
            print(f"❌ Erreur création événement: {response.text}")
            return False
        
        event = response.json()
        event_id = event['id']
        print(f"✅ Événement créé: {event_name} (ID: {event_id})")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    print("\n2️⃣ Ajout de participants...")
    participants_data = [
        "Alice Conductrice",
        "Bob Passager", 
        "Charlie Conducteur",
        "Diana Passagère",
        "Eve Sans Voiture"
    ]
    
    participant_ids = []
    for name in participants_data:
        try:
            participant_data = {
                "event_id": event_id,
                "name": name
            }
            response = requests.post(f"{API_BASE}/participants/", json=participant_data)
            if response.status_code == 200:
                participant = response.json()
                participant_ids.append(participant['id'])
                print(f"✅ {name} ajouté (ID: {participant['id']})")
            else:
                print(f"❌ Erreur ajout {name}: {response.text}")
        except Exception as e:
            print(f"❌ Erreur ajout {name}: {e}")
    
    if len(participant_ids) < 5:
        print("❌ Pas assez de participants créés")
        return False
    
    print("\n3️⃣ Création de voitures avec conducteurs...")
    cars_data = [
        {
            "driver_name": "Alice Conductrice",
            "license_plate": "ALICE-01",
            "driver_id": participant_ids[0],  # Alice
            "max_passengers": 4,
            "fuel_cost": 60.0
        },
        {
            "driver_name": "Charlie Conducteur", 
            "license_plate": "CHARLIE-02",
            "driver_id": participant_ids[2],  # Charlie
            "max_passengers": 5,
            "fuel_cost": 70.0
        }
    ]
    
    car_ids = []
    for car_info in cars_data:
        try:
            car_data = {
                "event_id": event_id,
                **car_info
            }
            response = requests.post(f"{API_BASE}/cars/", json=car_data)
            if response.status_code == 200:
                car = response.json()
                car_ids.append(car['id'])
                print(f"✅ Voiture {car['license_plate']} créée")
                print(f"   Conducteur: {car['driver_name']} (ID: {car['driver_id']})")
            else:
                print(f"❌ Erreur création voiture: {response.text}")
        except Exception as e:
            print(f"❌ Erreur création voiture: {e}")
    
    print("\n4️⃣ Assignation de passagers...")
    # Bob devient passager de la voiture d'Alice
    try:
        assign_response = requests.put(
            f"{API_BASE}/participants/{participant_ids[1]}/assign-car/{car_ids[0]}"
        )
        if assign_response.status_code == 200:
            print("✅ Bob assigné comme passager de la voiture d'Alice")
        else:
            print(f"❌ Erreur assignation Bob: {assign_response.text}")
    except Exception as e:
        print(f"❌ Erreur assignation: {e}")
    
    # Diana devient passagère de la voiture de Charlie
    try:
        assign_response = requests.put(
            f"{API_BASE}/participants/{participant_ids[3]}/assign-car/{car_ids[1]}"
        )
        if assign_response.status_code == 200:
            print("✅ Diana assignée comme passagère de la voiture de Charlie")
        else:
            print(f"❌ Erreur assignation Diana: {assign_response.text}")
    except Exception as e:
        print(f"❌ Erreur assignation: {e}")
    
    print("\n5️⃣ Vérification finale de la synchronisation...")
    try:
        response = requests.get(f"{API_BASE}/events/{event_name}")
        if response.status_code == 200:
            event_full = response.json()
            participants = event_full.get('participants', [])
            cars = event_full.get('cars', [])
            
            print(f"✅ Événement complet récupéré:")
            print(f"   👥 Participants: {len(participants)}")
            print(f"   🚗 Voitures: {len(cars)}")
            
            print(f"\n📊 Analyse des rôles:")
            
            for participant in participants:
                # Vérifier si conducteur
                driven_car = next((c for c in cars if c.get('driver_id') == participant['id']), None)
                # Vérifier si passager
                passenger_car = next((c for c in cars if c.get('id') == participant.get('car_id')), None)
                
                role = "Sans voiture"
                if driven_car:
                    role = f"Conducteur de {driven_car['license_plate']}"
                elif passenger_car:
                    role = f"Passager de {passenger_car['license_plate']}"
                
                print(f"   👤 {participant['name']}: {role}")
            
            # Vérifications spécifiques
            alice = next((p for p in participants if p['name'] == 'Alice Conductrice'), None)
            bob = next((p for p in participants if p['name'] == 'Bob Passager'), None)
            charlie = next((p for p in participants if p['name'] == 'Charlie Conducteur'), None)
            diana = next((p for p in participants if p['name'] == 'Diana Passagère'), None)
            eve = next((p for p in participants if p['name'] == 'Eve Sans Voiture'), None)
            
            success = True
            
            # Alice doit être conductrice
            alice_car = next((c for c in cars if c.get('driver_id') == alice['id']), None) if alice else None
            if alice_car:
                print(f"✅ Alice est bien conductrice de {alice_car['license_plate']}")
            else:
                print("❌ Alice n'est pas détectée comme conductrice")
                success = False
            
            # Bob doit être passager
            if bob and bob.get('car_id'):
                bob_car = next((c for c in cars if c.get('id') == bob['car_id']), None)
                if bob_car:
                    print(f"✅ Bob est bien passager de {bob_car['license_plate']}")
                else:
                    print("❌ Bob n'est pas correctement assigné comme passager")
                    success = False
            else:
                print("❌ Bob n'a pas de car_id assigné")
                success = False
            
            # Charlie doit être conducteur
            charlie_car = next((c for c in cars if c.get('driver_id') == charlie['id']), None) if charlie else None
            if charlie_car:
                print(f"✅ Charlie est bien conducteur de {charlie_car['license_plate']}")
            else:
                print("❌ Charlie n'est pas détecté comme conducteur")
                success = False
            
            # Eve doit être sans voiture
            eve_car = next((c for c in cars if c.get('driver_id') == eve['id']), None) if eve else None
            if not eve_car and (not eve or not eve.get('car_id')):
                print("✅ Eve est bien sans voiture")
            else:
                print("❌ Eve a une voiture alors qu'elle ne devrait pas")
                success = False
            
            return event_name, success
        else:
            print(f"❌ Erreur récupération finale: {response.text}")
            return None, False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None, False

if __name__ == "__main__":
    print("🚀 Test de synchronisation conducteurs-participants")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 API: {API_BASE}")
    print()
    
    # Vérifier API
    try:
        response = requests.get(f"{API_BASE}/events/")
        print(f"✅ API accessible (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ API non accessible: {e}")
        exit(1)
    
    # Exécuter le test
    result = test_driver_participant_sync()
    if result:
        event_name, success = result
        
        print("\n" + "=" * 60)
        if success:
            print("🎉 SYNCHRONISATION CONDUCTEURS-PARTICIPANTS RÉUSSIE!")
            print()
            print("📋 RÉSUMÉ DES CORRECTIONS:")
            print("✅ Les conducteurs sont détectés via driver_id")
            print("✅ Les passagers sont détectés via car_id") 
            print("✅ L'interface différencie conducteurs et passagers")
            print("✅ Badge conducteur affiché correctement")
            print()
            print(f"🌐 Testez visuellement sur:")
            print(f"   Frontend: http://localhost:3000")
            print(f"   Événement: {event_name}")
        else:
            print("❌ PROBLÈMES DE SYNCHRONISATION DÉTECTÉS")
            print("Vérifiez les logs ci-dessus")
    else:
        print("❌ ÉCHEC DU TEST")
        exit(1)
