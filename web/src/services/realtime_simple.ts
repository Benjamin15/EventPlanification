// Service de temps réel simplifié pour éviter les erreurs de compilation
export type EventUpdateType = 
  | 'participant_joined'
  | 'meal_added'
  | 'meal_updated' 
  | 'shopping_item_added'
  | 'shopping_item_updated'
  | 'car_added'
  | 'car_updated'
  | 'event_updated';

export interface EventUpdate {
  type: EventUpdateType;
  eventId: number;
  data: any;
  timestamp: string;
}

export type EventUpdateCallback = (update: EventUpdate) => void;

class RealtimeService {
  // Service simplifié - pas de polling pour l'instant
  subscribeToEvent(eventId: number, callback: EventUpdateCallback, interval: number = 5000) {
    console.log(`Realtime service: subscribed to event ${eventId}`);
    // Pour l'instant, ne fait rien - juste pour éviter les erreurs
    return () => {
      console.log(`Realtime service: unsubscribed from event ${eventId}`);
    };
  }

  unsubscribeFromEvent(eventId: number, callback: EventUpdateCallback) {
    console.log(`Realtime service: unsubscribed from event ${eventId}`);
    // Pour l'instant, ne fait rien - juste pour éviter les erreurs
  }

  notifyUpdate(eventId: number, type: EventUpdateType, data: any) {
    console.log(`Realtime service: notify update for event ${eventId}`, type, data);
    // Pour l'instant, ne fait rien - juste pour éviter les erreurs
  }
}

export const realtimeService = new RealtimeService();
