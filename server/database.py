from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./chalet_vibe.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    location = Column(String)
    chalet_link = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    participants = relationship("Participant", back_populates="event")
    activities = relationship("Activity", back_populates="event")
    shopping_items = relationship("ShoppingItem", back_populates="event")
    cars = relationship("Car", back_populates="event")
    photos = relationship("EventPhoto", back_populates="event")

class Participant(Base):
    __tablename__ = "participants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=True)
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    event = relationship("Event", back_populates="participants")
    car = relationship("Car", back_populates="passengers", foreign_keys=[car_id])
    activity_assignments = relationship("ActivityAssignment", back_populates="participant")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    name = Column(String)
    activity_type = Column(String)  # meal, sport, leisure, tourism, other
    date = Column(DateTime, nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    max_participants = Column(Integer, nullable=True)
    
    # Relations
    event = relationship("Event", back_populates="activities")
    assignments = relationship("ActivityAssignment", back_populates="activity")

class ActivityAssignment(Base):
    __tablename__ = "activity_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    participant_id = Column(Integer, ForeignKey("participants.id"))
    role = Column(String, nullable=True)  # cook, helper, responsible, participant, leader
    
    # Relations
    activity = relationship("Activity", back_populates="assignments")
    participant = relationship("Participant", back_populates="activity_assignments")

# Anciens modèles - Conservés pour la migration
class Meal(Base):
    __tablename__ = "meals"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    meal_type = Column(String)  # breakfast, lunch, dinner
    date = Column(DateTime)
    description = Column(Text)
    
    # Relations (temporaires pour la migration)
    event = relationship("Event")

class MealAssignment(Base):
    __tablename__ = "meal_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id"))
    participant_id = Column(Integer, ForeignKey("participants.id"))
    role = Column(String)  # cook, helper, responsible
    
    # Relations (temporaires pour la migration)
    meal = relationship("Meal")
    participant = relationship("Participant")

class ShoppingItem(Base):
    __tablename__ = "shopping_items"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    name = Column(String)
    category = Column(String)  # food, drinks, supplies
    price = Column(Float, default=0.0)
    quantity = Column(Integer, default=1)
    is_bought = Column(Boolean, default=False)
    bought_by = Column(String, nullable=True)
    
    # Relations
    event = relationship("Event", back_populates="shopping_items")

class Car(Base):
    __tablename__ = "cars"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    driver_name = Column(String)
    license_plate = Column(String)
    max_passengers = Column(Integer, default=4)
    fuel_cost = Column(Float, default=0.0)
    rental_cost = Column(Float, default=0.0, nullable=True)
    actual_fuel_cost = Column(Float, default=0.0, nullable=True)  # Coût réel d'essence après le trajet
    driver_id = Column(Integer, ForeignKey("participants.id"), nullable=True)  # ID du conducteur participant
    
    # Relations
    event = relationship("Event", back_populates="cars")
    passengers = relationship("Participant", back_populates="car", foreign_keys="Participant.car_id")
    driver = relationship("Participant", foreign_keys=[driver_id], post_update=True)

class EventPhoto(Base):
    __tablename__ = "event_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    filename = Column(String)
    original_filename = Column(String, nullable=True)
    file_path = Column(String)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    upload_date = Column(DateTime, default=datetime.utcnow)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    event = relationship("Event", back_populates="photos")

# Créer toutes les tables
Base.metadata.create_all(bind=engine)
