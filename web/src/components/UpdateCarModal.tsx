import React, { useState, useEffect } from 'react';
import { Car, Participant, CarUpdate } from '../types';
import './UpdateCarModal.css';

interface UpdateCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCar: (carId: number, carUpdate: CarUpdate) => Promise<void>;
  car: Car | null;
  participants: Participant[];
}

const UpdateCarModal: React.FC<UpdateCarModalProps> = ({
  isOpen,
  onClose,
  onUpdateCar,
  car,
  participants,
}) => {
  const [formData, setFormData] = useState<CarUpdate>({
    actual_fuel_cost: undefined,
    driver_id: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (car) {
      setFormData({
        actual_fuel_cost: car.actual_fuel_cost || car.fuel_cost,
        driver_id: car.driver_id || undefined,
      });
    }
  }, [car]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : (value ? parseInt(value) : undefined),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await onUpdateCar(car.id, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (car) {
      setFormData({
        actual_fuel_cost: car.fuel_cost,
        driver_id: car.driver_id || undefined,
      });
    }
  };

  if (!isOpen || !car) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>🔧 Mettre à jour la voiture</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="car-info">
          <h3>🚗 {car.license_plate} - {car.driver_name}</h3>
          <p>Coût d'essence estimé : {car.fuel_cost.toFixed(2)}€</p>
          {car.rental_cost && car.rental_cost > 0 && (
            <p>Coût de location : {car.rental_cost.toFixed(2)}€</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="update-car-form">
          <div className="form-group">
            <label htmlFor="actual_fuel_cost">
              ⛽ Coût d'essence réel (€)
              <span className="hint">Entrez le montant réel après avoir fait le plein</span>
            </label>
            <input
              type="number"
              id="actual_fuel_cost"
              name="actual_fuel_cost"
              value={formData.actual_fuel_cost || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              disabled={isLoading}
              placeholder={`${car.fuel_cost.toFixed(2)} (estimé)`}
            />
          </div>

          <div className="form-group">
            <label htmlFor="driver_id">
              👤 Conducteur
              <span className="hint">Sélectionnez le conducteur parmi les participants</span>
            </label>
            <select
              id="driver_id"
              name="driver_id"
              value={formData.driver_id || ''}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="">-- Sélectionner un conducteur --</option>
              {participants.map(participant => (
                <option key={participant.id} value={participant.id}>
                  {participant.name}
                </option>
              ))}
            </select>
            {car.driver_name && !formData.driver_id && (
              <small className="current-driver">
                Conducteur actuel : {car.driver_name}
              </small>
            )}
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
              disabled={isLoading}
            >
              🔄 Réinitialiser
            </button>
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
              disabled={isLoading}
            >
              {isLoading ? 'Mise à jour...' : '✅ Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCarModal;
