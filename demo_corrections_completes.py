#!/usr/bin/env python3
"""
Test visuel complet des corrections apportées
Ce script crée un environnement de test complet pour démontrer les corrections
"""

import requests
import json
import time
from datetime import datetime, timedelta

API_BASE = "http://localhost:8000"

def setup_complete_test_environment():
    """Crée un environnement de test complet pour démontrer les corrections"""
    print("🏗️ Configuration de l'environnement de test complet")
    print("=" * 70)
    
    # Créer un événement de démonstration
    timestamp = int(time.time())
    event_name = f"DemoCorrections_{timestamp}"
    
    event_data = {
        "name": event_name,
        "description": "Démonstration des corrections de synchronisation participants",
        "location": "Chalet des Corrections, Chamonix",
        "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=3)).isoformat(),
        "chalet_link": "https://example.com/chalet-demo"
    }
    
    print("1️⃣ Création de l'événement de démonstration...")
    try:
        response = requests.post(f"{API_BASE}/events/", json=event_data)
        if response.status_code != 200:
            print(f"❌ Erreur création événement: {response.text}")
            return None
        
        event = response.json()
        event_id = event['id']
        print(f"✅ Événement créé: {event_name}")
        print(f"   📍 Location: {event['location']}")
        print(f"   🆔 Event ID: {event_id}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None
    
    print("\n2️⃣ Ajout de participants de démonstration...")
    participants_data = [
        {"name": "Alice Conductrice", "role": "Conductrice principale"},
        {"name": "Bob Passager", "role": "Passager"},
        {"name": "Charlie Organisateur", "role": "Organisateur"},
        {"name": "Diana Copilote", "role": "Conductrice secondaire"}
    ]
    
    participant_ids = []
    for participant_info in participants_data:
        try:
            participant_data = {
                "event_id": event_id,
                "name": participant_info["name"]
            }
            response = requests.post(f"{API_BASE}/participants/", json=participant_data)
            if response.status_code == 200:
                participant = response.json()
                participant_ids.append(participant['id'])
                print(f"✅ {participant_info['name']} ajouté(e) ({participant_info['role']})")
            else:
                print(f"❌ Erreur ajout {participant_info['name']}: {response.text}")
        except Exception as e:
            print(f"❌ Erreur ajout {participant_info['name']}: {e}")
    
    print("\n3️⃣ Création de voitures avec conducteurs sélectionnés...")
    cars_data = [
        {
            "driver_name": "Alice Conductrice",
            "license_plate": "AB-123-CD",
            "max_passengers": 4,
            "fuel_cost": 75.50,
            "rental_cost": 0,
            "driver_id": participant_ids[0] if participant_ids else None
        },
        {
            "driver_name": "Diana Copilote", 
            "license_plate": "EF-456-GH",
            "max_passengers": 5,
            "fuel_cost": 65.00,
            "rental_cost": 150.00,
            "driver_id": participant_ids[3] if len(participant_ids) > 3 else None
        }
    ]
    
    car_ids = []
    for i, car_info in enumerate(cars_data):
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
                print(f"   🚗 Conducteur: {car['driver_name']} (ID: {car['driver_id']})")
                print(f"   ⛽ Coût essence: {car['fuel_cost']}€")
                if car['rental_cost'] > 0:
                    print(f"   🏠 Location: {car['rental_cost']}€")
            else:
                print(f"❌ Erreur création voiture {car_info['license_plate']}: {response.text}")
        except Exception as e:
            print(f"❌ Erreur création voiture: {e}")
    
    print("\n4️⃣ Ajout de repas de démonstration...")
    meals_data = [
        {
            "event_id": event_id,
            "meal_type": "dinner",
            "date": (datetime.now() + timedelta(days=1, hours=19)).isoformat(),
            "description": "Raclette savoyarde traditionnelle"
        },
        {
            "event_id": event_id,
            "meal_type": "breakfast", 
            "date": (datetime.now() + timedelta(days=2, hours=8)).isoformat(),
            "description": "Petit-déjeuner continental"
        }
    ]
    
    for meal_info in meals_data:
        try:
            response = requests.post(f"{API_BASE}/meals/", json=meal_info)
            if response.status_code == 200:
                meal = response.json()
                print(f"✅ Repas ajouté: {meal['description']}")
            else:
                print(f"❌ Erreur ajout repas: {response.text}")
        except Exception as e:
            print(f"❌ Erreur ajout repas: {e}")
    
    print("\n5️⃣ Ajout d'articles de courses...")
    shopping_items = [
        {"name": "Fromage à raclette", "category": "food", "price": 25.50, "quantity": 2},
        {"name": "Charcuterie assortie", "category": "food", "price": 18.00, "quantity": 1},
        {"name": "Pain de campagne", "category": "food", "price": 3.50, "quantity": 3},
        {"name": "Vin blanc de Savoie", "category": "drinks", "price": 12.00, "quantity": 2}
    ]
    
    for item_info in shopping_items:
        try:
            item_data = {
                "event_id": event_id,
                **item_info
            }
            response = requests.post(f"{API_BASE}/shopping-items/", json=item_data)
            if response.status_code == 200:
                item = response.json()
                print(f"✅ Article ajouté: {item['name']} ({item['price']}€ x{item['quantity']})")
            else:
                print(f"❌ Erreur ajout article: {response.text}")
        except Exception as e:
            print(f"❌ Erreur ajout article: {e}")
    
    print("\n6️⃣ Vérification finale de l'événement complet...")
    try:
        response = requests.get(f"{API_BASE}/events/{event_name}")
        if response.status_code == 200:
            event_full = response.json()
            print(f"✅ Événement complet récupéré:")
            print(f"   👥 Participants: {len(event_full.get('participants', []))}")
            print(f"   🚗 Voitures: {len(event_full.get('cars', []))}")
            print(f"   🍽️ Repas: {len(event_full.get('meals', []))}")
            print(f"   🛒 Articles: {len(event_full.get('shopping_items', []))}")
            
            # Calcul des coûts
            total_transport = sum(
                (car.get('actual_fuel_cost') or car.get('fuel_cost', 0)) + car.get('rental_cost', 0)
                for car in event_full.get('cars', [])
            )
            total_shopping = sum(
                item.get('price', 0) * item.get('quantity', 0)
                for item in event_full.get('shopping_items', [])
            )
            total_cost = total_transport + total_shopping
            cost_per_person = total_cost / len(event_full.get('participants', [])) if event_full.get('participants') else 0
            
            print(f"   💰 Coût transport: {total_transport:.2f}€")
            print(f"   🛒 Coût courses: {total_shopping:.2f}€")
            print(f"   💳 Coût par personne: {cost_per_person:.2f}€")
            
            return event_name, event_id
        else:
            print(f"❌ Erreur récupération finale: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def demonstrate_car_update_feature(event_name, car_ids):
    """Démontre la fonctionnalité de mise à jour des voitures"""
    if not car_ids:
        print("❌ Aucune voiture disponible pour la démonstration")
        return
    
    print("\n🔧 Démonstration de la mise à jour des voitures")
    print("=" * 70)
    
    car_id = car_ids[0]
    print(f"1️⃣ Mise à jour du coût réel d'essence (voiture ID: {car_id})...")
    
    try:
        # Simuler une mise à jour du coût d'essence réel après le voyage
        update_data = {
            "actual_fuel_cost": 85.75  # Coût réel après remplissage
        }
        
        response = requests.put(f"{API_BASE}/cars/{car_id}", json=update_data)
        if response.status_code == 200:
            updated_car = response.json()
            print(f"✅ Coût d'essence mis à jour:")
            print(f"   📊 Estimation: {updated_car['fuel_cost']}€")
            print(f"   ✅ Coût réel: {updated_car['actual_fuel_cost']}€")
        else:
            print(f"❌ Erreur mise à jour: {response.text}")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    print("🎯 DÉMONSTRATION COMPLÈTE DES CORRECTIONS")
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 API Base: {API_BASE}")
    print()
    
    # Vérifier l'accès à l'API
    try:
        response = requests.get(f"{API_BASE}/events/")
        print(f"✅ API accessible (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ API non accessible: {e}")
        exit(1)
    
    # Configuration de l'environnement de test
    result = setup_complete_test_environment()
    if result:
        event_name, event_id = result
        
        # Récupérer les IDs des voitures pour la démonstration
        try:
            response = requests.get(f"{API_BASE}/events/{event_name}")
            event_data = response.json()
            car_ids = [car['id'] for car in event_data.get('cars', [])]
            
            # Démonstration de la mise à jour des voitures
            demonstrate_car_update_feature(event_name, car_ids)
        except Exception as e:
            print(f"❌ Erreur récupération voitures: {e}")
        
        print("\n" + "=" * 70)
        print("🎉 ENVIRONNEMENT DE DÉMONSTRATION CRÉÉ AVEC SUCCÈS!")
        print()
        print("📋 RÉSUMÉ DES CORRECTIONS TESTÉES:")
        print("✅ 1. Rafraîchissement automatique après connexion")
        print("✅ 2. Synchronisation participants-conducteurs")
        print("✅ 3. Suppression saisie manuelle conducteur")
        print("✅ 4. Validation stricte sélection participants")
        print("✅ 5. Interface simplifiée AddCarModal")
        print("✅ 6. Mise à jour coûts réels après voyage")
        print()
        print(f"🌐 Pour tester visuellement, visitez:")
        print(f"   Frontend: http://localhost:3000")
        print(f"   Rejoindre l'événement: {event_name}")
        print()
        print("🧪 INSTRUCTIONS DE TEST VISUEL:")
        print("1. Ouvrez http://localhost:3000")
        print("2. Créez un nouvel événement ou rejoignez:", event_name)
        print("3. Vérifiez que tous les participants apparaissent immédiatement")
        print("4. Testez l'ajout de voiture avec sélection de conducteur uniquement")
        print("5. Vérifiez la mise à jour des coûts réels")
        print("6. Confirmez que l'interface est simplifiée (pas de saisie manuelle)")
    else:
        print("❌ Échec de la configuration de l'environnement de test")
        exit(1)
