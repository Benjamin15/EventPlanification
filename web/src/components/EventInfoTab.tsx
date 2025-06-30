import React, { useState } from 'react';
import { Event, Participant } from '../types';
import { apiService } from '../services/api';

interface EventInfoTabProps {
  event: Event;
  onEventUpdate?: () => void;
}

const EventInfoTab: React.FC<EventInfoTabProps> = ({ event, onEventUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: event.name,
    description: event.description || '',
    location: event.location || '',
    chalet_link: event.chalet_link || '',
    start_date: event.start_date || '',
    end_date: event.end_date || ''
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  // Fonction pour déterminer le statut transport d'un participant (reprise de ParticipantsTab)
  const getTransportStatus = (participant: Participant) => {
    // Vérifier si la personne est conductrice d'une voiture (priorité sur passager)
    const drivenCar = event.cars?.find(car => car.driver_id === participant.id);
    if (drivenCar) {
      return {
        type: 'driver' as const,
        car: drivenCar,
        message: `🚗 ${drivenCar.license_plate}`,
        badge: '👨‍✈️ Conducteur'
      };
    }

    // Vérifier si la personne est passagère d'une voiture (mais pas conductrice)
    const passengerCar = event.cars?.find(car => car.id === participant.car_id && car.driver_id !== participant.id);
    if (passengerCar) {
      return {
        type: 'passenger' as const,
        car: passengerCar,
        message: `🚗 ${passengerCar.license_plate}`,
        badge: '🧑‍💼 Passager'
      };
    }

    // Aucune voiture assignée
    return {
      type: 'none' as const,
      car: null,
      message: '🚶 Pas de voiture',
      badge: null
    };
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await apiService.updateEvent(event.id, {
        name: editForm.name,
        description: editForm.description,
        location: editForm.location,
        chalet_link: editForm.chalet_link,
        start_date: editForm.start_date,
        end_date: editForm.end_date
      });
      
      setIsEditing(false);
      if (onEventUpdate) {
        onEventUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des modifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: event.name,
      description: event.description || '',
      location: event.location || '',
      chalet_link: event.chalet_link || '',
      start_date: event.start_date || '',
      end_date: event.end_date || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="tab-content">
      {/* Section informations modifiables */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">📍 Informations sur l'événement</h2>
          {!isEditing ? (
            <button 
              className="edit-btn modern"
              onClick={() => setIsEditing(true)}
            >
              <span className="edit-icon">✏️</span>
              <span className="edit-text">Modifier</span>
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="save-btn modern"
                onClick={handleSaveChanges}
                disabled={isLoading}
              >
                <span className="btn-icon">💾</span>
                <span className="btn-text">{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
              <button 
                className="cancel-btn modern"
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                <span className="btn-icon">❌</span>
                <span className="btn-text">Annuler</span>
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>🏷️ Nom de l'événement</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nom de l'événement"
              />
            </div>

            <div className="form-group">
              <label>🏠 Lieu</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="Lieu de l'événement"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>📅 Date de début</label>
                <input
                  type="date"
                  value={formatDateForInput(editForm.start_date)}
                  onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>📅 Date de fin</label>
                <input
                  type="date"
                  value={formatDateForInput(editForm.end_date)}
                  onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>🔗 Lien du chalet</label>
              <input
                type="url"
                value={editForm.chalet_link}
                onChange={(e) => setEditForm({ ...editForm, chalet_link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>📝 Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description de l'événement"
                rows={4}
              />
            </div>
          </div>
        ) : (
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">🏷️</span>
              <span className="info-text">{event.name}</span>
            </div>

            {event.location && (
              <div className="info-item">
                <span className="info-icon">🏠</span>
                <span className="info-text">{event.location}</span>
              </div>
            )}
            
            {event.start_date && event.end_date && (
              <div className="info-item">
                <span className="info-icon">📅</span>
                <span className="info-text">
                  Du {formatDate(event.start_date)} au {formatDate(event.end_date)}
                </span>
              </div>
            )}
            
            {event.chalet_link && (
              <div className="info-item">
                <span className="info-icon">🔗</span>
                <a 
                  href={event.chalet_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  Voir le chalet
                </a>
              </div>
            )}
            
            {event.description && (
              <div className="info-item full-width">
                <span className="info-icon">📝</span>
                <span className="info-text">{event.description}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section participants avec statut transport */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">👥 Participants ({event.participants?.length || 0})</h2>
        </div>
        
        <div className="participants-transport-list">
          {event.participants && event.participants.length > 0 ? (
            event.participants.map((participant) => {
              const transportStatus = getTransportStatus(participant);
              
              return (
                <div key={participant.id} className="participant-transport-card">
                  <div className="participant-info">
                    <div className="participant-header">
                      <span className="participant-name">{participant.name}</span>
                      {transportStatus.badge && (
                        <span className="driver-badge">{transportStatus.badge}</span>
                      )}
                    </div>
                    <span className="participant-join-date">
                      Rejoint le {new Date(participant.joined_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="participant-status">
                    <span className={`transport-status ${transportStatus.type}`}>
                      {transportStatus.message}
                    </span>
                    {transportStatus.car && transportStatus.type === 'driver' && (
                      <div className="car-details">
                        <span className="car-info">
                          Capacité: {event.cars?.find(c => c.id === transportStatus.car?.id)?.max_passengers || 4} places
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <p>Aucun participant pour le moment</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventInfoTab;
