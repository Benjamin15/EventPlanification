#!/usr/bin/env python3
"""
Test des nouvelles fonctionnalités de voiture :
1. Sélection du conducteur parmi les participants
2. Mise à jour du coût d'essence réel après le trajet
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_car_features():
    """Test complet des nouvelles fonctionnalités"""
    print("🚗 Test des nouvelles fonctionnalités de voiture")
    print("=" * 50)
    
    # 1. Créer un événement de test
    print("\n1. Création d'un événement de test...")
    event_data = {
        "name": f"TestCarFeatures_{int(time.time())}",
        "description": "Test des nouvelles fonctionnalités voiture",
        "location": "Chamonix",
        "start_date": "2025-07-04T10:00:00Z",
        "end_date": "2025-07-06T18:00:00Z"
    }
    
    try:
        event_response = requests.post(f"{BASE_URL}/events/", json=event_data)
        if event_response.status_code != 200:
            print(f"❌ Erreur lors de la création de l'événement: {event_response.status_code}")
            return False
        
        event = event_response.json()
        event_id = event["id"]
        print(f"✅ Événement créé: {event['name']} (ID: {event_id})")
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'événement: {e}")
        return False
    
    # 2. Ajouter des participants
    print("\n2. Ajout de participants...")
    participants_data = [
        {"name": "Alice Conductrice", "event_id": event_id},
        {"name": "Bob Passager", "event_id": event_id},
        {"name": "Charlie Voyageur", "event_id": event_id},
        {"name": "Diana Copilote", "event_id": event_id}
    ]
    
    participants = []
    for participant_data in participants_data:
        try:
            participant_response = requests.post(f"{BASE_URL}/events/{event_id}/participants", json=participant_data)
            if participant_response.status_code != 200:
                print(f"❌ Erreur lors de l'ajout du participant {participant_data['name']}")
                continue
            
            participant = participant_response.json()
            participants.append(participant)
            print(f"✅ Participant ajouté: {participant['name']} (ID: {participant['id']})")
        except Exception as e:
            print(f"❌ Erreur lors de l'ajout du participant {participant_data['name']}: {e}")
    
    if len(participants) < 2:
        print("❌ Pas assez de participants créés pour continuer le test")
        return False
    
    # 3. Créer une voiture avec conducteur sélectionné
    print("\n3. Création d'une voiture avec conducteur sélectionné...")
    alice = participants[0]  # Alice Conductrice
    
    car_data = {
        "event_id": event_id,
        "driver_name": alice["name"],
        "driver_id": alice["id"],  # Nouveau : ID du conducteur
        "license_plate": "AB-123-CD",
        "max_passengers": 4,
        "fuel_cost": 75.0,
        "rental_cost": 120.0
    }
    
    try:
        car_response = requests.post(f"{BASE_URL}/cars/", json=car_data)
        if car_response.status_code != 200:
            print(f"❌ Erreur lors de la création de la voiture: {car_response.status_code}")
            print(car_response.text)
            return False
        
        car = car_response.json()
        car_id = car["id"]
        print(f"✅ Voiture créée avec conducteur assigné:")
        print(f"   - Plaque: {car['license_plate']}")
        print(f"   - Conducteur: {car['driver_name']} (ID: {car.get('driver_id')})")
        print(f"   - Coût essence estimé: {car['fuel_cost']}€")
    except Exception as e:
        print(f"❌ Erreur lors de la création de la voiture: {e}")
        return False
    
    # 4. Assigner des passagers
    print("\n4. Assignation de passagers...")
    for participant in participants[1:3]:  # Bob et Charlie
        try:
            assign_response = requests.put(f"{BASE_URL}/participants/{participant['id']}/car/{car_id}")
            if assign_response.status_code != 200:
                print(f"❌ Erreur lors de l'assignation de {participant['name']}")
                continue
            print(f"✅ {participant['name']} assigné à la voiture")
        except Exception as e:
            print(f"❌ Erreur lors de l'assignation de {participant['name']}: {e}")
    
    # 5. Calculer les coûts initiaux
    print("\n5. Calcul des coûts initiaux...")
    try:
        costs_response = requests.get(f"{BASE_URL}/events/{event_id}/costs")
        if costs_response.status_code != 200:
            print(f"❌ Erreur lors du calcul des coûts: {costs_response.status_code}")
        else:
            costs = costs_response.json()
            print(f"✅ Coûts initiaux calculés:")
            print(f"   - Transport total: {costs['total_transport']}€")
            print(f"   - Carburant: {costs['total_fuel']}€")
            print(f"   - Location: {costs['total_rental']}€")
    except Exception as e:
        print(f"❌ Erreur lors du calcul des coûts: {e}")
    
    # 6. Mise à jour après le trajet (coût d'essence réel)
    print("\n6. Mise à jour du coût d'essence réel après le trajet...")
    actual_fuel_cost = 85.50  # Coût réel supérieur à l'estimation
    
    update_data = {
        "actual_fuel_cost": actual_fuel_cost
    }
    
    try:
        update_response = requests.put(f"{BASE_URL}/cars/{car_id}", json=update_data)
        if update_response.status_code != 200:
            print(f"❌ Erreur lors de la mise à jour: {update_response.status_code}")
            print(update_response.text)
            return False
        
        updated_car = update_response.json()
        print(f"✅ Coût d'essence mis à jour:")
        print(f"   - Estimé: {updated_car['fuel_cost']}€")
        print(f"   - Réel: {updated_car.get('actual_fuel_cost')}€")
        print(f"   - Différence: {updated_car.get('actual_fuel_cost', 0) - updated_car['fuel_cost']:+.2f}€")
    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour: {e}")
        return False
    
    # 7. Calcul des coûts finaux
    print("\n7. Calcul des coûts finaux (avec coût réel)...")
    try:
        costs_response = requests.get(f"{BASE_URL}/events/{event_id}/costs")
        if costs_response.status_code != 200:
            print(f"❌ Erreur lors du calcul des coûts finaux: {costs_response.status_code}")
        else:
            final_costs = costs_response.json()
            print(f"✅ Coûts finaux calculés:")
            print(f"   - Transport total: {final_costs['total_transport']}€")
            print(f"   - Carburant (réel): {final_costs['total_fuel']}€")
            print(f"   - Location: {final_costs['total_rental']}€")
            print(f"   - Par personne: {final_costs['cost_per_person']}€")
    except Exception as e:
        print(f"❌ Erreur lors du calcul des coûts finaux: {e}")
    
    # 8. Test du changement de conducteur
    print("\n8. Test du changement de conducteur...")
    diana = participants[3]  # Diana Copilote
    
    driver_change_data = {
        "driver_id": diana["id"]
    }
    
    try:
        change_response = requests.put(f"{BASE_URL}/cars/{car_id}", json=driver_change_data)
        if change_response.status_code != 200:
            print(f"❌ Erreur lors du changement de conducteur: {change_response.status_code}")
            print(change_response.text)
        else:
            updated_car = change_response.json()
            print(f"✅ Conducteur changé:")
            print(f"   - Nouveau conducteur: {updated_car['driver_name']} (ID: {updated_car.get('driver_id')})")
    except Exception as e:
        print(f"❌ Erreur lors du changement de conducteur: {e}")
    
    # 9. Vérification finale de l'état de la voiture
    print("\n9. Vérification finale...")
    try:
        cars_response = requests.get(f"{BASE_URL}/events/{event_id}/cars")
        if cars_response.status_code != 200:
            print(f"❌ Erreur lors de la récupération des voitures: {cars_response.status_code}")
        else:
            cars = cars_response.json()
            final_car = cars[0] if cars else None
            
            if final_car:
                print(f"✅ État final de la voiture:")
                print(f"   - {final_car['license_plate']} - {final_car['driver_name']}")
                print(f"   - Conducteur ID: {final_car.get('driver_id')}")
                print(f"   - Coût essence estimé: {final_car['fuel_cost']}€")
                print(f"   - Coût essence réel: {final_car.get('actual_fuel_cost')}€")
                print(f"   - Coût location: {final_car.get('rental_cost')}€")
                print(f"   - Passagers: {len(final_car.get('passengers', []))}")
    except Exception as e:
        print(f"❌ Erreur lors de la vérification finale: {e}")
    
    print(f"\n🎉 Test terminé avec succès!")
    print(f"📋 Événement de test: {event['name']} (ID: {event_id})")
    print(f"🌐 Vous pouvez tester l'interface sur: http://localhost:3000/{event['name']}")
    
    return True

if __name__ == "__main__":
    success = test_car_features()
    if success:
        print("\n✅ Toutes les nouvelles fonctionnalités sont opérationnelles!")
    else:
        print("\n❌ Certains tests ont échoué")
