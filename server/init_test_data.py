"""
Script pour initialiser la base de données avec des données de test
"""
from database import SessionLocal, Event, Participant, Meal, ShoppingItem, Car
from datetime import datetime, timedelta

def init_test_data():
    db = SessionLocal()
    
    try:
        # Vérifier si des données existent déjà
        if db.query(Event).first():
            print("Des données existent déjà, suppression...")
            db.query(Participant).delete()
            db.query(Meal).delete()
            db.query(ShoppingItem).delete()
            db.query(Car).delete()
            db.query(Event).delete()
            db.commit()
        
        # Créer un événement de test
        start_date = datetime.now() + timedelta(days=7)
        end_date = start_date + timedelta(days=2)
        
        event = Event(
            name="Weekend Chamonix 2025",
            description="Weekend au chalet dans les Alpes",
            location="Chamonix, France",
            chalet_link="https://example.com/chalet-chamonix",
            start_date=start_date,
            end_date=end_date
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        
        # Ajouter des participants
        participants_data = [
            ("Alice Martin", 1),
            ("Bob Durand", 1),
            ("Charlie Moreau", None),
            ("Diana Petit", 2)
        ]
        
        participants = []
        for name, car_id in participants_data:
            participant = Participant(
                name=name,
                event_id=event.id,
                car_id=car_id
            )
            db.add(participant)
            participants.append(participant)
        
        # Ajouter des voitures
        cars_data = [
            ("Alice Martin", "AB-123-CD", 4, 60.00),
            ("Diana Petit", "EF-456-GH", 5, 45.00)
        ]
        
        for driver, plate, max_pass, fuel in cars_data:
            car = Car(
                event_id=event.id,
                driver_name=driver,
                license_plate=plate,
                max_passengers=max_pass,
                fuel_cost=fuel
            )
            db.add(car)
        
        # Ajouter des repas
        meals_data = [
            ("dinner", start_date.replace(hour=20), "Raclette traditionnelle"),
            ("breakfast", start_date.replace(hour=8) + timedelta(days=1), "Croissants et café"),
            ("lunch", start_date.replace(hour=12) + timedelta(days=1), "Tartiflette"),
            ("dinner", start_date.replace(hour=20) + timedelta(days=1), "Fondue savoyarde")
        ]
        
        for meal_type, date, description in meals_data:
            meal = Meal(
                event_id=event.id,
                meal_type=meal_type,
                date=date,
                description=description
            )
            db.add(meal)
        
        # Ajouter des articles de courses
        shopping_data = [
            ("Fromage à raclette", "food", 25.50, 2, False, None),
            ("Charcuterie", "food", 18.00, 1, True, "Alice"),
            ("Pommes de terre", "food", 4.50, 5, False, None),
            ("Vin blanc", "drinks", 12.00, 3, True, "Bob"),
            ("Pain", "food", 3.20, 2, False, None),
            ("Bière", "drinks", 8.50, 6, False, None),
            ("Fromage pour fondue", "food", 22.00, 1, False, None),
            ("Cornichons", "food", 2.80, 2, True, "Diana")
        ]
        
        for name, category, price, quantity, is_bought, bought_by in shopping_data:
            item = ShoppingItem(
                event_id=event.id,
                name=name,
                category=category,
                price=price,
                quantity=quantity,
                is_bought=is_bought,
                bought_by=bought_by
            )
            db.add(item)
        
        db.commit()
        print("✅ Données de test créées avec succès!")
        print(f"📅 Événement: {event.name}")
        print(f"👥 Participants: {len(participants_data)}")
        print(f"🚗 Voitures: {len(cars_data)}")
        print(f"🍽️ Repas: {len(meals_data)}")
        print(f"🛒 Articles: {len(shopping_data)}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des données: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_test_data()
