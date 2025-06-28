from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import database
import schemas
from database import SessionLocal, Event, Participant, Meal, ShoppingItem, Car, EventPhoto
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
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/events/{event_name}", response_model=schemas.EventFull)
def get_event(event_name: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.name == event_name).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return event

@app.get("/events/", response_model=List[schemas.Event])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).all()

# Routes pour les participants
@app.post("/participants/", response_model=schemas.Participant)
def join_event(participant: schemas.ParticipantCreate, db: Session = Depends(get_db)):
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == participant.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    # Vérifier que le participant n'existe pas déjà
    existing = db.query(Participant).filter(
        Participant.event_id == participant.event_id,
        Participant.name == participant.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Participant déjà inscrit à cet événement")
    
    db_participant = Participant(**participant.dict())
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant

@app.put("/participants/{participant_id}/car/{car_id}")
def assign_car(participant_id: int, car_id: int, db: Session = Depends(get_db)):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    car = db.query(Car).filter(Car.id == car_id).first()
    
    if not participant or not car:
        raise HTTPException(status_code=404, detail="Participant ou voiture non trouvé")
    
    # Vérifier que la voiture n'est pas pleine
    current_passengers = db.query(Participant).filter(Participant.car_id == car_id).count()
    if current_passengers >= car.max_passengers:
        raise HTTPException(status_code=400, detail="Voiture pleine")
    
    participant.car_id = car_id
    db.commit()
    return {"message": "Participant assigné à la voiture"}

# Routes pour les repas
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

@app.get("/events/{event_id}/shopping", response_model=List[schemas.ShoppingItem])
def get_shopping_list(event_id: int, db: Session = Depends(get_db)):
    return db.query(ShoppingItem).filter(ShoppingItem.event_id == event_id).all()

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

# Calcul des prix
@app.get("/events/{event_id}/costs")
def calculate_costs(event_id: int, db: Session = Depends(get_db)):
    # Coûts des courses
    shopping_cost = db.query(ShoppingItem).filter(ShoppingItem.event_id == event_id).all()
    total_shopping = sum(item.price * item.quantity for item in shopping_cost)
    
    # Coûts des voitures
    cars = db.query(Car).filter(Car.event_id == event_id).all()
    total_fuel = sum(car.fuel_cost for car in cars)
    
    # Nombre de participants
    participant_count = db.query(Participant).filter(Participant.event_id == event_id).count()
    
    if participant_count == 0:
        return {"error": "Aucun participant"}
    
    cost_per_person = (total_shopping + total_fuel) / participant_count
    
    return {
        "total_shopping": total_shopping,
        "total_fuel": total_fuel,
        "total_cost": total_shopping + total_fuel,
        "participant_count": participant_count,
        "cost_per_person": round(cost_per_person, 2)
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
