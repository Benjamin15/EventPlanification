import React, { useState } from 'react';
import { EventCreate } from '../types';
import CreateEventModal from './CreateEventModal';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onJoinEvent: (eventName: string, participantName: string) => Promise<void>;
  onCreateEvent: (eventData: EventCreate) => Promise<void>;
  loading?: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onJoinEvent, 
  onCreateEvent, 
  loading = false 
}) => {
  const [eventName, setEventName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateEvent = async (eventData: EventCreate) => {
    await onCreateEvent(eventData);
    setIsCreateModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !participantName.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    await onJoinEvent(eventName.trim(), participantName.trim());
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-header">
          <h1 className="welcome-title">🏔️ Chalet Vibe</h1>
          <p className="welcome-subtitle">
            Organisez vos weekends en chalet entre amis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="welcome-form">
          <div className="form-group">
            <label htmlFor="eventName" className="form-label">
              Nom de l'événement
            </label>
            <input
              id="eventName"
              type="text"
              className="form-input"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Ex: Weekend Chamonix 2025"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="participantName" className="form-label">
              Votre nom
            </label>
            <input
              id="participantName"
              type="text"
              className="form-input"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Ex: Marie Dupont"
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Rejoindre l\'événement'}
          </button>

          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={loading}
          >
            Créer un nouvel événement
          </button>
        </form>

        <div className="welcome-features">
          <div className="feature">
            <span className="feature-icon">📅</span>
            <span className="feature-text">Planification des repas</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🛒</span>
            <span className="feature-text">Liste de courses partagée</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🚗</span>
            <span className="feature-text">Organisation du transport</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💰</span>
            <span className="feature-text">Calcul automatique des coûts</span>
          </div>
        </div>
      </div>

      {/* Modal de création d'événement */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
};

export default WelcomeScreen;
