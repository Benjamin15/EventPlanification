#!/usr/bin/env python3
"""
Migration pour ajouter le champ contributors à la table shopping_items
Ce champ stockera les participants qui contribuent au paiement de chaque article
"""

import sqlite3
import os

def migrate_add_contributors():
    """Ajouter le champ contributors à la table shopping_items"""
    db_path = "chalet_vibe.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Base de données {db_path} non trouvée")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔄 Ajout du champ contributors à la table shopping_items...")
        
        # Vérifier les colonnes existantes
        cursor.execute("PRAGMA table_info(shopping_items)")
        existing_columns = [col[1] for col in cursor.fetchall()]
        print(f"Colonnes existantes dans shopping_items: {existing_columns}")
        
        # Ajouter la nouvelle colonne si elle n'existe pas
        if 'contributors' not in existing_columns:
            print("Ajout de la colonne contributors...")
            cursor.execute("ALTER TABLE shopping_items ADD COLUMN contributors TEXT NULL")
            print("✅ Colonne contributors ajoutée avec succès!")
            
            # Initialiser avec "tous" par défaut pour les articles existants
            cursor.execute("UPDATE shopping_items SET contributors = 'tous' WHERE contributors IS NULL")
            print("✅ Valeurs par défaut définies (tous les participants contribuent)")
        else:
            print("✅ La colonne contributors existe déjà")
        
        # Commit les changements
        conn.commit()
        
        # Vérifier la nouvelle structure
        cursor.execute("PRAGMA table_info(shopping_items)")
        new_columns_info = cursor.fetchall()
        print("\n📋 Nouvelle structure de la table shopping_items:")
        for col in new_columns_info:
            print(f"  - {col[1]} ({col[2]})")
            
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_add_contributors()
