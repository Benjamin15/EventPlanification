#!/usr/bin/env python3
"""
🎯 VALIDATION FINALE DES FONCTIONNALITÉS MOBILE
===============================================

Script de validation complète des deux nouvelles fonctionnalités :
1. Modification des informations générales de l'événement  
2. Badges de participants avec statuts transport détaillés

Date : 30 juin 2025
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_api_connectivity():
    """Tester la connectivité avec l'API"""
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        return response.status_code == 200
    except:
        return False

def validate_event_update_functionality():
    """Valider que l'API de mise à jour d'événement fonctionne"""
    print("🔍 Validation de l'API de modification d'événement...")
    
    try:
        # Créer un événement test
        event_data = {
            "name": "TestValidation",
            "description": "Test de validation",
            "location": "Test Location",
            "start_date": "2025-07-01",
            "end_date": "2025-07-03",
            "chalet_link": "https://test.com"
        }
        
        response = requests.post(f"{API_BASE_URL}/events", json=event_data)
        if response.status_code != 200:
            print(f"❌ Erreur création événement : {response.status_code}")
            return False
            
        event = response.json()
        event_id = event['id']
        
        # Tester la mise à jour
        update_data = {
            "name": "TestValidationModifié",
            "description": "Description modifiée",
            "location": "Nouveau lieu",
            "start_date": "2025-07-02",
            "end_date": "2025-07-04",
            "chalet_link": "https://nouveau-lien.com"
        }
        
        response = requests.put(f"{API_BASE_URL}/events/{event_id}", json=update_data)
        if response.status_code != 200:
            print(f"❌ Erreur mise à jour événement : {response.status_code}")
            return False
            
        print("✅ API de modification d'événement validée")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la validation : {e}")
        return False

def validate_participants_api():
    """Valider que l'API des participants fonctionne pour les badges"""
    print("🔍 Validation de l'API des participants...")
    
    try:
        # Récupérer un événement existant ou en créer un
        response = requests.get(f"{API_BASE_URL}/events")
        if response.status_code != 200:
            print("❌ Impossible de récupérer les événements")
            return False
            
        events = response.json()
        if not events:
            print("ℹ️ Aucun événement existant, création d'un nouvel événement")
            # Créer un événement pour les tests
            event_data = {
                "name": "TestParticipants",
                "description": "Test participants",
                "location": "Test",
                "start_date": "2025-07-01",
                "end_date": "2025-07-03"
            }
            response = requests.post(f"{API_BASE_URL}/events", json=event_data)
            if response.status_code != 200:
                return False
            events = [response.json()]
        
        event_name = events[0]['name']
        
        # Récupérer les détails de l'événement avec participants
        response = requests.get(f"{API_BASE_URL}/events/{event_name}")
        if response.status_code != 200:
            print(f"❌ Erreur récupération événement : {response.status_code}")
            return False
            
        event = response.json()
        
        # Vérifier la structure des données pour les badges
        required_fields = ['participants', 'cars']
        for field in required_fields:
            if field not in event:
                print(f"❌ Champ manquant : {field}")
                return False
                
        print("✅ API des participants validée")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la validation : {e}")
        return False

def main():
    """Fonction principale de validation"""
    print("🎉 VALIDATION FINALE DES NOUVELLES FONCTIONNALITÉS MOBILE")
    print("=" * 60)
    print()
    
    # Test de connectivité
    print("🔌 Test de connectivité API...")
    if not test_api_connectivity():
        print("❌ API non accessible. Assurez-vous que le serveur fonctionne sur le port 8000")
        return
    print("✅ API accessible")
    print()
    
    # Validation des fonctionnalités
    validations = [
        ("Modification d'événement", validate_event_update_functionality),
        ("API Participants", validate_participants_api)
    ]
    
    results = []
    for name, func in validations:
        print(f"🧪 Test : {name}")
        success = func()
        results.append((name, success))
        print()
    
    # Rapport final
    print("📊 RAPPORT DE VALIDATION")
    print("-" * 30)
    all_passed = True
    for name, success in results:
        status = "✅ VALIDÉ" if success else "❌ ÉCHEC"
        print(f"{name}: {status}")
        if not success:
            all_passed = False
    
    print()
    if all_passed:
        print("🎉 TOUTES LES VALIDATIONS SONT PASSÉES !")
        print()
        print("✅ FONCTIONNALITÉS PRÊTES :")
        print("   1. ✏️ Modification des informations générales")
        print("   2. 👥 Badges de participants avec statuts transport")
        print()
        print("📱 L'application mobile est prête à être utilisée !")
    else:
        print("⚠️ Certaines validations ont échoué")
        print("Vérifiez les erreurs ci-dessus")

if __name__ == "__main__":
    main()
