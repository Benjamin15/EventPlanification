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
  meals: Meal[];
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
}

export interface Car {
  id: number;
  event_id: number;
  driver_name: string;
  license_plate: string;
  max_passengers: number;
  fuel_cost: number;
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

export interface CarCreate {
  event_id: number;
  driver_name: string;
  license_plate: string;
  max_passengers: number;
  fuel_cost: number;
}
