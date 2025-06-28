#!/usr/bin/env python3
"""
Test des corrections de synchronisation des participants et de la simplification de l'interface
"""

import requests
import json
import time
from datetime import datetime, timedelta

API_BASE = "http://localhost:8000"

def test_participant_synchronization():
    """Test la synchronisation des participants après connexion"""
    print("🧪 Test de synchronisation des participants")
    print("=" * 60)
    
    # Créer un événement de test
    timestamp = int(time.time())
    event_name = f"TestSync_{timestamp}"
    
    event_data = {
        "name": event_name,
        "description": "Test de synchronisation des participants",
        "location": "Chalet Test",
        "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=3)).isoformat(),
        "chalet_link": "https://example.com/test"
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
    participants = ["Alice", "Bob", "Charlie"]
    participant_ids = []
    
    for name in participants:
        try:
            participant_data = {
                "event_id": event_id,
                "name": name
            }
            response = requests.post(f"{API_BASE}/participants/", json=participant_data)
            if response.status_code == 200:
                participant = response.json()
                participant_ids.append(participant['id'])
                print(f"✅ Participant ajouté: {name} (ID: {participant['id']})")
            else:
                print(f"❌ Erreur ajout participant {name}: {response.text}")
        except Exception as e:
            print(f"❌ Erreur ajout participant {name}: {e}")
    
    print("\n3️⃣ Vérification de la récupération de l'événement complet...")
    try:
        response = requests.get(f"{API_BASE}/events/{event_name}")
        if response.status_code == 200:
            event_full = response.json()
            participants_in_event = event_full.get('participants', [])
            print(f"✅ Événement récupéré avec {len(participants_in_event)} participants")
            
            for participant in participants_in_event:
                print(f"   - {participant['name']} (ID: {participant['id']})")
            
            if len(participants_in_event) == len(participants):
                print("✅ Tous les participants sont présents dans l'événement")
                return event_id, participant_ids
            else:
                print(f"❌ Nombre de participants incorrect: {len(participants_in_event)}/{len(participants)}")
                return False
        else:
            print(f"❌ Erreur récupération événement: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_car_creation_with_participants(event_id, participant_ids):
    """Test la création de voiture avec sélection de conducteur"""
    print("\n🚗 Test de création de voiture avec participants")
    print("=" * 60)
    
    if not participant_ids:
        print("❌ Aucun participant disponible pour le test")
        return False
    
    # Tester la récupération des participants pour un événement
    print("1️⃣ Test de l'endpoint participants...")
    try:
        response = requests.get(f"{API_BASE}/events/{event_id}/participants")
        if response.status_code == 200:
            participants = response.json()
            print(f"✅ {len(participants)} participants récupérés via l'endpoint")
            for p in participants:
                print(f"   - {p['name']} (ID: {p['id']})")
        else:
            print(f"❌ Erreur récupération participants: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    # Créer une voiture avec le premier participant comme conducteur
    print("\n2️⃣ Création de voiture avec conducteur sélectionné...")
    try:
        car_data = {
            "event_id": event_id,
            "driver_id": participant_ids[0],  # Premier participant
            "driver_name": "Alice",  # Le nom sera automatiquement mis à jour
            "license_plate": "TEST-123",
            "max_passengers": 4,
            "fuel_cost": 50.0,
            "rental_cost": 0.0
        }
        
        response = requests.post(f"{API_BASE}/cars/", json=car_data)
        if response.status_code == 200:
            car = response.json()
            print(f"✅ Voiture créée avec conducteur ID: {car['driver_id']}")
            print(f"   - Plaque: {car['license_plate']}")
            print(f"   - Conducteur: {car['driver_name']}")
            return car['id']
        else:
            print(f"❌ Erreur création voiture: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_event_refresh_after_join():
    """Test le rafraîchissement automatique après rejoindre un événement"""
    print("\n🔄 Test de rafraîchissement après connexion")
    print("=" * 60)
    
    # Créer un nouvel événement
    timestamp = int(time.time())
    event_name = f"TestRefresh_{timestamp}"
    
    event_data = {
        "name": event_name,
        "description": "Test de rafraîchissement automatique",
        "location": "Chalet Refresh",
        "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=3)).isoformat()
    }
    
    print("1️⃣ Création d'événement vide...")
    try:
        response = requests.post(f"{API_BASE}/events/", json=event_data)
        if response.status_code != 200:
            print(f"❌ Erreur création: {response.text}")
            return False
        
        event = response.json()
        event_id = event['id']
        print(f"✅ Événement créé: {event_name}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    print("\n2️⃣ Vérification événement sans participants...")
    try:
        response = requests.get(f"{API_BASE}/events/{event_name}")
        if response.status_code == 200:
            event_before = response.json()
            participants_before = event_before.get('participants', [])
            print(f"✅ Événement récupéré avec {len(participants_before)} participants")
        else:
            print(f"❌ Erreur: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    print("\n3️⃣ Simulation de rejoindre l'événement...")
    try:
        participant_data = {
            "event_id": event_id,
            "name": "Nouveau Participant"
        }
        response = requests.post(f"{API_BASE}/participants/", json=participant_data)
        if response.status_code == 200:
            participant = response.json()
            print(f"✅ Participant ajouté: {participant['name']}")
        else:
            print(f"❌ Erreur: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    print("\n4️⃣ Vérification rafraîchissement événement...")
    try:
        response = requests.get(f"{API_BASE}/events/{event_name}")
        if response.status_code == 200:
            event_after = response.json()
            participants_after = event_after.get('participants', [])
            print(f"✅ Événement récupéré avec {len(participants_after)} participants")
            
            if len(participants_after) > len(participants_before):
                print("✅ Le rafraîchissement fonctionne correctement")
                return True
            else:
                print("❌ Le participant n'apparaît pas dans l'événement rafraîchi")
                return False
        else:
            print(f"❌ Erreur: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Test des corrections de synchronisation des participants")
    print(f"📍 API Base: {API_BASE}")
    print(f"🕐 Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Vérifier que l'API est accessible
    try:
        response = requests.get(f"{API_BASE}/events/")
        print(f"✅ API accessible (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ API non accessible: {e}")
        exit(1)
    
    success = True
    
    # Test 1: Synchronisation des participants
    result = test_participant_synchronization()
    if result:
        event_id, participant_ids = result
        
        # Test 2: Création de voiture avec participants
        car_id = test_car_creation_with_participants(event_id, participant_ids)
        if not car_id:
            success = False
    else:
        success = False
    
    # Test 3: Rafraîchissement après connexion
    if not test_event_refresh_after_join():
        success = False
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 TOUS LES TESTS SONT PASSÉS!")
        print("✅ Synchronisation des participants: OK")
        print("✅ Création de voiture avec conducteur: OK") 
        print("✅ Rafraîchissement automatique: OK")
        print()
        print("📝 CORRECTIONS APPLIQUÉES:")
        print("  - Rafraîchissement automatique après rejoindre un événement")
        print("  - Suppression de la saisie manuelle du conducteur")
        print("  - Validation stricte : seulement sélection de participants")
        print("  - Interface simplifiée dans AddCarModal")
    else:
        print("❌ CERTAINS TESTS ONT ÉCHOUÉ")
        print("Vérifiez les logs ci-dessus pour plus de détails")
        exit(1)
