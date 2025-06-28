#!/usr/bin/env python3
"""
Migration pour ajouter la colonne rental_cost à la table cars
"""

import sqlite3
import os
from pathlib import Path

# Chemin vers la base de données
DB_PATH = Path(__file__).parent / "chalet_vibe.db"

def add_rental_cost_column():
    """Ajouter la colonne rental_cost à la table cars"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔄 Ajout de la colonne rental_cost à la table cars...")
        
        # Vérifier les colonnes existantes
        cursor.execute("PRAGMA table_info(cars)")
        existing_columns = [col[1] for col in cursor.fetchall()]
        print(f"Colonnes existantes dans cars: {existing_columns}")
        
        # Ajouter la nouvelle colonne si elle n'existe pas
        if 'rental_cost' not in existing_columns:
            print("Ajout de la colonne rental_cost...")
            cursor.execute("ALTER TABLE cars ADD COLUMN rental_cost REAL DEFAULT 0.0")
            print("✅ Colonne rental_cost ajoutée avec succès!")
        else:
            print("✅ La colonne rental_cost existe déjà")
        
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
    add_rental_cost_column()
    print("\n🎉 Migration terminée avec succès!")
    print("La colonne rental_cost est maintenant disponible pour stocker les coûts de location des voitures.")
