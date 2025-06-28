#!/usr/bin/env python3
"""
Script pour créer un environnement de test complet pour les fonctionnalités de voitures
"""

import requests
import json
import time
from datetime import datetime, timedelta

API_BASE = "http://localhost:8000"

def create_test_environment():
    """Créer un environnement de test complet avec événement, participants et voitures"""
    print("🏗️ Création d'un environnement de test complet")
    print("=" * 50)
    
    # Créer l'événement
    timestamp = int(time.time())
    event_data = {
        "name": f"Weekend Ski Chamonix {timestamp}",
        "description": "Weekend ski avec gestion complète du transport",
        "location": "Chamonix, France",
        "start_date": (datetime.now() + timedelta(days=7)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=9)).isoformat(),
        "chalet_link": "https://www.chamonix-chalet.com/exemple"
    }
    
    response = requests.post(f"{API_BASE}/events/", json=event_data)
    if response.status_code != 200:
        print(f"❌ Erreur création événement: {response.text}")
        return None
    
    event = response.json()
    event_id = event['id']
    event_name = event['name']
    print(f"✅ Événement créé: {event_name}")
    print(f"📍 ID: {event_id}")
    
    # Ajouter des participants variés
    participants_data = [
        "Alice Martin",  # Sera conductrice
        "Bob Dupont",
        "Charlie Moreau", 
        "Diana Petit",   # Sera conductrice
        "Emma Rousseau",
        "Frank Dubois"
    ]
    
    participant_ids = []
    print(f"\n👥 Ajout des participants:")
    for name in participants_data:
        participant_data = {"name": name, "event_id": event_id}
        response = requests.post(f"{API_BASE}/participants/", json=participant_data)
        if response.status_code == 200:
            participant = response.json()
            participant_ids.append(participant['id'])
            print(f"  ✅ {name}")
        else:
            print(f"  ❌ {name}: {response.text}")
    
    # Ajouter des voitures avec caractéristiques différentes
    cars_data = [
        {
            "event_id": event_id,
            "driver_name": "Alice Martin",
            "license_plate": "AB-123-CD",
            "max_passengers": 4,
            "fuel_cost": 85.00  # Voyage plus long
        },
        {
            "event_id": event_id,
            "driver_name": "Diana Petit",
            "license_plate": "EF-456-GH", 
            "max_passengers": 5,
            "fuel_cost": 70.00
        },
        {
            "event_id": event_id,
            "driver_name": "Frank Dubois",
            "license_plate": "IJ-789-KL",
            "max_passengers": 3,  # Petite voiture
            "fuel_cost": 55.00
        }
    ]
    
    car_ids = []
    print(f"\n🚗 Ajout des voitures:")
    for car_data in cars_data:
        response = requests.post(f"{API_BASE}/cars/", json=car_data)
        if response.status_code == 200:
            car = response.json()
            car_ids.append(car['id'])
            print(f"  ✅ {car['license_plate']} - {car['driver_name']} ({car['max_passengers']} places, {car['fuel_cost']}$)")
        else:
            print(f"  ❌ {car_data['license_plate']}: {response.text}")
    
    # Ajouter quelques repas pour rendre l'événement plus réaliste
    meals_data = [
        {
            "event_id": event_id,
            "meal_type": "dinner",
            "date": (datetime.now() + timedelta(days=7, hours=19)).isoformat(),
            "description": "Fondue savoyarde d'arrivée"
        },
        {
            "event_id": event_id,
            "meal_type": "breakfast", 
            "date": (datetime.now() + timedelta(days=8, hours=8)).isoformat(),
            "description": "Petit-déjeuner avant ski"
        },
        {
            "event_id": event_id,
            "meal_type": "dinner",
            "date": (datetime.now() + timedelta(days=8, hours=20)).isoformat(),
            "description": "Raclette après ski"
        }
    ]
    
    print(f"\n🍽️ Ajout des repas:")
    for meal_data in meals_data:
        response = requests.post(f"{API_BASE}/meals/", json=meal_data)
        if response.status_code == 200:
            print(f"  ✅ {meal_data['meal_type']}: {meal_data['description']}")
        else:
            print(f"  ❌ {meal_data['meal_type']}: {response.text}")
    
    # Ajouter des articles de courses
    shopping_items = [
        {"name": "Fromage à raclette", "category": "food", "price": 28.50, "quantity": 3},
        {"name": "Charcuterie de montagne", "category": "food", "price": 22.00, "quantity": 2},
        {"name": "Pommes de terre", "category": "food", "price": 6.50, "quantity": 5},
        {"name": "Vin de Savoie", "category": "drinks", "price": 15.00, "quantity": 4},
        {"name": "Pain de montagne", "category": "food", "price": 4.20, "quantity": 3},
        {"name": "Beurre fermier", "category": "food", "price": 3.80, "quantity": 2}
    ]
    
    print(f"\n🛒 Ajout d'articles de courses:")
    for item_data in shopping_items:
        item_data["event_id"] = event_id
        response = requests.post(f"{API_BASE}/shopping/", json=item_data)
        if response.status_code == 200:
            print(f"  ✅ {item_data['name']} - {item_data['price']}$")
        else:
            print(f"  ❌ {item_data['name']}: {response.text}")
    
    # Faire quelques assignations initiales pour démonstration
    if len(participant_ids) >= 4 and len(car_ids) >= 2:
        print(f"\n👥 Assignations de démonstration:")
        
        # Alice (conductrice) dans sa propre voiture
        response = requests.put(f"{API_BASE}/participants/{participant_ids[0]}/car/{car_ids[0]}")
        if response.status_code == 200:
            print(f"  ✅ Alice assignée à sa voiture")
        
        # Bob avec Alice
        response = requests.put(f"{API_BASE}/participants/{participant_ids[1]}/car/{car_ids[0]}")
        if response.status_code == 200:
            print(f"  ✅ Bob assigné avec Alice")
        
        # Diana (conductrice) dans sa propre voiture
        response = requests.put(f"{API_BASE}/participants/{participant_ids[3]}/car/{car_ids[1]}")
        if response.status_code == 200:
            print(f"  ✅ Diana assignée à sa voiture")
    
    print(f"\n" + "=" * 50)
    print(f"🎉 ENVIRONNEMENT DE TEST CRÉÉ AVEC SUCCÈS!")
    print(f"")
    print(f"📝 **Nom de l'événement:** {event_name}")
    print(f"🆔 **ID de l'événement:** {event_id}")
    print(f"👥 **Participants:** {len(participant_ids)} personnes")
    print(f"🚗 **Voitures:** {len(car_ids)} véhicules")
    print(f"🍽️ **Repas:** {len(meals_data)} repas planifiés")
    print(f"🛒 **Courses:** {len(shopping_items)} articles")
    print(f"")
    print(f"🌐 **Pour tester dans le frontend:**")
    print(f"   1. Ouvrir: http://localhost:3000")
    print(f"   2. Rejoindre l'événement: {event_name}")
    print(f"   3. Utiliser n'importe quel nom de participant")
    print(f"   4. Tester la section '🚗 Organisation du transport'")
    print(f"   5. Cliquer sur '👥 Gérer les passagers'")
    print(f"")
    print(f"🧪 **Fonctionnalités à tester:**")
    print(f"   ✅ Assignation de participants aux voitures")
    print(f"   ✅ Retrait de participants des voitures") 
    print(f"   ✅ Calcul automatique des coûts par personne")
    print(f"   ✅ Vérification des limites de capacité")
    print(f"   ✅ Interface responsive sur mobile")
    
    return {
        "event_id": event_id,
        "event_name": event_name,
        "participant_ids": participant_ids,
        "car_ids": car_ids
    }

if __name__ == "__main__":
    try:
        result = create_test_environment()
        if result:
            print(f"\n💾 Environnement prêt pour les tests!")
        else:
            print(f"\n❌ Échec de la création de l'environnement")
    except Exception as e:
        print(f"\n💥 Erreur inattendue: {e}")
