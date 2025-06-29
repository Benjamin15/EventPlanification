// Types partagés pour l'application
export interface Event {
  id: number;
  name: string;
  description?: string;
  location?: string;
  chalet_link?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  participants: Participant[];
  activities: Activity[];
  shopping_items: ShoppingItem[];
  cars: Car[];
  photos: EventPhoto[];
}

export interface Participant {
  id: number;
  name: string;
  event_id: number;
  car_id?: number;
  joined_at: string;
}

export interface Activity {
  id: number;
  event_id: number;
  name: string;
  activity_type: 'meal' | 'sport' | 'leisure' | 'tourism' | 'other';
  date?: string;
  description?: string;
  location?: string;
  max_participants?: number;
}

export interface ActivityAssignment {
  id: number;
  activity_id: number;
  participant_id: number;
  role?: string;
}

// Ancien type Meal (conservé pour compatibilité)
export interface Meal {
  id: number;
  event_id: number;
  meal_type: string;
  date: string;
  description?: string;
}

export interface ShoppingItem {
  id: number;
  event_id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  is_bought: boolean;
  bought_by?: string;
  assigned_to?: string;
  contributors?: string; // JSON string des participants ou "tous"
}

export interface Car {
  id: number;
  event_id: number;
  driver_name: string;
  license_plate: string;
  max_passengers: number;
  fuel_cost: number;
  rental_cost?: number;
  actual_fuel_cost?: number;
  driver_id?: number;
  passengers: Participant[];
}

export interface EventPhoto {
  id: number;
  event_id: number;
  filename: string;
  description?: string;
  uploaded_at: string;
}

export interface CostSummary {
  total_shopping: number;
  total_fuel: number;
  total_rental: number;
  total_transport: number;
  total_cost: number;
  participant_count: number;
  cost_per_person: number;
}

// Types pour la création
export interface EventCreate {
  name: string;
  description?: string;
  location?: string;
  chalet_link?: string;
  start_date?: string;
  end_date?: string;
}

export interface ParticipantCreate {
  name: string;
  event_id: number;
}

export interface ActivityCreate {
  event_id: number;
  name: string;
  activity_type: 'meal' | 'sport' | 'leisure' | 'tourism' | 'other';
  date?: string;
  description?: string;
  location?: string;
  max_participants?: number;
}

export interface ActivityAssignmentCreate {
  activity_id: number;
  participant_id: number;
  role?: string;
}

// Ancien type pour la compatibilité
export interface ActivityCreate {
  event_id: number;
  name: string;
  activity_type: 'meal' | 'sport' | 'leisure' | 'tourism' | 'other';
  date?: string;
  description?: string;
  location?: string;
  max_participants?: number;
}

export interface ActivityAssignmentCreate {
  activity_id: number;
  participant_id: number;
  role?: string;
}

// Ancien type MealCreate (conservé pour compatibilité)
export interface MealCreate {
  event_id: number;
  meal_type: string;
  date: string;
  description?: string;
}

export interface ShoppingItemCreate {
  event_id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface ShoppingItemUpdate {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  assigned_to?: string;
  contributors?: string;
}

export interface CarCreate {
  event_id: number;
  driver_name: string;
  license_plate: string;
  max_passengers: number;
  fuel_cost: number;
  rental_cost?: number;
  actual_fuel_cost?: number;
  driver_id?: number;
}

export interface CarUpdate {
  actual_fuel_cost?: number;
  driver_id?: number;
}
