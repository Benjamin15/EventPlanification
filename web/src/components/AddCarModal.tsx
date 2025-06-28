import React, { useState } from 'react';
import { CarCreate, Participant } from '../types';
import './AddCarModal.css';

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCar: (car: CarCreate) => Promise<void>;
  eventId: number;
  participants: Participant[];
}

const AddCarModal: React.FC<AddCarModalProps> = ({
  isOpen,
  onClose,
  onAddCar,
  eventId,
  participants,
}) => {
  const [formData, setFormData] = useState<CarCreate>({
    event_id: eventId,
    driver_name: '',
    license_plate: '',
    max_passengers: 4,
    fuel_cost: 0,
    rental_cost: 0,
    driver_id: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name === 'driver_id') {
      const driverId = value ? parseInt(value) : undefined;
      const selectedDriver = participants.find(p => p.id === driverId);
      setFormData(prev => ({
        ...prev,
        driver_id: driverId,
        driver_name: selectedDriver ? selectedDriver.name : '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onAddCar({
        ...formData,
        event_id: eventId,
      });
      
      // Reset form
      setFormData({
        event_id: eventId,
        driver_name: '',
        license_plate: '',
        max_passengers: 4,
        fuel_cost: 0,
        rental_cost: 0,
        driver_id: undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>🚗 Ajouter une voiture</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-car-form">
          <div className="form-group">
            <label htmlFor="driver_id">
              Conducteur *
              <span className="hint">Sélectionnez parmi les participants inscrits</span>
            </label>
            <select
              id="driver_id"
              name="driver_id"
              value={formData.driver_id || ''}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">-- Sélectionner un conducteur --</option>
              {participants.map(participant => (
                <option key={participant.id} value={participant.id}>
                  {participant.name}
                </option>
              ))}
            </select>
            {participants.length === 0 && (
              <small className="no-participants-hint">
                Aucun participant inscrit. Rejoignez d'abord l'événement pour ajouter une voiture.
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="license_plate">Plaque d'immatriculation *</label>
            <input
              type="text"
              id="license_plate"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="AB-123-CD"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="max_passengers">Nombre de places</label>
              <input
                type="number"
                id="max_passengers"
                name="max_passengers"
                value={formData.max_passengers}
                onChange={handleInputChange}
                min="2"
                max="8"
                step="1"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fuel_cost">Coût essence estimé ($)</label>
              <input
                type="number"
                id="fuel_cost"
                name="fuel_cost"
                value={formData.fuel_cost}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                disabled={isLoading}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rental_cost">Coût de location ($) <span className="optional">(optionnel)</span></label>
              <input
                type="number"
                id="rental_cost"
                name="rental_cost"
                value={formData.rental_cost || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                disabled={isLoading}
                placeholder="0.00"
              />
              <small className="field-hint">Coût de location de la voiture pour le voyage (si applicable)</small>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || !formData.driver_id || !formData.license_plate.trim()}
            >
              {isLoading ? 'Ajout...' : 'Ajouter la voiture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCarModal;
