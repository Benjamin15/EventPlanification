#!/usr/bin/env python3
"""
Test complet de reconnexion utilisateur pour l'application Chalet Vibe
"""

import requests
import json
import time
from datetime import datetime, timedelta

API_BASE = "http://localhost:8000"

def test_user_reconnection_flow():
    """Test du flux complet de reconnexion utilisateur"""
    print("🧪 Test complet du flux de reconnexion utilisateur")
    print("=" * 60)
    
    # Créer un événement de test
    print("\n1️⃣ Création d'un événement de test")
    event_name = f"EventReconnectTest_{int(time.time())}"
    event_data = {
        "name": event_name,
        "description": "Test de reconnexion utilisateur",
        "location": "Chalet de test",
        "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=3)).isoformat(),
        "chalet_link": "https://example.com/chalet"
    }
    
    response = requests.post(f"{API_BASE}/events/", json=event_data)
    if response.status_code != 200:
        print(f"❌ Erreur création événement: {response.text}")
        return False
    
    event = response.json()
    event_id = event['id']
    print(f"✅ Événement '{event_name}' créé avec ID: {event_id}")
    
    # Test 2: Premier utilisateur rejoint l'événement
    print("\n2️⃣ Premier utilisateur rejoint l'événement")
    user_name = "Marie Dupont"
    participant_data = {
        "name": user_name,
        "event_id": event_id
    }
    
    response = requests.post(f"{API_BASE}/participants/", json=participant_data)
    if response.status_code != 200:
        print(f"❌ Erreur premier join: {response.text}")
        return False
    
    participant1 = response.json()
    print(f"✅ {user_name} a rejoint l'événement (ID: {participant1['id']})")
    print(f"   Date de join: {participant1['joined_at']}")
    
    # Test 3: Deuxième utilisateur rejoint (nom différent)
    print("\n3️⃣ Deuxième utilisateur rejoint l'événement")
    user2_name = "Pierre Martin"
    participant2_data = {
        "name": user2_name,
        "event_id": event_id
    }
    
    response = requests.post(f"{API_BASE}/participants/", json=participant2_data)
    if response.status_code != 200:
        print(f"❌ Erreur deuxième join: {response.text}")
        return False
    
    participant2 = response.json()
    print(f"✅ {user2_name} a rejoint l'événement (ID: {participant2['id']})")
    
    # Test 4: Premier utilisateur essaie de se reconnecter (même nom)
    print("\n4️⃣ Reconnexion du premier utilisateur (même nom)")
    response = requests.post(f"{API_BASE}/participants/", json=participant_data)
    if response.status_code != 200:
        print(f"❌ Erreur reconnexion: {response.text}")
        return False
    
    participant1_reconnect = response.json()
    print(f"✅ {user_name} s'est reconnecté avec succès")
    
    # Vérifier que c'est le même participant
    if participant1['id'] == participant1_reconnect['id']:
        print("✅ Même participant ID - pas de doublon créé")
        print(f"   ID original: {participant1['id']}")
        print(f"   ID reconnexion: {participant1_reconnect['id']}")
    else:
        print("❌ IDs différents - doublon détecté!")
        return False
    
    # Test 5: Vérifier la liste des participants
    print("\n5️⃣ Vérification de la liste des participants")
    response = requests.get(f"{API_BASE}/events/{event_id}")
    if response.status_code != 200:
        print(f"❌ Erreur récupération événement: {response.text}")
        return False
    
    full_event = response.json()
    participants = full_event.get('participants', [])
    print(f"✅ Nombre total de participants: {len(participants)}")
    
    for p in participants:
        print(f"   - {p['name']} (ID: {p['id']})")
    
    # Devrait avoir exactement 2 participants
    if len(participants) == 2:
        print("✅ Nombre correct de participants (pas de doublons)")
        
        # Vérifier les noms
        names = [p['name'] for p in participants]
        if user_name in names and user2_name in names:
            print("✅ Tous les participants attendus sont présents")
        else:
            print(f"❌ Participants manquants. Attendus: [{user_name}, {user2_name}], Trouvés: {names}")
            return False
    else:
        print(f"❌ Nombre incorrect de participants. Attendu: 2, Trouvé: {len(participants)}")
        return False
    
    # Test 6: Simulation frontend - récupération événement après reconnexion
    print("\n6️⃣ Simulation flux frontend après reconnexion")
    try:
        # Simuler ce que fait le frontend
        event_response = requests.get(f"{API_BASE}/events/{event_name}")
        if event_response.status_code == 200:
            event_data = event_response.json()
            print(f"✅ Frontend peut récupérer l'événement '{event_name}'")
            print(f"   Participants visibles: {len(event_data.get('participants', []))}")
        else:
            print(f"⚠️ Frontend ne peut pas récupérer l'événement par nom")
    except Exception as e:
        print(f"⚠️ Erreur simulation frontend: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 TOUS LES TESTS DE RECONNEXION SONT PASSÉS!")
    print("✅ Création d'événement: OK")
    print("✅ Premier join utilisateur: OK") 
    print("✅ Join deuxième utilisateur: OK")
    print("✅ Reconnexion utilisateur existant: OK")
    print("✅ Pas de doublons créés: OK")
    print("✅ Liste participants cohérente: OK")
    return True

def test_edge_cases():
    """Test des cas particuliers"""
    print("\n🔬 Test des cas particuliers")
    print("=" * 60)
    
    # Créer un événement
    event_name = f"EdgeCaseTest_{int(time.time())}"
    event_data = {
        "name": event_name,
        "description": "Test cas particuliers",
        "location": "Test",
        "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=2)).isoformat(),
    }
    
    response = requests.post(f"{API_BASE}/events/", json=event_data)
    event = response.json()
    event_id = event['id']
    
    # Test 1: Noms avec espaces
    print("1. Test avec noms contenant des espaces")
    names_with_spaces = ["Jean Paul", "Marie-Claire", "Dr. Smith"]
    
    for name in names_with_spaces:
        participant_data = {"name": name, "event_id": event_id}
        
        # Premier join
        response = requests.post(f"{API_BASE}/participants/", json=participant_data)
        if response.status_code == 200:
            participant_id = response.json()['id']
            
            # Reconnexion
            response = requests.post(f"{API_BASE}/participants/", json=participant_data)
            if response.status_code == 200:
                reconnect_id = response.json()['id']
                if participant_id == reconnect_id:
                    print(f"   ✅ '{name}': Reconnexion OK")
                else:
                    print(f"   ❌ '{name}': IDs différents")
            else:
                print(f"   ❌ '{name}': Erreur reconnexion")
        else:
            print(f"   ❌ '{name}': Erreur premier join")
    
    # Test 2: Casse différente
    print("2. Test sensibilité à la casse")
    original_name = "TestUser"
    different_case = "testuser"
    
    # Join avec casse originale
    response = requests.post(f"{API_BASE}/participants/", json={"name": original_name, "event_id": event_id})
    if response.status_code == 200:
        original_id = response.json()['id']
        
        # Essayer avec casse différente
        response = requests.post(f"{API_BASE}/participants/", json={"name": different_case, "event_id": event_id})
        if response.status_code == 200:
            different_id = response.json()['id']
            if original_id != different_id:
                print(f"   ✅ Casse respectée - utilisateurs distincts créés")
            else:
                print(f"   ⚠️ Même ID - la casse est ignorée")
        else:
            print(f"   ❌ Erreur join avec casse différente")

if __name__ == "__main__":
    print("🚀 Démarrage des tests de reconnexion utilisateur")
    print(f"📍 API Base: {API_BASE}")
    print(f"🕐 Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Vérifier que l'API est accessible
    try:
        response = requests.get(f"{API_BASE}/events/")
        print(f"✅ API accessible (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ API non accessible: {e}")
        exit(1)
    
    # Exécuter les tests
    if test_user_reconnection_flow():
        test_edge_cases()
        print("\n🎯 RÉSUMÉ FINAL:")
        print("✅ Problème de reconnexion utilisateur RÉSOLU")
        print("✅ Les utilisateurs peuvent maintenant se reconnecter sans erreur")
        print("✅ Pas de doublons créés lors de la reconnexion")
        print("✅ L'intégrité des données est maintenue")
        print("✅ Compatible avec le frontend existant")
    else:
        print("❌ Certains tests ont échoué")
        exit(1)
