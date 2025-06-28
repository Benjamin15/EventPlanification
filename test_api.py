#!/usr/bin/env python3
"""
Script de test pour vérifier que l'API Chalet Vibe fonctionne correctement
"""
import requests
import json

def test_api():
    base_url = "http://localhost:8000"
    
    print("🧪 Tests de l'API Chalet Vibe")
    print("=" * 50)
    
    # Test 1: Récupérer tous les événements
    print("1. Test GET /events")
    try:
        response = requests.get(f"{base_url}/events")
        if response.status_code == 200:
            events = response.json()
            print(f"   ✅ Succès: {len(events)} événements trouvés")
            for event in events:
                print(f"      - {event['name']} ({event['date']})")
        else:
            print(f"   ❌ Erreur: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    # Test 2: Rechercher un événement par nom
    print("\n2. Test GET /events/search")
    try:
        response = requests.get(f"{base_url}/events/search", params={"name": "Chamonix"})
        if response.status_code == 200:
            events = response.json()
            print(f"   ✅ Succès: {len(events)} événements trouvés pour 'Chamonix'")
        else:
            print(f"   ❌ Erreur: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    # Test 3: Obtenir les détails d'un événement
    print("\n3. Test GET /events/1")
    try:
        response = requests.get(f"{base_url}/events/1")
        if response.status_code == 200:
            event = response.json()
            print(f"   ✅ Succès: Événement '{event['name']}' récupéré")
            print(f"      Participants: {len(event['participants'])}")
            print(f"      Repas: {len(event['meals'])}")
        else:
            print(f"   ❌ Erreur: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    # Test 4: Ajouter un participant
    print("\n4. Test POST /events/1/participants")
    try:
        participant_data = {"name": "Test User", "email": "test@example.com"}
        response = requests.post(f"{base_url}/events/1/participants", json=participant_data)
        if response.status_code == 200:
            participant = response.json()
            print(f"   ✅ Succès: Participant '{participant['name']}' ajouté")
        else:
            print(f"   ❌ Erreur: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    # Test 5: Calculer les coûts
    print("\n5. Test GET /events/1/costs")
    try:
        response = requests.get(f"{base_url}/events/1/costs")
        if response.status_code == 200:
            costs = response.json()
            print(f"   ✅ Succès: Coût total {costs['total_cost']}€")
            print(f"      Coût par personne: {costs['cost_per_person']}€")
        else:
            print(f"   ❌ Erreur: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    print("\n🎉 Tests terminés!")

if __name__ == "__main__":
    test_api()
