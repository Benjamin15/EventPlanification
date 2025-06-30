#!/usr/bin/env python3
"""
🎯 DÉMONSTRATION DES NOUVELLES FONCTIONNALITÉS MOBILE
====================================================

Ce script démontre les deux nouvelles fonctionnalités implémentées :
1. Modification des informations générales de l'événement
2. Affichage amélioré des badges de participants

Date : 30 juin 2025
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
API_BASE_URL = "http://localhost:8000"
MOBILE_URL = "http://localhost:8082"

def print_section(title):
    """Affiche une section avec un titre stylé"""
    print(f"\n{'='*60}")
    print(f"🎯 {title}")
    print(f"{'='*60}")

def create_demo_event():
    """Créer un événement de démonstration avec des participants"""
    print_section("CRÉATION DE L'ÉVÉNEMENT DE DÉMONSTRATION")
    
    # Créer l'événement
    event_data = {
        "name": f"WeekendDemo_{int(time.time())}",
        "description": "Weekend test pour démonstration des nouvelles fonctionnalités",
        "location": "Chalet des Alpes, Chamonix",
        "start_date": "2025-07-15",
        "end_date": "2025-07-17",
        "chalet_link": "https://example.com/chalet-chamonix"
    }
    
    response = requests.post(f"{API_BASE_URL}/events", json=event_data)
    if response.status_code != 200:
        print(f"❌ Erreur création événement: {response.text}")
        return None
    
    event = response.json()
    print(f"✅ Événement créé: {event['name']}")
    print(f"   📍 Lieu: {event['location']}")
    print(f"   📅 Du {event['start_date']} au {event['end_date']}")
    print(f"   🔗 Lien: {event['chalet_link']}")
    
    return event

def add_participants(event_name):
    """Ajouter des participants avec différents rôles"""
    print_section("AJOUT DES PARTICIPANTS")
    
    participants = [
        "Alice Martin",
        "Bob Durand", 
        "Charlie Moreau",
        "Diana Petit",
        "Emma Rousseau"
    ]
    
    added_participants = []
    
    for participant_name in participants:
        response = requests.post(f"{API_BASE_URL}/events/{event_name}/join", json={
            "participant_name": participant_name
        })
        
        if response.status_code == 200:
            participant = response.json()
            added_participants.append(participant)
            print(f"✅ {participant_name} a rejoint l'événement")
        else:
            print(f"❌ Erreur ajout {participant_name}: {response.text}")
    
    return added_participants

def create_cars_with_drivers(event_name, participants):
    """Créer des voitures avec des conducteurs"""
    print_section("CRÉATION DES VOITURES")
    
    cars_data = [
        {
            "driver_name": "Alice Martin",
            "license_plate": "AM-123-FR",
            "max_passengers": 4,
            "fuel_cost": 85.0,
            "rental_cost": 120.0,
            "driver_id": participants[0]['id']  # Alice
        },
        {
            "driver_name": "Diana Petit",
            "license_plate": "DP-456-FR", 
            "max_passengers": 5,
            "fuel_cost": 75.0,
            "rental_cost": 100.0,
            "driver_id": participants[3]['id']  # Diana
        }
    ]
    
    cars = []
    for car_data in cars_data:
        car_data['event_id'] = get_event_id(event_name)
        response = requests.post(f"{API_BASE_URL}/cars", json=car_data)
        
        if response.status_code == 200:
            car = response.json()
            cars.append(car)
            print(f"🚗 Voiture créée: {car['license_plate']} - Conducteur: {car['driver_name']}")
        else:
            print(f"❌ Erreur création voiture: {response.text}")
    
    return cars

def assign_passengers(event_name, participants, cars):
    """Assigner des passagers aux voitures"""
    print_section("ASSIGNATION DES PASSAGERS")
    
    assignments = [
        (participants[1]['id'], cars[0]['id']),  # Bob -> voiture Alice
        (participants[2]['id'], cars[1]['id']),  # Charlie -> voiture Diana
    ]
    
    for participant_id, car_id in assignments:
        response = requests.post(f"{API_BASE_URL}/cars/{car_id}/assign", json={
            "participant_id": participant_id
        })
        
        if response.status_code == 200:
            participant_name = next(p['name'] for p in participants if p['id'] == participant_id)
            car_plate = next(c['license_plate'] for c in cars if c['id'] == car_id)
            print(f"👤 {participant_name} assigné à la voiture {car_plate}")
        else:
            print(f"❌ Erreur assignation passager: {response.text}")

def get_event_id(event_name):
    """Récupérer l'ID d'un événement par son nom"""
    response = requests.get(f"{API_BASE_URL}/events/{event_name}")
    if response.status_code == 200:
        return response.json()['id']
    return None

def demonstrate_features(event_name):
    """Démontrer les nouvelles fonctionnalités"""
    print_section("DÉMONSTRATION DES NOUVELLES FONCTIONNALITÉS")
    
    print("📱 FONCTIONNALITÉS DISPONIBLES DANS L'APPLICATION MOBILE:")
    print()
    print("1. ✏️ MODIFICATION DES INFORMATIONS GÉNÉRALES")
    print("   • Onglet 'Info' → Bouton 'Modifier' en haut à droite")
    print("   • Permet de modifier : nom, description, lieu, dates, lien chalet")
    print("   • Modal avec formulaire complet et validation")
    print()
    print("2. 👥 BADGES DE PARTICIPANTS AMÉLIORÉS")
    print("   • Onglet 'Participants' → Affichage avec badges visuels")
    print("   • Badge orange '👨‍✈️ Conducteur' pour les conducteurs")
    print("   • Statuts colorés et détaillés :")
    print("     - 🚗 Vert: 'Conduit [PLAQUE]' pour conducteurs")
    print("     - 🚗 Bleu: 'Passager [PLAQUE]' pour passagers") 
    print("     - 🚶 Gris: 'Sans voiture' pour non-assignés")
    print()
    print(f"📱 Ouvrez l'application mobile: {MOBILE_URL}")
    print(f"🔗 Rejoignez l'événement: {event_name}")

def main():
    """Fonction principale de démonstration"""
    print("🎉 DÉMONSTRATION DES NOUVELLES FONCTIONNALITÉS MOBILE")
    print("=" * 60)
    print("Date : 30 juin 2025")
    print("Fonctionnalités : Modification d'événement + Badges participants")
    print()
    
    try:
        # Créer l'événement
        event = create_demo_event()
        if not event:
            return
        
        event_name = event['name']
        
        # Ajouter les participants
        participants = add_participants(event_name)
        if not participants:
            print("❌ Aucun participant ajouté")
            return
        
        # Créer les voitures
        cars = create_cars_with_drivers(event_name, participants)
        if not cars:
            print("❌ Aucune voiture créée")
            return
        
        # Assigner les passagers
        assign_passengers(event_name, participants, cars)
        
        # Démontrer les fonctionnalités
        demonstrate_features(event_name)
        
        print_section("TESTS À EFFECTUER")
        print()
        print("🧪 TESTS DE LA MODIFICATION D'ÉVÉNEMENT :")
        print("1. Aller dans l'onglet 'Info'")
        print("2. Cliquer sur le bouton 'Modifier' (en haut à droite)")
        print("3. Modifier plusieurs champs (nom, description, lieu)")
        print("4. Sauvegarder et vérifier les modifications")
        print()
        print("🧪 TESTS DES BADGES DE PARTICIPANTS :")
        print("1. Aller dans l'onglet 'Participants'")
        print("2. Vérifier les badges :")
        print("   - Alice Martin : Badge orange 'Conducteur' + statut vert")
        print("   - Bob Durand : Pas de badge + statut bleu 'Passager'")
        print("   - Diana Petit : Badge orange 'Conducteur' + statut vert")
        print("   - Charlie Moreau : Pas de badge + statut bleu 'Passager'")
        print("   - Emma Rousseau : Pas de badge + statut gris 'Sans voiture'")
        print()
        print("✅ Toutes les fonctionnalités sont prêtes à être testées !")
        
    except Exception as e:
        print(f"❌ Erreur durant la démonstration: {e}")

if __name__ == "__main__":
    main()
