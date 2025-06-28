import React, { useState } from 'react';
import { CarCreate } from '../types';
import './AddCarModal.css';

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCar: (car: CarCreate) => Promise<void>;
  eventId: number;
}

const AddCarModal: React.FC<AddCarModalProps> = ({
  isOpen,
  onClose,
  onAddCar,
  eventId,
}) => {
  const [formData, setFormData] = useState<CarCreate>({
    event_id: eventId,
    driver_name: '',
    license_plate: '',
    max_passengers: 4,
    fuel_cost: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
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
            <label htmlFor="driver_name">Nom du conducteur *</label>
            <input
              type="text"
              id="driver_name"
              name="driver_name"
              value={formData.driver_name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Votre nom"
            />
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
              <label htmlFor="fuel_cost">Coût essence estimé (€)</label>
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
              disabled={isLoading || !formData.driver_name.trim() || !formData.license_plate.trim()}
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
