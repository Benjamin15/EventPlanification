#!/usr/bin/env python3
"""
Script de test pour vérifier les nouveaux endpoints DELETE
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"

def test_endpoints():
    print("🧪 TEST DES NOUVEAUX ENDPOINTS DELETE")
    print("=" * 50)
    
    # Test de l'endpoint DELETE pour les articles de courses
    print("\n1. Test DELETE /shopping/{item_id}")
    try:
        # On teste avec un ID qui n'existe probablement pas pour voir la réponse
        response = requests.delete(f"{BASE_URL}/shopping/999")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 404:
            print("   ✅ Endpoint DELETE /shopping/{item_id} existe (erreur 404 attendue)")
        elif response.status_code == 405:
            print("   ❌ Endpoint DELETE /shopping/{item_id} n'existe pas (erreur 405)")
        else:
            print(f"   ⚠️  Réponse inattendue: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    # Test de l'endpoint DELETE pour les voitures
    print("\n2. Test DELETE /cars/{car_id}")
    try:
        response = requests.delete(f"{BASE_URL}/cars/999")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 404:
            print("   ✅ Endpoint DELETE /cars/{car_id} existe (erreur 404 attendue)")
        elif response.status_code == 405:
            print("   ❌ Endpoint DELETE /cars/{car_id} n'existe pas (erreur 405)")
        else:
            print(f"   ⚠️  Réponse inattendue: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    # Test de l'endpoint DELETE pour les activités (doit déjà fonctionner)
    print("\n3. Test DELETE /activities/{activity_id}")
    try:
        response = requests.delete(f"{BASE_URL}/activities/999")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 404:
            print("   ✅ Endpoint DELETE /activities/{activity_id} existe et fonctionne")
        elif response.status_code == 405:
            print("   ❌ Endpoint DELETE /activities/{activity_id} a un problème")
        else:
            print(f"   ⚠️  Réponse inattendue: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 RÉSUMÉ:")
    print("   Si tous les endpoints renvoient 404 (au lieu de 405),")
    print("   alors les endpoints DELETE sont maintenant disponibles.")
    print("   L'erreur 404 est normale car on teste avec des IDs inexistants.")
    print("\n✨ Test terminé !")

if __name__ == "__main__":
    test_endpoints()
