#!/usr/bin/env python3
"""
Script de migration de la base de données pour ajouter les nouvelles colonnes à event_photos
"""

import sqlite3
import os
from pathlib import Path

# Chemin vers la base de données
DB_PATH = Path(__file__).parent / "chalet_vibe.db"

def migrate_event_photos_table():
    """Migrer la table event_photos pour ajouter les nouvelles colonnes"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔄 Migration de la table event_photos...")
        
        # Vérifier les colonnes existantes
        cursor.execute("PRAGMA table_info(event_photos)")
        existing_columns = [col[1] for col in cursor.fetchall()]
        print(f"Colonnes existantes: {existing_columns}")
        
        # Nouvelles colonnes à ajouter
        new_columns = [
            ("original_filename", "VARCHAR"),
            ("file_path", "VARCHAR"),
            ("file_size", "INTEGER"),
            ("mime_type", "VARCHAR"),
            ("upload_date", "DATETIME DEFAULT CURRENT_TIMESTAMP")
        ]
        
        # Ajouter les nouvelles colonnes si elles n'existent pas
        for col_name, col_type in new_columns:
            if col_name not in existing_columns:
                print(f"Ajout de la colonne: {col_name}")
                cursor.execute(f"ALTER TABLE event_photos ADD COLUMN {col_name} {col_type}")
        
        # Commit les changements
        conn.commit()
        print("✅ Migration terminée avec succès!")
        
        # Vérifier la nouvelle structure
        cursor.execute("PRAGMA table_info(event_photos)")
        new_columns_info = cursor.fetchall()
        print("\n📋 Nouvelle structure de la table:")
        for col in new_columns_info:
            print(f"  - {col[1]} ({col[2]})")
            
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_event_photos_table()
