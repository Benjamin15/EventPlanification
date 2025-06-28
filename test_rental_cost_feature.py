#!/usr/bin/env python3
"""
Test complet de la fonctionnalité de coût de location des voitures
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_rental_cost_feature():
    """Test de l'ajout et du calcul des coûts de location"""
    print("🚗 Test de la fonctionnalité coût de location")
    print("=" * 50)
    
    # 1. Récupérer un événement existant
    print("1. Récupération d'un événement...")
    try:
        events_response = requests.get(f"{BASE_URL}/events")
        if events_response.status_code != 200:
            print("❌ Impossible de récupérer les événements")
            return False
            
        events = events_response.json()
        if not events:
            print("❌ Aucun événement trouvé")
            return False
            
        event_id = events[0]["id"]
        print(f"✅ Événement trouvé: ID {event_id}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des événements: {e}")
        return False
    
    # 2. Ajouter une voiture avec coût de location
    print("\n2. Ajout d'une voiture avec coût de location...")
    car_data = {
        "event_id": event_id,
        "driver_name": "Test Location",
        "license_plate": "LOC-123-TEST",
        "max_passengers": 4,
        "fuel_cost": 75.0,
        "rental_cost": 150.0  # Coût de location
    }
    
    try:
        car_response = requests.post(f"{BASE_URL}/events/{event_id}/cars", json=car_data)
        if car_response.status_code != 200:
            print(f"❌ Erreur lors de l'ajout de la voiture: {car_response.status_code}")
            print(car_response.text)
            return False
            
        car = car_response.json()
        car_id = car["id"]
        print(f"✅ Voiture ajoutée avec succès: ID {car_id}")
        print(f"   - Carburant: {car['fuel_cost']}$")
        print(f"   - Location: {car.get('rental_cost', 'N/A')}$")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'ajout de la voiture: {e}")
        return False
    
    # 3. Vérifier les calculs de coûts
    print("\n3. Vérification des calculs de coûts...")
    try:
        costs_response = requests.get(f"{BASE_URL}/events/{event_id}/costs")
        if costs_response.status_code != 200:
            print(f"❌ Erreur lors du calcul des coûts: {costs_response.status_code}")
            return False
            
        costs = costs_response.json()
        print("✅ Calculs de coûts:")
        print(f"   - Courses: {costs['total_shopping']}$")
        print(f"   - Carburant: {costs['total_fuel']}$")
        print(f"   - Location: {costs['total_rental']}$")
        print(f"   - Transport total: {costs['total_transport']}$")
        print(f"   - Coût total: {costs['total_cost']}$")
        print(f"   - Par personne: {costs['cost_per_person']}$")
        
        # Vérifier que le coût de location est inclus
        if costs['total_rental'] >= 150.0:
            print("✅ Coût de location correctement inclus")
        else:
            print("❌ Coût de location manquant ou incorrect")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification des coûts: {e}")
        return False
    
    # 4. Récupérer la liste des voitures pour vérifier l'affichage
    print("\n4. Vérification de l'affichage des voitures...")
    try:
        cars_response = requests.get(f"{BASE_URL}/events/{event_id}/cars")
        if cars_response.status_code != 200:
            print(f"❌ Erreur lors de la récupération des voitures: {cars_response.status_code}")
            return False
            
        cars = cars_response.json()
        rental_car = next((car for car in cars if car["id"] == car_id), None)
        
        if rental_car:
            print(f"✅ Voiture avec location trouvée:")
            print(f"   - {rental_car['license_plate']} - {rental_car['driver_name']}")
            print(f"   - Carburant: {rental_car['fuel_cost']}$")
            print(f"   - Location: {rental_car.get('rental_cost', 'N/A')}$")
        else:
            print("❌ Voiture avec location non trouvée")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification des voitures: {e}")
        return False
    
    print("\n🎉 Test de la fonctionnalité coût de location réussi!")
    return True

def cleanup_test_data():
    """Nettoie les données de test"""
    print("\n🧹 Nettoyage des données de test...")
    try:
        # Récupérer les événements
        events_response = requests.get(f"{BASE_URL}/events")
        if events_response.status_code == 200:
            events = events_response.json()
            for event in events:
                # Récupérer les voitures de test
                cars_response = requests.get(f"{BASE_URL}/events/{event['id']}/cars")
                if cars_response.status_code == 200:
                    cars = cars_response.json()
                    for car in cars:
                        if car.get("license_plate") == "LOC-123-TEST":
                            # Supprimer la voiture de test
                            delete_response = requests.delete(f"{BASE_URL}/cars/{car['id']}")
                            if delete_response.status_code == 200:
                                print(f"✅ Voiture de test supprimée: {car['license_plate']}")
        
    except Exception as e:
        print(f"⚠️ Erreur lors du nettoyage: {e}")

if __name__ == "__main__":
    print("🧪 Test de la fonctionnalité coût de location")
    print("Assurez-vous que le serveur backend est démarré sur http://localhost:8000")
    print()
    
    # Exécuter le test
    success = test_rental_cost_feature()
    
    # Nettoyer les données de test
    cleanup_test_data()
    
    # Résultat final
    if success:
        print("\n✅ Tous les tests sont passés!")
        sys.exit(0)
    else:
        print("\n❌ Certains tests ont échoué!")
        sys.exit(1)
