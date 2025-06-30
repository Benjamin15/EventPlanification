from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import database
import schemas
from database import SessionLocal, Event, Participant, Meal, ShoppingItem, Car, EventPhoto, Activity, ActivityAssignment
import os
import uuid
import shutil
from pathlib import Path

app = FastAPI(title="Chalet Vibe API", description="API pour gérer les weekends en chalet")

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration pour servir les fichiers statiques
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Dépendance pour obtenir la session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Répertoire de stockage des images
UPLOAD_DIR = Path("uploads/event_images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Types de fichiers autorisés
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image_file(file: UploadFile) -> bool:
    """Valide qu'un fichier est une image autorisée"""
    # Vérifier l'extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        return False
    
    # Vérifier le type MIME
    allowed_mimes = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_mimes:
        return False
    
    return True

# Routes pour les événements
@app.post("/events/", response_model=schemas.Event)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    # Vérifier si un événement avec ce nom existe déjà
    existing_event = db.query(Event).filter(Event.name == event.name).first()
    if existing_event:
        raise HTTPException(
            status_code=409, 
            detail=f"Un événement avec le nom '{event.name}' existe déjà. Veuillez choisir un autre nom."
        )
    
    try:
        db_event = Event(**event.model_dump())
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
    except Exception as e:
        db.rollback()
        if "UNIQUE constraint failed: events.name" in str(e):
            raise HTTPException(
                status_code=409, 
                detail=f"Un événement avec le nom '{event.name}' existe déjà. Veuillez choisir un autre nom."
            )
        raise HTTPException(status_code=500, detail="Erreur lors de la création de l'événement")

@app.get("/events/check-name/{event_name}")
def check_event_name_availability(event_name: str, db: Session = Depends(get_db)):
    existing_event = db.query(Event).filter(Event.name == event_name).first()
    return {
        "available": existing_event is None,
        "message": "Nom disponible" if existing_event is None else "Ce nom est déjà utilisé"
    }

@app.get("/events/{event_identifier}", response_model=schemas.EventFull)
def get_event(event_identifier: str, db: Session = Depends(get_db)):
    # Essayer d'abord par ID si c'est un nombre
    if event_identifier.isdigit():
        event = db.query(Event).filter(Event.id == int(event_identifier)).first()
    else:
        # Sinon chercher par nom
        event = db.query(Event).filter(Event.name == event_identifier).first()
    
    if event is None:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return event

@app.get("/events/", response_model=List[schemas.Event])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).all()

@app.put("/events/{event_id}", response_model=schemas.Event)
def update_event(event_id: int, event_update: schemas.EventCreate, db: Session = Depends(get_db)):
    """Mettre à jour les informations d'un événement"""
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    # Vérifier si le nouveau nom n'est pas déjà utilisé par un autre événement
    if event_update.name != event.name:
        existing_event = db.query(Event).filter(
            Event.name == event_update.name,
            Event.id != event_id
        ).first()
        if existing_event:
            raise HTTPException(
                status_code=409, 
                detail=f"Un événement avec le nom '{event_update.name}' existe déjà."
            )
    
    # Mettre à jour tous les champs fournis
    update_data = event_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    return event

# Routes pour les participants
@app.post("/participants/", response_model=schemas.Participant)
def join_event(participant: schemas.ParticipantCreate, db: Session = Depends(get_db)):
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == participant.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    # Vérifier si le participant existe déjà
    existing = db.query(Participant).filter(
        Participant.event_id == participant.event_id,
        Participant.name == participant.name
    ).first()
    
    if existing:
        # Si le participant existe déjà, le retourner (permettre la reconnexion)
        return existing
    
    # Sinon, créer un nouveau participant
    db_participant = Participant(**participant.dict())
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant

@app.put("/participants/{participant_id}/car/{car_id}")
def assign_car(participant_id: int, car_id: int, db: Session = Depends(get_db)):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant non trouvé")
    
    # Si car_id est 0, retirer le participant de sa voiture actuelle
    if car_id == 0:
        participant.car_id = None
        db.commit()
        return {"message": "Participant retiré de la voiture"}
    
    # Sinon, assigner à une voiture
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Voiture non trouvée")
    
    # Vérifier que la voiture n'est pas pleine
    current_passengers = db.query(Participant).filter(Participant.car_id == car_id).count()
    if current_passengers >= car.max_passengers:
        raise HTTPException(status_code=400, detail="Voiture pleine")
    
    participant.car_id = car_id
    db.commit()
    return {"message": "Participant assigné à la voiture"}

# Routes pour les activités (remplace les repas)
@app.post("/activities/", response_model=schemas.Activity)
def create_activity(activity: schemas.ActivityCreate, db: Session = Depends(get_db)):
    db_activity = Activity(**activity.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@app.get("/events/{event_id}/activities", response_model=List[schemas.Activity])
def get_event_activities(event_id: int, db: Session = Depends(get_db)):
    return db.query(Activity).filter(Activity.event_id == event_id).all()

@app.put("/activities/{activity_id}")
def update_activity(activity_id: int, activity_update: schemas.ActivityBase, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activité non trouvée")
    
    for key, value in activity_update.dict(exclude_unset=True).items():
        setattr(activity, key, value)
    
    db.commit()
    return {"message": "Activité mise à jour"}

@app.delete("/activities/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activité non trouvée")
    
    db.delete(activity)
    db.commit()
    return {"message": "Activité supprimée"}

# Routes pour les assignations d'activités
@app.post("/activity-assignments/", response_model=schemas.ActivityAssignment)
def create_activity_assignment(assignment: schemas.ActivityAssignmentCreate, db: Session = Depends(get_db)):
    db_assignment = ActivityAssignment(**assignment.dict())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@app.get("/activities/{activity_id}/assignments", response_model=List[schemas.ActivityAssignment])
def get_activity_assignments(activity_id: int, db: Session = Depends(get_db)):
    return db.query(ActivityAssignment).filter(ActivityAssignment.activity_id == activity_id).all()

# Anciens routes pour les repas (conservés pour compatibilité pendant la migration)
@app.post("/meals/", response_model=schemas.Meal)
def create_meal(meal: schemas.MealCreate, db: Session = Depends(get_db)):
    db_meal = Meal(**meal.dict())
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal

@app.get("/events/{event_id}/meals", response_model=List[schemas.Meal])
def get_event_meals(event_id: int, db: Session = Depends(get_db)):
    return db.query(Meal).filter(Meal.event_id == event_id).all()

# Routes pour les courses
@app.post("/shopping/", response_model=schemas.ShoppingItem)
def create_shopping_item(item: schemas.ShoppingItemCreate, db: Session = Depends(get_db)):
    db_item = ShoppingItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/shopping/{item_id}/buy")
def mark_as_bought(item_id: int, bought_by: str, db: Session = Depends(get_db)):
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    item.is_bought = True
    item.bought_by = bought_by
    db.commit()
    return {"message": "Article marqué comme acheté"}

@app.put("/shopping/{item_id}/unmark")
def unmark_as_bought(item_id: int, db: Session = Depends(get_db)):
    """Déselectionner un article (le marquer comme non acheté)"""
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    item.is_bought = False
    item.bought_by = None
    db.commit()
    return {"message": "Article marqué comme non acheté"}

@app.put("/shopping/{item_id}", response_model=schemas.ShoppingItem)
def update_shopping_item(item_id: int, item_update: schemas.ShoppingItemUpdate, db: Session = Depends(get_db)):
    """Mettre à jour un article de courses (prix, responsable, etc.)"""
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    # Mettre à jour uniquement les champs fournis
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@app.put("/shopping/{item_id}/assign")
def assign_shopping_item(item_id: int, assigned_to: str, db: Session = Depends(get_db)):
    """Assigner un responsable à un article de courses"""
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    item.assigned_to = assigned_to
    db.commit()
    return {"message": f"Article assigné à {assigned_to}"}

@app.get("/events/{event_id}/shopping", response_model=List[schemas.ShoppingItem])
def get_shopping_list(event_id: int, db: Session = Depends(get_db)):
    return db.query(ShoppingItem).filter(ShoppingItem.event_id == event_id).all()

@app.delete("/shopping/{item_id}")
def delete_shopping_item(item_id: int, db: Session = Depends(get_db)):
    """Supprimer un article de courses"""
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    db.delete(item)
    db.commit()
    return {"message": "Article supprimé"}

# Routes pour les voitures
@app.post("/cars/", response_model=schemas.Car)
def create_car(car: schemas.CarCreate, db: Session = Depends(get_db)):
    db_car = Car(**car.dict())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car

@app.get("/events/{event_id}/cars", response_model=List[schemas.Car])
def get_event_cars(event_id: int, db: Session = Depends(get_db)):
    return db.query(Car).filter(Car.event_id == event_id).all()

@app.put("/cars/{car_id}")
def update_car(car_id: int, car_update: schemas.CarUpdate, db: Session = Depends(get_db)):
    """Mettre à jour les informations d'une voiture (coût d'essence réel, conducteur)"""
    car = db.query(Car).filter(Car.id == car_id).first()
    
    if not car:
        raise HTTPException(status_code=404, detail="Voiture non trouvée")
    
    # Mise à jour des champs fournis
    if car_update.actual_fuel_cost is not None:
        car.actual_fuel_cost = car_update.actual_fuel_cost
    
    if car_update.driver_id is not None:
        # Vérifier que le conducteur existe et appartient au même événement
        driver = db.query(Participant).filter(
            Participant.id == car_update.driver_id,
            Participant.event_id == car.event_id
        ).first()
        
        if not driver:
            raise HTTPException(status_code=404, detail="Conducteur non trouvé dans cet événement")
        
        car.driver_id = car_update.driver_id
        car.driver_name = driver.name  # Mettre à jour le nom aussi pour cohérence
    
    db.commit()
    db.refresh(car)
    return car

@app.delete("/cars/{car_id}")
def delete_car(car_id: int, db: Session = Depends(get_db)):
    """Supprimer une voiture"""
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Voiture non trouvée")
    
    # Libérer tous les participants assignés à cette voiture
    participants = db.query(Participant).filter(Participant.car_id == car_id).all()
    for participant in participants:
        participant.car_id = None
    
    db.delete(car)
    db.commit()
    return {"message": "Voiture supprimée"}

@app.get("/events/{event_id}/participants", response_model=List[schemas.Participant])
def get_event_participants(event_id: int, db: Session = Depends(get_db)):
    """Récupérer tous les participants d'un événement"""
    return db.query(Participant).filter(Participant.event_id == event_id).all()

# Calcul des prix
@app.get("/events/{event_id}/costs")
def calculate_costs(event_id: int, db: Session = Depends(get_db)):
    # Coûts des courses
    shopping_cost = db.query(ShoppingItem).filter(ShoppingItem.event_id == event_id).all()
    total_shopping = sum(item.price * item.quantity for item in shopping_cost)
    
    # Coûts des voitures (carburant + location)
    cars = db.query(Car).filter(Car.event_id == event_id).all()
    # Utiliser le coût réel d'essence si disponible, sinon le coût estimé
    total_fuel = sum((car.actual_fuel_cost if car.actual_fuel_cost is not None else car.fuel_cost) for car in cars)
    total_rental = sum((car.rental_cost or 0) for car in cars)
    total_transport = total_fuel + total_rental
    
    # Nombre de participants
    participant_count = db.query(Participant).filter(Participant.event_id == event_id).count()
    
    if participant_count == 0:
        return {"error": "Aucun participant"}
    
    cost_per_person = (total_shopping + total_transport) / participant_count
    
    return {
        "total_shopping": total_shopping,
        "total_fuel": total_fuel,
        "total_rental": total_rental,
        "total_transport": total_transport,
        "total_cost": total_shopping + total_transport,
        "participant_count": participant_count,
        "cost_per_person": round(cost_per_person, 2)
    }

@app.get("/events/{event_id}/financial-balance")
def calculate_financial_balance(event_id: int, db: Session = Depends(get_db)):
    """Calculer l'équilibre financier entre participants"""
    
    # Récupérer tous les participants
    participants = db.query(Participant).filter(Participant.event_id == event_id).all()
    if not participants:
        return {"error": "Aucun participant"}
    
    # Calculer les dépenses par participant
    participant_expenses = {}
    participant_contributions = {}
    
    for participant in participants:
        participant_expenses[participant.name] = 0
        participant_contributions[participant.name] = 0
    
    # 1. Calculer les dépenses (qui a acheté quoi)
    shopping_items = db.query(ShoppingItem).filter(ShoppingItem.event_id == event_id).all()
    for item in shopping_items:
        if item.is_bought and item.bought_by:
            cost = item.price * item.quantity
            if item.bought_by in participant_expenses:
                participant_expenses[item.bought_by] += cost
    
    # 2. Calculer les contributions attendues (qui doit payer pour quoi)
    total_cost = 0
    for item in shopping_items:
        item_cost = item.price * item.quantity
        total_cost += item_cost
        
        # Répartir le coût selon les contributeurs
        if item.contributors == "tous" or not item.contributors:
            # Tout le monde contribue de manière égale
            contribution_per_person = item_cost / len(participants)
            for participant in participants:
                participant_contributions[participant.name] += contribution_per_person
        else:
            # Contributeurs spécifiques (format JSON ou liste séparée par virgules)
            try:
                import json
                contributors = json.loads(item.contributors)
            except:
                contributors = [name.strip() for name in item.contributors.split(",")]
            
            if contributors:
                contribution_per_person = item_cost / len(contributors)
                for contributor in contributors:
                    if contributor in participant_contributions:
                        participant_contributions[contributor] += contribution_per_person
    
    # 3. Ajouter les coûts de transport (toujours partagés équitablement)
    cars = db.query(Car).filter(Car.event_id == event_id).all()
    total_transport = sum(
        (car.actual_fuel_cost if car.actual_fuel_cost is not None else car.fuel_cost) + (car.rental_cost or 0)
        for car in cars
    )
    transport_per_person = total_transport / len(participants)
    for participant in participants:
        participant_contributions[participant.name] += transport_per_person
    
    # 4. Calculer l'équilibre (différence entre dépenses et contributions)
    balance = {}
    for participant in participants:
        name = participant.name
        spent = participant_expenses[name]
        owes = participant_contributions[name]
        balance[name] = round(spent - owes, 2)  # Positif = créditeur, Négatif = débiteur
    
    # 5. Calculer les transferts recommandés
    creditors = {name: amount for name, amount in balance.items() if amount > 0.01}
    debtors = {name: -amount for name, amount in balance.items() if amount < -0.01}
    
    transfers = []
    creditors_list = list(creditors.items())
    debtors_list = list(debtors.items())
    
    i, j = 0, 0
    while i < len(creditors_list) and j < len(debtors_list):
        creditor, credit_amount = creditors_list[i]
        debtor, debt_amount = debtors_list[j]
        
        transfer_amount = min(credit_amount, debt_amount)
        transfers.append({
            "from": debtor,
            "to": creditor,
            "amount": round(transfer_amount, 2)
        })
        
        creditors_list[i] = (creditor, credit_amount - transfer_amount)
        debtors_list[j] = (debtor, debt_amount - transfer_amount)
        
        if creditors_list[i][1] <= 0.01:
            i += 1
        if debtors_list[j][1] <= 0.01:
            j += 1
    
    return {
        "total_cost": round(total_cost + total_transport, 2),
        "participant_balance": balance,
        "recommended_transfers": transfers,
        "summary": {
            "total_shopping": round(total_cost, 2),
            "total_transport": round(total_transport, 2),
            "per_person_target": round((total_cost + total_transport) / len(participants), 2)
        }
    }

@app.post("/events/{event_id}/upload-image")
async def upload_event_image(
    event_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """Upload d'une image pour un événement"""
    
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    # Valider le fichier
    if not validate_image_file(file):
        raise HTTPException(
            status_code=400, 
            detail="Format de fichier non autorisé. Utilisez JPEG, PNG ou WebP."
        )
    
    # Vérifier la taille du fichier
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail="Fichier trop volumineux. Maximum 5MB autorisé."
        )
    
    # Générer un nom de fichier unique
    file_extension = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Sauvegarder le fichier
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur lors de la sauvegarde du fichier")
    
    # Enregistrer les métadonnées dans la base de données
    try:
        db_photo = EventPhoto(
            event_id=event_id,
            filename=unique_filename,
            original_filename=file.filename,
            file_path=str(file_path),
            file_size=len(file_content),
            mime_type=file.content_type
        )
        db.add(db_photo)
        db.commit()
        db.refresh(db_photo)
    except Exception as e:
        # Supprimer le fichier en cas d'erreur DB
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement en base de données")
    
    return {
        "message": "Image uploadée avec succès",
        "photo_id": db_photo.id,
        "filename": unique_filename,
        "url": f"/uploads/event_images/{unique_filename}"
    }

@app.get("/events/{event_id}/images")
def get_event_images(event_id: int, db: Session = Depends(get_db)):
    """Récupérer toutes les images d'un événement"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    photos = db.query(EventPhoto).filter(EventPhoto.event_id == event_id).all()
    
    return [
        {
            "id": photo.id,
            "filename": photo.filename,
            "original_filename": photo.original_filename,
            "url": f"/uploads/event_images/{photo.filename}",
            "file_size": photo.file_size,
            "upload_date": photo.upload_date
        }
        for photo in photos
    ]

@app.delete("/events/{event_id}/images/{photo_id}")
def delete_event_image(event_id: int, photo_id: int, db: Session = Depends(get_db)):
    """Supprimer une image d'événement"""
    photo = db.query(EventPhoto).filter(
        EventPhoto.id == photo_id, 
        EventPhoto.event_id == event_id
    ).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Image non trouvée")
    
    # Supprimer le fichier physique
    file_path = Path(photo.file_path)
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception as e:
            print(f"Erreur lors de la suppression du fichier: {e}")
    
    # Supprimer l'enregistrement de la base de données
    db.delete(photo)
    db.commit()
    
    return {"message": "Image supprimée avec succès"}

@app.get("/")
def root():
    return {"message": "Bienvenue sur l'API Chalet Vibe!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
