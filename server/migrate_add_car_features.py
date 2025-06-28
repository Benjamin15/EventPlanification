#!/usr/bin/env python3
"""
Migration pour ajouter les nouvelles fonctionnalités de voiture:
- actual_fuel_cost: coût réel d'essence après le trajet
- driver_id: ID du conducteur participant
"""

import sqlite3
import os
from pathlib import Path

# Chemin vers la base de données
DB_PATH = Path(__file__).parent / "chalet_vibe.db"

def add_car_features():
    """Ajouter les nouvelles colonnes à la table cars"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔄 Ajout des nouvelles fonctionnalités de voiture...")
        
        # Vérifier les colonnes existantes
        cursor.execute("PRAGMA table_info(cars)")
        existing_columns = [col[1] for col in cursor.fetchall()]
        print(f"Colonnes existantes dans cars: {existing_columns}")
        
        # Ajouter actual_fuel_cost si elle n'existe pas
        if 'actual_fuel_cost' not in existing_columns:
            print("Ajout de la colonne actual_fuel_cost...")
            cursor.execute("ALTER TABLE cars ADD COLUMN actual_fuel_cost REAL DEFAULT 0.0")
            print("✅ Colonne actual_fuel_cost ajoutée avec succès!")
        else:
            print("✅ La colonne actual_fuel_cost existe déjà")
        
        # Ajouter driver_id si elle n'existe pas
        if 'driver_id' not in existing_columns:
            print("Ajout de la colonne driver_id...")
            cursor.execute("ALTER TABLE cars ADD COLUMN driver_id INTEGER DEFAULT NULL")
            print("✅ Colonne driver_id ajoutée avec succès!")
        else:
            print("✅ La colonne driver_id existe déjà")
        
        # Commit les changements
        conn.commit()
        
        # Vérifier la nouvelle structure
        cursor.execute("PRAGMA table_info(cars)")
        new_columns_info = cursor.fetchall()
        print("\n📋 Nouvelle structure de la table cars:")
        for col in new_columns_info:
            print(f"  - {col[1]} ({col[2]})")
            
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    add_car_features()
    print("\n🎉 Migration terminée avec succès!")
    print("Les nouvelles fonctionnalités de voiture sont maintenant disponibles :")
    print("  - actual_fuel_cost : Coût réel d'essence après le trajet")
    print("  - driver_id : Sélection du conducteur parmi les participants")
