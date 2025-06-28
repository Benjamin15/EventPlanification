import axios from 'axios';
import { 
  Event, 
  Participant, 
  Meal, 
  ShoppingItem, 
  Car, 
  CostSummary,
  EventCreate,
  ParticipantCreate,
  MealCreate,
  ShoppingItemCreate,
  CarCreate
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Événements
  async createEvent(eventData: EventCreate): Promise<Event> {
    const response = await api.post('/events/', eventData);
    return response.data;
  },

  async getEvent(eventName: string): Promise<Event> {
    const response = await api.get(`/events/${eventName}`);
    return response.data;
  },

  async listEvents(): Promise<Event[]> {
    const response = await api.get('/events/');
    return response.data;
  },

  // Participants
  async joinEvent(participantData: ParticipantCreate): Promise<Participant> {
    const response = await api.post('/participants/', participantData);
    return response.data;
  },

  async assignCarToParticipant(participantId: number, carId: number): Promise<void> {
    await api.put(`/participants/${participantId}/car/${carId}`);
  },

  // Repas
  async createMeal(mealData: MealCreate): Promise<Meal> {
    const response = await api.post('/meals/', mealData);
    return response.data;
  },

  async getEventMeals(eventId: number): Promise<Meal[]> {
    const response = await api.get(`/events/${eventId}/meals`);
    return response.data;
  },

  // Courses
  async createShoppingItem(itemData: ShoppingItemCreate): Promise<ShoppingItem> {
    const response = await api.post('/shopping/', itemData);
    return response.data;
  },

  async markItemAsBought(itemId: number, boughtBy: string): Promise<void> {
    await api.put(`/shopping/${itemId}/buy?bought_by=${encodeURIComponent(boughtBy)}`);
  },

  async getShoppingList(eventId: number): Promise<ShoppingItem[]> {
    const response = await api.get(`/events/${eventId}/shopping`);
    return response.data;
  },

  // Voitures
  async createCar(carData: CarCreate): Promise<Car> {
    const response = await api.post('/cars/', carData);
    return response.data;
  },

  async getEventCars(eventId: number): Promise<Car[]> {
    const response = await api.get(`/events/${eventId}/cars`);
    return response.data;
  },

  // Coûts
  async calculateCosts(eventId: number): Promise<CostSummary> {
    const response = await api.get(`/events/${eventId}/costs`);
    return response.data;
  },

  // Images
  async uploadEventImage(eventId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/events/${eventId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getEventImages(eventId: number): Promise<any[]> {
    const response = await api.get(`/events/${eventId}/images`);
    return response.data;
  },

  async deleteEventImage(eventId: number, photoId: number): Promise<void> {
    await api.delete(`/events/${eventId}/images/${photoId}`);
  },
};

// Service avec données mockées pour le développement
export const mockApiService = {
  async getEvent(eventName: string): Promise<Event> {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: 1,
      name: eventName,
      description: "Weekend au chalet des Alpes",
      location: "Chamonix, France",
      chalet_link: "https://example.com/chalet",
      start_date: "2025-07-04T18:00:00Z",
      end_date: "2025-07-06T18:00:00Z",
      created_at: "2025-06-20T10:00:00Z",
      participants: [
        { id: 1, name: "Alice", event_id: 1, car_id: 1, joined_at: "2025-06-20T10:00:00Z" },
        { id: 2, name: "Bob", event_id: 1, car_id: 1, joined_at: "2025-06-21T14:30:00Z" },
        { id: 3, name: "Charlie", event_id: 1, joined_at: "2025-06-22T09:15:00Z" },
        { id: 4, name: "Diana", event_id: 1, car_id: 2, joined_at: "2025-06-23T16:45:00Z" }
      ],
      meals: [
        { id: 1, event_id: 1, meal_type: "dinner", date: "2025-07-04T20:00:00Z", description: "Raclette traditionnelle" },
        { id: 2, event_id: 1, meal_type: "breakfast", date: "2025-07-05T08:00:00Z", description: "Croissants et café" },
        { id: 3, event_id: 1, meal_type: "lunch", date: "2025-07-05T12:30:00Z", description: "Tartiflette" },
        { id: 4, event_id: 1, meal_type: "dinner", date: "2025-07-05T20:00:00Z", description: "Fondue savoyarde" }
      ],
      shopping_items: [
        { id: 1, event_id: 1, name: "Fromage à raclette", category: "food", price: 25.50, quantity: 2, is_bought: false },
        { id: 2, event_id: 1, name: "Charcuterie", category: "food", price: 18.00, quantity: 1, is_bought: true, bought_by: "Alice" },
        { id: 3, event_id: 1, name: "Pommes de terre", category: "food", price: 4.50, quantity: 5, is_bought: false },
        { id: 4, event_id: 1, name: "Vin blanc", category: "drinks", price: 12.00, quantity: 3, is_bought: true, bought_by: "Bob" },
        { id: 5, event_id: 1, name: "Pain", category: "food", price: 3.20, quantity: 2, is_bought: false }
      ],
      cars: [
        { 
          id: 1, 
          event_id: 1, 
          driver_name: "Alice", 
          license_plate: "AB-123-CD", 
          max_passengers: 4, 
          fuel_cost: 60.00,
          passengers: []
        },
        { 
          id: 2, 
          event_id: 1, 
          driver_name: "Diana", 
          license_plate: "EF-456-GH", 
          max_passengers: 5, 
          fuel_cost: 45.00,
          passengers: []
        }
      ],
      photos: []
    };
  },

  async joinEvent(eventId: number, participantName: string): Promise<Participant> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: Date.now(),
      name: participantName,
      event_id: eventId,
      joined_at: new Date().toISOString()
    };
  }
};
