import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import EventDashboard from './components/EventDashboard';
import { apiService } from './services/api';
import { Event, Participant, EventCreate, ParticipantCreate } from './types';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'dashboard'>('welcome');
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinEvent = async (eventName: string, participantName: string) => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer l'événement depuis l'API réelle
      const event = await apiService.getEvent(eventName);
      
      // Rejoindre l'événement
      const participantData: ParticipantCreate = {
        event_id: event.id,
        name: participantName,
      };
      const participant = await apiService.joinEvent(participantData);
      
      setCurrentEvent(event);
      setCurrentParticipant(participant);
      setCurrentScreen('dashboard');
    } catch (err) {
      setError('Impossible de rejoindre l\'événement. Veuillez vérifier le nom de l\'événement.');
      console.error('Error joining event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: EventCreate) => {
    setLoading(true);
    setError(null);

    try {
      // Créer l'événement
      const event = await apiService.createEvent(eventData);
      
      // Auto-rejoindre en tant que créateur
      const participantData: ParticipantCreate = {
        event_id: event.id,
        name: 'Organisateur',
      };
      const participant = await apiService.joinEvent(participantData);
      
      setCurrentEvent(event);
      setCurrentParticipant(participant);
      setCurrentScreen('dashboard');
    } catch (err) {
      setError('Impossible de créer l\'événement. Veuillez réessayer.');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshEvent = async () => {
    if (!currentEvent) return;
    
    try {
      const updatedEvent = await apiService.getEvent(currentEvent.name);
      setCurrentEvent(updatedEvent);
    } catch (err) {
      console.error('Error refreshing event:', err);
    }
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
    setCurrentEvent(null);
    setCurrentParticipant(null);
    setError(null);
  };

  return (
    <div className="App">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}
      
      {currentScreen === 'welcome' ? (
        <WelcomeScreen 
          onJoinEvent={handleJoinEvent}
          onCreateEvent={handleCreateEvent}
          loading={loading}
        />
      ) : currentEvent && currentParticipant ? (
        <div>
          <button 
            onClick={handleBackToWelcome}
            className="back-button"
            aria-label="Retour à l'accueil"
          >
            ← Retour
          </button>
          <EventDashboard 
            event={currentEvent}
            participant={currentParticipant}
            onEventUpdate={refreshEvent}
          />
        </div>
      ) : null}
    </div>
  );
}

export default App;
