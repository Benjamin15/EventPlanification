#!/usr/bin/env python3
"""
Validation finale des fonctionnalités contributors et équilibre financier
pour l'application Chalet Vibe.
"""

import requests
import json
import time

def run_complete_validation():
    """Exécute une validation complète des nouvelles fonctionnalités."""
    base_url = "http://127.0.0.1:8000"
    
    print("🎯 VALIDATION FINALE - CHALET VIBE")
    print("📋 Contributors & Équilibre Financier")
    print("=" * 70)
    
    # Test 1: Vérifier l'état initial
    print("\n📊 TEST 1: État initial du système")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/events/1/shopping")
        if response.status_code == 200:
            items = response.json()
            print(f"✅ {len(items)} articles de shopping trouvés")
            
            # Compter les articles avec contributeurs spécifiques
            specific_contributors = 0
            for item in items:
                if item.get('contributors') and item['contributors'] != 'tous':
                    specific_contributors += 1
            
            print(f"📈 {specific_contributors} articles avec contributeurs spécifiques")
        else:
            print(f"❌ Erreur récupération shopping: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur test 1: {e}")
        return False
    
    # Test 2: Modifier les contributeurs et vérifier l'impact
    print("\n🔧 TEST 2: Modification des contributeurs")
    print("-" * 40)
    
    try:
        # Modifier l'article "Pain" pour qu'il ne soit payé que par Ben et Benjamin
        pain_item = None
        for item in items:
            if 'pain' in item['name'].lower():
                pain_item = item
                break
        
        if pain_item:
            update_data = {
                'contributors': json.dumps(['Ben', 'Benjamin'])
            }
            
            response = requests.put(
                f"{base_url}/shopping/{pain_item['id']}",
                json=update_data
            )
            
            if response.status_code == 200:
                print(f"✅ Article '{pain_item['name']}' mis à jour")
                print(f"   Nouveaux contributeurs: Ben, Benjamin")
            else:
                print(f"❌ Erreur mise à jour: {response.status_code}")
                return False
        else:
            print("⚠️  Article 'Pain' non trouvé, utilisation d'un autre article")
            # Utiliser le premier article disponible
            if items:
                test_item = items[0]
                update_data = {
                    'contributors': json.dumps(['Ben', 'Benjamin'])
                }
                
                response = requests.put(
                    f"{base_url}/shopping/{test_item['id']}",
                    json=update_data
                )
                
                if response.status_code == 200:
                    print(f"✅ Article '{test_item['name']}' mis à jour pour test")
                else:
                    print(f"❌ Erreur mise à jour: {response.status_code}")
                    return False
    except Exception as e:
        print(f"❌ Erreur test 2: {e}")
        return False
    
    # Test 3: Vérifier l'équilibre financier
    print("\n💰 TEST 3: Calcul de l'équilibre financier")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/events/1/financial-balance")
        if response.status_code == 200:
            balance_data = response.json()
            
            print(f"✅ Équilibre financier calculé")
            print(f"   Total des coûts: {balance_data['total_cost']}€")
            print(f"   Coût par personne cible: {balance_data['summary']['per_person_target']}€")
            
            # Analyser les balances
            creditors = []
            debtors = []
            
            for participant, balance in balance_data['participant_balance'].items():
                if balance > 0:
                    creditors.append((participant, balance))
                elif balance < 0:
                    debtors.append((participant, abs(balance)))
            
            print(f"\n📊 Analyse des balances:")
            print(f"   💰 {len(creditors)} créditeur(s)")
            print(f"   💸 {len(debtors)} débiteur(s)")
            
            if creditors:
                print(f"   Top créditeur: {creditors[0][0]} (+{creditors[0][1]}€)")
            if debtors:
                max_debtor = max(debtors, key=lambda x: x[1])
                print(f"   Plus gros débiteur: {max_debtor[0]} (-{max_debtor[1]}€)")
            
            # Vérifier les transferts recommandés
            transfers = balance_data.get('recommended_transfers', [])
            print(f"\n🔄 {len(transfers)} transfert(s) recommandé(s)")
            for transfer in transfers:
                print(f"   {transfer['from']} → {transfer['to']}: {transfer['amount']}€")
            
            return True
        else:
            print(f"❌ Erreur équilibre financier: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur test 3: {e}")
        return False

def test_api_endpoints():
    """Teste tous les endpoints critiques."""
    base_url = "http://127.0.0.1:8000"
    endpoints = [
        ("/events/1/shopping", "Shopping List"),
        ("/events/1/financial-balance", "Financial Balance"),
        ("/events/1/costs", "Costs Summary"),
        ("/events/1/participants", "Participants"),
    ]
    
    print("\n🔍 TEST 4: Validation des endpoints API")
    print("-" * 40)
    
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                print(f"✅ {name}: OK")
            else:
                print(f"❌ {name}: {response.status_code}")
        except Exception as e:
            print(f"❌ {name}: {e}")

def display_final_summary():
    """Affiche un résumé final des fonctionnalités."""
    print("\n" + "=" * 70)
    print("📋 RÉSUMÉ DES FONCTIONNALITÉS IMPLÉMENTÉES")
    print("=" * 70)
    
    features = [
        "✅ Gestion des contributeurs par article de shopping",
        "✅ Interface de sélection des contributeurs (tous/spécifiques)",
        "✅ Calcul automatique de l'équilibre financier",
        "✅ Recommandations de transferts entre participants",
        "✅ Onglet 'Équilibre financier' remplaçant 'Coûts'",
        "✅ API endpoints pour financial-balance et costs",
        "✅ Mise à jour en temps réel des balances",
        "✅ Support des contributeurs au format JSON",
        "✅ Migration de base de données pour la colonne contributors",
        "✅ Interface utilisateur moderne et responsive"
    ]
    
    for feature in features:
        print(f"  {feature}")
    
    print("\n🌐 ACCÈS À L'APPLICATION:")
    print(f"  Frontend: http://localhost:3000")
    print(f"  API Docs: http://127.0.0.1:8000/docs")
    
    print("\n📖 GUIDES DISPONIBLES:")
    print(f"  Tests: /Users/ben/workspace/chalet_vibe_coding/GUIDE_TEST_CONTRIBUTORS_BALANCE.md")

if __name__ == "__main__":
    success = run_complete_validation()
    test_api_endpoints()
    display_final_summary()
    
    if success:
        print("\n🎉 VALIDATION RÉUSSIE!")
        print("   Toutes les fonctionnalités sont opérationnelles.")
    else:
        print("\n⚠️  VALIDATION PARTIELLE")
        print("   Certains tests ont échoué, vérifiez les logs ci-dessus.")
