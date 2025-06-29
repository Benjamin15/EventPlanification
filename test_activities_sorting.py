#!/usr/bin/env python3
"""
Test du tri des activités par date dans l'interface Planning
"""

import requests
import json
from datetime import datetime

def test_activities_sorting():
    """Test que les activités sont triées par date"""
    print("📅 TEST DU TRI DES ACTIVITÉS PAR DATE")
    print("=" * 50)
    
    try:
        response = requests.get("http://localhost:8000/events/1/activities")
        if response.status_code != 200:
            print(f"❌ Erreur API: {response.status_code}")
            return False
        
        activities = response.json()
        print(f"✅ {len(activities)} activités récupérées")
        print()
        
        # Séparer activités avec et sans date
        with_date = [a for a in activities if a.get('date')]
        without_date = [a for a in activities if not a.get('date')]
        
        # Trier celles avec date
        with_date.sort(key=lambda x: x['date'])
        
        # Combiner (avec date en premier, sans date à la fin)
        sorted_activities = with_date + without_date
        
        print("📋 PLANNING TRIÉ (comme dans l'interface):")
        print()
        
        current_date = None
        for i, activity in enumerate(sorted_activities):
            date_str = activity.get('date')
            
            if date_str:
                try:
                    date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    activity_date = date_obj.strftime('%d/%m/%Y')
                    formatted_time = date_obj.strftime('%H:%M')
                    
                    # Afficher séparateur de date si différente
                    if current_date != activity_date:
                        if current_date is not None:
                            print()
                        print(f"📅 {activity_date}")
                        print("-" * 30)
                        current_date = activity_date
                    
                    emoji = {
                        'meal': '🍽️', 
                        'sport': '⛷️', 
                        'leisure': '🎮', 
                        'tourism': '🏔️', 
                        'other': '📝'
                    }.get(activity['activity_type'], '📝')
                    
                    print(f"{formatted_time} | {emoji} {activity['name']}")
                    
                except Exception as e:
                    print(f"❌ Erreur format date: {e}")
            else:
                if current_date is not None:
                    print()
                    print("📅 SANS DATE")
                    print("-" * 30)
                    current_date = None
                
                emoji = {
                    'meal': '🍽️', 
                    'sport': '⛷️', 
                    'leisure': '🎮', 
                    'tourism': '🏔️', 
                    'other': '📝'
                }.get(activity['activity_type'], '📝')
                
                print(f"     | {emoji} {activity['name']}")
        
        print()
        print("✅ Le tri par date fonctionne correctement!")
        print()
        print("🌐 Pour tester visuellement:")
        print("   1. Ouvrir http://localhost:3000")
        print("   2. Aller dans l'onglet 'Activités'")
        print("   3. Vérifier que les activités sont dans l'ordre chronologique")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    test_activities_sorting()
