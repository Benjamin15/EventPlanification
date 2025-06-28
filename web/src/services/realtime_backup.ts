import React from 'react';
import { Event, Participant, Meal, ShoppingItem, Car } from '../types';
import { api } from './api';

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
  private callbacks: Map<number, EventUpdateCallback[]> = new Map();
  private pollingIntervals: Map<number, NodeJS.Timeout> = new Map();
  private lastUpdateTimestamps: Map<number, string> = new Map();

  /**
   * S'abonner aux mises à jour d'un événement
   */
  subscribeToEvent(eventId: number, callback: EventUpdateCallback, pollingInterval: number = 5000) {
    // Ajouter le callback
    if (!this.callbacks.has(eventId)) {
      this.callbacks.set(eventId, []);
    }
    this.callbacks.get(eventId)!.push(callback);

    // Démarrer le polling si ce n'est pas déjà fait
    if (!this.pollingIntervals.has(eventId)) {
      this.startPolling(eventId, pollingInterval);
    }

    // Retourner une fonction de désabonnement
    return () => {
      this.unsubscribeFromEvent(eventId, callback);
    };
  }

  /**
   * Se désabonner des mises à jour d'un événement
   */
  unsubscribeFromEvent(eventId: number, callback: EventUpdateCallback) {
    const callbacks = this.callbacks.get(eventId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }

      // Si plus de callbacks, arrêter le polling
      if (callbacks.length === 0) {
        this.stopPolling(eventId);
        this.callbacks.delete(eventId);
        this.lastUpdateTimestamps.delete(eventId);
      }
    }
  }

  /**
   * Démarrer le polling pour un événement
   */
  private startPolling(eventId: number, interval: number) {
    const pollFn = async () => {
      try {
        const response = await api.get(`/events/${eventId}/updates`, {
          params: {
            since: this.lastUpdateTimestamps.get(eventId) || new Date(Date.now() - 60000).toISOString()
          }
        });

        const updates: EventUpdate[] = response.data.updates || [];
        
        if (updates.length > 0) {
          // Mettre à jour le timestamp
          const latestTimestamp = updates[updates.length - 1].timestamp;
          this.lastUpdateTimestamps.set(eventId, latestTimestamp);

          // Notifier tous les callbacks
          const callbacks = this.callbacks.get(eventId) || [];
          updates.forEach(update => {
            callbacks.forEach(callback => callback(update));
          });
        }
      } catch (error) {
        console.error('Erreur lors du polling des mises à jour:', error);
      }
    };

    // Première exécution immédiate
    pollFn();

    // Puis polling régulier
    const intervalId = setInterval(pollFn, interval);
    this.pollingIntervals.set(eventId, intervalId);
  }

  /**
   * Arrêter le polling pour un événement
   */
  private stopPolling(eventId: number) {
    const intervalId = this.pollingIntervals.get(eventId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(eventId);
    }
  }

  /**
   * Notifier manuellement d'une mise à jour (pour les actions locales)
   */
  notifyUpdate(eventId: number, type: EventUpdateType, data: any) {
    const update: EventUpdate = {
      type,
      eventId,
      data,
      timestamp: new Date().toISOString()
    };

    const callbacks = this.callbacks.get(eventId) || [];
    callbacks.forEach(callback => callback(update));
  }

  /**
   * Nettoyer tous les abonnements
   */
  cleanup() {
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    
    this.callbacks.clear();
    this.pollingIntervals.clear();
    this.lastUpdateTimestamps.clear();
  }
}

export const realtimeService = new RealtimeService();

// Pour éviter les erreurs d'import React dans les services
import { useEffect } from 'react';
export const useEventUpdates = (eventId: number | null, onUpdate: EventUpdateCallback) => {
  useEffect(() => {
    if (!eventId) return;

    const unsubscribe = realtimeService.subscribeToEvent(eventId, onUpdate);
    return unsubscribe;
  }, [eventId, onUpdate]);
};
