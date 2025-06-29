#!/usr/bin/env python3
"""
Script de test pour la nouvelle fonctionnalité des contributeurs dans l'onglet shopping
et l'équilibre financier.
"""

import requests
import json
import time

def test_api_endpoints():
    """Teste les nouveaux endpoints de l'API."""
    base_url = "http://127.0.0.1:8000"
    
    print("🔍 Test des endpoints API")
    print("=" * 50)
    
    # Test de l'endpoint financial-balance
    try:
        response = requests.get(f"{base_url}/events/1/financial-balance")
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint financial-balance fonctionne")
            print(f"   Total des coûts: {data['total_cost']}€")
            print(f"   Coût par personne cible: {data['summary']['per_person_target']}€")
            
            print("\n💰 Balance des participants:")
            for participant, balance in data['participant_balance'].items():
                status = "💸 doit" if balance < 0 else "💰 créditeur"
                print(f"   {participant}: {balance}€ ({status})")
            
            if data['recommended_transfers']:
                print("\n🔄 Transferts recommandés:")
                for transfer in data['recommended_transfers']:
                    print(f"   {transfer['from']} → {transfer['to']}: {transfer['amount']}€")
            else:
                print("\n✅ Pas de transferts nécessaires")
        else:
            print(f"❌ Erreur endpoint financial-balance: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur lors du test financial-balance: {e}")
    
    # Test de l'endpoint costs
    try:
        response = requests.get(f"{base_url}/events/1/costs")
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Endpoint costs fonctionne")
            print(f"   Shopping: {data['total_shopping']}€")
            print(f"   Transport: {data['total_transport']}€")
            print(f"   Total: {data['total_cost']}€")
        else:
            print(f"❌ Erreur endpoint costs: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur lors du test costs: {e}")

def test_contributors_update():
    """Teste la mise à jour des contributeurs via l'API."""
    base_url = "http://127.0.0.1:8000"
    
    print("\n🔧 Test de mise à jour des contributeurs")
    print("=" * 50)
    
    # Test de mise à jour d'un article avec des contributeurs spécifiques
    try:
        # Récupérer un article
        response = requests.get(f"{base_url}/events/1/shopping")
        if response.status_code == 200:
            items = response.json()
            if items:
                item_id = items[0]['id']
                
                # Mettre à jour avec des contributeurs spécifiques
                update_data = {
                    "contributors": json.dumps(["Alice Martin", "Bob Durand"])
                }
                
                response = requests.put(
                    f"{base_url}/events/1/shopping/{item_id}",
                    json=update_data
                )
                
                if response.status_code == 200:
                    print(f"✅ Article {item_id} mis à jour avec contributeurs spécifiques")
                    
                    # Vérifier que la balance a changé
                    balance_response = requests.get(f"{base_url}/events/1/financial-balance")
                    if balance_response.status_code == 200:
                        print("✅ Recalcul de la balance réussi")
                    else:
                        print("❌ Erreur lors du recalcul de la balance")
                else:
                    print(f"❌ Erreur lors de la mise à jour: {response.status_code}")
                    print(f"   Réponse: {response.text}")
            else:
                print("❌ Aucun article trouvé")
        else:
            print(f"❌ Erreur lors de la récupération des articles: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur lors du test de mise à jour: {e}")

def display_current_state():
    """Affiche l'état actuel du shopping et des finances."""
    print("\n📊 État actuel du shopping et des finances")
    print("=" * 50)
    
    base_url = "http://127.0.0.1:8000"
    
    try:
        # Récupérer les articles de shopping
        response = requests.get(f"{base_url}/events/1/shopping")
        if response.status_code == 200:
            items = response.json()
            print("🛒 Articles de shopping:")
            for item in items:
                status = "✅ Acheté" if item.get('is_bought') else "⏳ En attente"
                bought_by = f" par {item.get('bought_by')}" if item.get('bought_by') else ""
                contributors = item.get('contributors', 'tous')
                if contributors != 'tous':
                    try:
                        contributors_list = json.loads(contributors)
                        contributors = f"{len(contributors_list)} personnes"
                    except:
                        contributors = "erreur"
                
                print(f"   • {item['name']} - {item['price']}€ ({status}{bought_by})")
                print(f"     Contributeurs: {contributors}")
        
        # Récupérer la balance financière
        response = requests.get(f"{base_url}/events/1/financial-balance")
        if response.status_code == 200:
            data = response.json()
            print(f"\n💰 Résumé financier:")
            print(f"   Total shopping: {data['summary']['total_shopping']}€")
            print(f"   Total transport: {data['summary']['total_transport']}€")
            print(f"   Coût par personne: {data['summary']['per_person_target']}€")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'affichage: {e}")

if __name__ == "__main__":
    print("🚀 Test des nouvelles fonctionnalités Chalet Vibe")
    print("📅 Contributors et équilibre financier")
    print("=" * 70)
    
    # Afficher l'état actuel
    display_current_state()
    
    # Tester les endpoints
    test_api_endpoints()
    
    # Tester la mise à jour des contributeurs
    test_contributors_update()
    
    print("\n" + "=" * 70)
    print("✅ Tests terminés!")
    print("🌐 Application disponible sur: http://localhost:3000")
    print("📖 API docs disponibles sur: http://127.0.0.1:8000/docs")
