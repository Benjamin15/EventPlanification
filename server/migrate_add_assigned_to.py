#!/usr/bin/env python3
"""
Migration pour ajouter le champ assigned_to à la table shopping_items
"""

import sqlite3
import os

def migrate_add_assigned_to():
    db_path = "/Users/ben/workspace/chalet_vibe_coding/server/chalet_vibe.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Base de données non trouvée : {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Vérifier si la colonne existe déjà
        cursor.execute("PRAGMA table_info(shopping_items)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'assigned_to' in columns:
            print("✅ La colonne 'assigned_to' existe déjà dans la table shopping_items")
            conn.close()
            return True
        
        # Ajouter la colonne assigned_to
        cursor.execute("""
            ALTER TABLE shopping_items 
            ADD COLUMN assigned_to TEXT NULL
        """)
        
        conn.commit()
        conn.close()
        
        print("✅ Migration réussie : colonne 'assigned_to' ajoutée à la table shopping_items")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la migration : {e}")
        return False

if __name__ == "__main__":
    migrate_add_assigned_to()
