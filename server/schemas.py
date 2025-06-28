from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Schémas pour les événements
class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    chalet_link: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les participants
class ParticipantBase(BaseModel):
    name: str

class ParticipantCreate(ParticipantBase):
    event_id: int

class Participant(ParticipantBase):
    id: int
    event_id: int
    car_id: Optional[int] = None
    joined_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les activités (remplace les repas)
class ActivityBase(BaseModel):
    name: str
    activity_type: str  # meal, sport, leisure, tourism, other
    date: Optional[datetime] = None
    description: Optional[str] = None
    location: Optional[str] = None
    max_participants: Optional[int] = None

class ActivityCreate(ActivityBase):
    event_id: int

class Activity(ActivityBase):
    id: int
    event_id: int
    
    class Config:
        from_attributes = True

# Schémas pour les assignations d'activités
class ActivityAssignmentBase(BaseModel):
    role: Optional[str] = None

class ActivityAssignmentCreate(ActivityAssignmentBase):
    activity_id: int
    participant_id: int

class ActivityAssignment(ActivityAssignmentBase):
    id: int
    activity_id: int
    participant_id: int
    
    class Config:
        from_attributes = True

# Anciens schémas pour les repas (conservés pour la migration)
class MealBase(BaseModel):
    meal_type: str
    date: datetime
    description: Optional[str] = None

class MealCreate(MealBase):
    event_id: int

class Meal(MealBase):
    id: int
    event_id: int
    
    class Config:
        from_attributes = True

# Schémas pour les courses
class ShoppingItemBase(BaseModel):
    name: str
    category: str
    price: float = 0.0
    quantity: int = 1

class ShoppingItemCreate(ShoppingItemBase):
    event_id: int

class ShoppingItem(ShoppingItemBase):
    id: int
    event_id: int
    is_bought: bool = False
    bought_by: Optional[str] = None
    
    class Config:
        from_attributes = True

# Schémas pour les voitures
class CarBase(BaseModel):
    driver_name: str
    license_plate: str
    max_passengers: int = 4
    fuel_cost: float = 0.0
    rental_cost: Optional[float] = None
    actual_fuel_cost: Optional[float] = None
    driver_id: Optional[int] = None

class CarCreate(CarBase):
    event_id: int

class CarUpdate(BaseModel):
    actual_fuel_cost: Optional[float] = None
    driver_id: Optional[int] = None

class Car(CarBase):
    id: int
    event_id: int
    passengers: List[Participant] = []
    
    class Config:
        from_attributes = True

# Schémas pour les photos
class EventPhotoBase(BaseModel):
    filename: str
    description: Optional[str] = None

class EventPhotoCreate(EventPhotoBase):
    event_id: int

class EventPhoto(EventPhotoBase):
    id: int
    event_id: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Schéma complet de l'événement avec toutes les relations
class EventFull(Event):
    participants: List[Participant] = []
    meals: List[Meal] = []
    shopping_items: List[ShoppingItem] = []
    cars: List[Car] = []
    photos: List[EventPhoto] = []
