#!/usr/bin/env python3
"""
Script de synchronisation des conducteurs
Corrige le problème où les voitures ont driver_name mais pas driver_id
"""

import requests
import json

API_BASE = "http://localhost:8000"

def sync_drivers():
    """Synchronise les driver_id avec les driver_name existants"""
    print("🔧 SYNCHRONISATION DES CONDUCTEURS")
    print("=" * 50)
    
    # Récupérer l'événement complet
    try:
        response = requests.get(f"{API_BASE}/events/1")
        if response.status_code != 200:
            print(f"❌ Erreur lors de la récupération de l'événement: {response.status_code}")
            return False
        
        event = response.json()
        participants = event.get('participants', [])
        cars = event.get('cars', [])
        
        print(f"📊 État actuel:")
        print(f"   • {len(participants)} participants")
        print(f"   • {len(cars)} voitures")
        print()
        
    except Exception as e:
        print(f"❌ Erreur API: {e}")
        return False
    
    # Créer un mapping nom -> id pour les participants
    name_to_id = {p['name']: p['id'] for p in participants}
    
    # Synchroniser chaque voiture
    updates_made = 0
    for car in cars:
        driver_name = car.get('driver_name')
        current_driver_id = car.get('driver_id')
        
        if driver_name and not current_driver_id:
            # Trouver l'ID du participant correspondant
            if driver_name in name_to_id:
                participant_id = name_to_id[driver_name]
                
                # Mettre à jour la voiture
                update_data = {"driver_id": participant_id}
                
                try:
                    update_response = requests.put(f"{API_BASE}/cars/{car['id']}", json=update_data)
                    if update_response.status_code == 200:
                        print(f"✅ Voiture {car['license_plate']}: {driver_name} → ID {participant_id}")
                        updates_made += 1
                    else:
                        print(f"❌ Échec mise à jour {car['license_plate']}: {update_response.status_code}")
                        print(f"   Réponse: {update_response.text}")
                except Exception as e:
                    print(f"❌ Erreur lors de la mise à jour de {car['license_plate']}: {e}")
            else:
                print(f"⚠️  Conducteur '{driver_name}' non trouvé dans les participants")
        elif driver_name and current_driver_id:
            print(f"ℹ️  Voiture {car['license_plate']}: déjà synchronisée (ID {current_driver_id})")
        else:
            print(f"⚠️  Voiture {car['license_plate']}: pas de conducteur défini")
    
    print()
    print(f"🎯 Résumé: {updates_made} voiture(s) synchronisée(s)")
    
    return updates_made > 0

def verify_sync():
    """Vérifie que la synchronisation a fonctionné"""
    print("\n🔍 VÉRIFICATION DE LA SYNCHRONISATION")
    print("=" * 50)
    
    try:
        response = requests.get(f"{API_BASE}/events/1")
        if response.status_code != 200:
            print(f"❌ Erreur lors de la vérification: {response.status_code}")
            return False
        
        event = response.json()
        participants = event.get('participants', [])
        cars = event.get('cars', [])
        
        # Analyser les rôles après synchronisation
        drivers = []
        passengers = []
        unassigned = []
        
        for participant in participants:
            participant_id = participant['id']
            participant_name = participant['name']
            car_id = participant.get('car_id')
            
            # Vérifier si conducteur
            is_driver = any(car['driver_id'] == participant_id for car in cars)
            
            if is_driver:
                driven_car = next(car for car in cars if car['driver_id'] == participant_id)
                drivers.append({
                    'participant': participant_name,
                    'car': driven_car['license_plate']
                })
            elif car_id:
                # Passager
                passenger_car = next((car for car in cars if car['id'] == car_id), None)
                if passenger_car:
                    passengers.append({
                        'participant': participant_name,
                        'car': passenger_car['license_plate']
                    })
            else:
                # Sans voiture
                unassigned.append(participant_name)
        
        # Afficher les résultats
        print(f"👨‍✈️ CONDUCTEURS ({len(drivers)}):")
        for driver in drivers:
            print(f"   • {driver['participant']} → 🚗 {driver['car']}")
        
        print(f"\n🚶 PASSAGERS ({len(passengers)}):")
        for passenger in passengers:
            print(f"   • {passenger['participant']} → 🚗 {passenger['car']}")
        
        print(f"\n❌ SANS VOITURE ({len(unassigned)}):")
        for person in unassigned:
            print(f"   • {person}")
        
        print(f"\n🎉 Synchronisation réussie ! Les conducteurs sont maintenant détectés.")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la vérification: {e}")
        return False

def main():
    """Fonction principale"""
    print("🚗 CORRECTION DES BUGS CONDUCTEURS ET ACTIVITÉS")
    print("=" * 60)
    print()
    
    # 1. Synchroniser les conducteurs
    if sync_drivers():
        # 2. Vérifier que ça marche
        verify_sync()
        
        print("\n🌐 INSTRUCTIONS DE TEST:")
        print("1. Rechargez http://localhost:3000")
        print("2. Allez dans l'onglet 'Participants'")
        print("3. Vérifiez que les badges 'Conducteur' apparaissent")
        print("4. Allez dans l'onglet 'Activités'")
        print("5. Vérifiez que les activités s'affichent")
        
    else:
        print("\n❌ Aucune synchronisation effectuée")

if __name__ == "__main__":
    main()
