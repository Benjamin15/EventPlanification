import React, { useState } from 'react';
import { Car, Participant } from '../types';
import './AssignCarModal.css';

interface AssignCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  cars: Car[];
  participants: Participant[];
  onAssignToCar: (participantId: number, carId: number) => Promise<void>;
  onRemoveFromCar: (participantId: number) => Promise<void>;
}

const AssignCarModal: React.FC<AssignCarModalProps> = ({
  isOpen,
  onClose,
  cars,
  participants,
  onAssignToCar,
  onRemoveFromCar,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);

  const handleAssign = async (carId: number) => {
    if (!selectedParticipant) return;
    
    setIsLoading(true);
    try {
      await onAssignToCar(selectedParticipant, carId);
      setSelectedParticipant(null);
      onClose();
    } catch (error) {
      console.error('Error assigning participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (participantId: number) => {
    setIsLoading(true);
    try {
      await onRemoveFromCar(participantId);
    } catch (error) {
      console.error('Error removing participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const availableParticipants = participants.filter(p => !p.car_id);
  const assignedParticipants = participants.filter(p => p.car_id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assign-car-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚗 Gestion des passagers</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="assign-car-content">
          {/* Section d'assignation */}
          <div className="assign-section">
            <h3>Assigner un participant à une voiture</h3>
            
            <div className="participant-selection">
              <label htmlFor="participant-select">Choisir un participant :</label>
              <select 
                id="participant-select"
                value={selectedParticipant || ''}
                onChange={(e) => setSelectedParticipant(e.target.value ? Number(e.target.value) : null)}
                disabled={isLoading || availableParticipants.length === 0}
              >
                <option value="">-- Sélectionner un participant --</option>
                {availableParticipants.map(participant => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </div>

            {availableParticipants.length === 0 && (
              <p className="info-message">
                Tous les participants sont déjà assignés à une voiture
              </p>
            )}

            {selectedParticipant && (
              <div className="cars-grid">
                {cars.map(car => {
                  const currentPassengers = assignedParticipants.filter(p => p.car_id === car.id).length;
                  const isFull = currentPassengers >= car.max_passengers;
                  
                  return (
                    <div key={car.id} className={`car-option ${isFull ? 'full' : ''}`}>
                      <div className="car-info">
                        <h4>🚗 {car.license_plate}</h4>
                        <p>Conducteur: {car.driver_name}</p>
                        <p>Places: {currentPassengers}/{car.max_passengers}</p>
                        <p className="fuel-cost">⛽ {car.fuel_cost.toFixed(2)}€</p>
                        {car.rental_cost && car.rental_cost > 0 && (
                          <p className="rental-cost">🏠 {car.rental_cost.toFixed(2)}€</p>
                        )}
                      </div>
                      <button
                        className="assign-button"
                        onClick={() => handleAssign(car.id)}
                        disabled={isLoading || isFull}
                      >
                        {isFull ? 'Complet' : 'Assigner'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section des assignations actuelles */}
          <div className="current-assignments">
            <h3>Assignations actuelles</h3>
            
            {cars.length === 0 ? (
              <p className="info-message">Aucune voiture enregistrée</p>
            ) : (
              <div className="assignments-list">
                {cars.map(car => {
                  const carPassengers = assignedParticipants.filter(p => p.car_id === car.id);
                  
                  return (
                    <div key={car.id} className="car-assignment">
                      <div className="car-header">
                        <h4>🚗 {car.license_plate} - {car.driver_name}</h4>
                        <span className="capacity">
                          {carPassengers.length}/{car.max_passengers} places
                        </span>
                        <span className="fuel-cost">⛽ {car.fuel_cost.toFixed(2)}€</span>
                        {car.rental_cost && car.rental_cost > 0 && (
                          <span className="rental-cost">🏠 {car.rental_cost.toFixed(2)}€</span>
                        )}
                      </div>
                      
                      {carPassengers.length > 0 ? (
                        <div className="passengers-list">
                          {carPassengers.map(passenger => (
                            <div key={passenger.id} className="passenger-item">
                              <span className="passenger-name">{passenger.name}</span>
                              <button
                                className="remove-button"
                                onClick={() => handleRemove(passenger.id)}
                                disabled={isLoading}
                                title="Retirer de la voiture"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-passengers">Aucun passager assigné</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="close-modal-button"
            onClick={onClose}
            disabled={isLoading}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignCarModal;
