#!/usr/bin/env python3
"""
Migration pour transformer meals en activities
"""

import sqlite3
from datetime import datetime

def migrate_meals_to_activities():
    """Transforme la table meals en activities"""
    
    print("🔄 Migration: Meals → Activities")
    print("=" * 50)
    
    # Connexion à la base de données
    conn = sqlite3.connect('chalet_vibe.db')
    cursor = conn.cursor()
    
    try:
        # 1. Vérifier si la table activities existe déjà
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='activities'
        """)
        
        if cursor.fetchone():
            print("✅ Table activities existe déjà")
            return
        
        # 2. Créer la nouvelle table activities
        print("📋 Création de la table activities...")
        cursor.execute("""
            CREATE TABLE activities (
                id INTEGER PRIMARY KEY,
                event_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                activity_type TEXT NOT NULL,
                date DATETIME,
                description TEXT,
                location TEXT,
                max_participants INTEGER,
                FOREIGN KEY (event_id) REFERENCES events (id)
            )
        """)
        
        # 3. Migrer les données existantes de meals vers activities
        print("📦 Migration des repas existants...")
        cursor.execute("SELECT * FROM meals")
        meals = cursor.fetchall()
        
        meal_type_mapping = {
            'breakfast': 'Petit-déjeuner',
            'lunch': 'Déjeuner', 
            'dinner': 'Dîner'
        }
        
        for meal in meals:
            meal_id, event_id, meal_type, date, description = meal
            
            # Convertir le type de repas en nom d'activité
            activity_name = meal_type_mapping.get(meal_type, meal_type.title())
            
            cursor.execute("""
                INSERT INTO activities (event_id, name, activity_type, date, description)
                VALUES (?, ?, ?, ?, ?)
            """, (event_id, activity_name, 'meal', date, description))
        
        print(f"✅ {len(meals)} repas migrés vers activities")
        
        # 4. Créer la table activity_assignments pour remplacer meal_assignments
        print("📋 Création de la table activity_assignments...")
        cursor.execute("""
            CREATE TABLE activity_assignments (
                id INTEGER PRIMARY KEY,
                activity_id INTEGER NOT NULL,
                participant_id INTEGER NOT NULL,
                role TEXT,
                FOREIGN KEY (activity_id) REFERENCES activities (id),
                FOREIGN KEY (participant_id) REFERENCES participants (id)
            )
        """)
        
        # 5. Migrer meal_assignments vers activity_assignments
        print("📦 Migration des assignations...")
        cursor.execute("""
            SELECT ma.id, ma.meal_id, ma.participant_id, ma.role
            FROM meal_assignments ma
            JOIN meals m ON ma.meal_id = m.id
        """)
        assignments = cursor.fetchall()
        
        for assignment in assignments:
            _, meal_id, participant_id, role = assignment
            
            # Trouver l'activity_id correspondant au meal_id
            cursor.execute("""
                SELECT a.id FROM activities a
                JOIN meals m ON a.event_id = m.event_id AND a.date = m.date
                WHERE m.id = ?
            """, (meal_id,))
            
            result = cursor.fetchone()
            if result:
                activity_id = result[0]
                cursor.execute("""
                    INSERT INTO activity_assignments (activity_id, participant_id, role)
                    VALUES (?, ?, ?)
                """, (activity_id, participant_id, role))
        
        print(f"✅ {len(assignments)} assignations migrées")
        
        # 6. Ajouter quelques activités d'exemple
        print("🎯 Ajout d'activités d'exemple...")
        sample_activities = [
            ('Randonnée matinale', 'sport', 'Randonnée dans les sentiers de montagne', 'Sentier des Crêtes'),
            ('Session kayak', 'sport', 'Kayak sur le lac', 'Lac de montagne'),
            ('Soirée jeux', 'leisure', 'Soirée jeux de société au chalet', 'Salon du chalet'),
            ('Visite village', 'tourism', 'Découverte du village local', 'Centre village'),
            ('Apéritif', 'meal', 'Apéritif de bienvenue', 'Terrasse du chalet')
        ]
        
        # Trouver un event_id existant pour les exemples
        cursor.execute("SELECT id FROM events LIMIT 1")
        event_result = cursor.fetchone()
        
        if event_result:
            event_id = event_result[0]
            base_date = datetime.now()
            
            for i, (name, activity_type, description, location) in enumerate(sample_activities):
                activity_date = base_date.replace(hour=10 + i*2, minute=0, second=0, microsecond=0)
                cursor.execute("""
                    INSERT INTO activities (event_id, name, activity_type, date, description, location)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (event_id, name, activity_type, activity_date.isoformat(), description, location))
            
            print(f"✅ {len(sample_activities)} activités d'exemple ajoutées")
        
        # 7. Valider la migration
        print("\n📊 Validation de la migration...")
        cursor.execute("SELECT COUNT(*) FROM activities")
        activities_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM activity_assignments") 
        assignments_count = cursor.fetchone()[0]
        
        print(f"✅ {activities_count} activités dans la nouvelle table")
        print(f"✅ {assignments_count} assignations migrées")
        
        # Commit les changements
        conn.commit()
        
        print("\n🎉 Migration réussie!")
        print("📋 Nouvelles tables créées:")
        print("   - activities (remplace meals)")
        print("   - activity_assignments (remplace meal_assignments)")
        print("\n🎯 Types d'activités supportés:")
        print("   - meal: Repas (petit-déj, déjeuner, dîner)")
        print("   - sport: Activités sportives (randonnée, kayak, ski...)")
        print("   - leisure: Loisirs (jeux, lecture, repos...)")
        print("   - tourism: Tourisme (visites, excursions...)")
        print("   - other: Autres activités")
        
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Migration Base de Données: Meals → Activities")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    migrate_meals_to_activities()
