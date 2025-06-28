import React, { useState } from 'react';
import { MealCreate } from '../types';
import './AddMealModal.css';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: MealCreate) => Promise<void>;
  eventId: number;
}

const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
  eventId,
}) => {
  const [formData, setFormData] = useState<MealCreate>({
    event_id: eventId,
    meal_type: 'dinner',
    date: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mealTypes = [
    { value: 'breakfast', label: '🥐 Petit-déjeuner', emoji: '🥐' },
    { value: 'lunch', label: '🥙 Déjeuner', emoji: '🥙' },
    { value: 'dinner', label: '🍽️ Dîner', emoji: '🍽️' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onAddMeal({
        ...formData,
        event_id: eventId,
      });
      
      // Reset form
      setFormData({
        event_id: eventId,
        meal_type: 'dinner',
        date: '',
        description: '',
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
          <h2>🍽️ Planifier un repas</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-meal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="meal_type">Type de repas</label>
              <select
                id="meal_type"
                name="meal_type"
                value={formData.meal_type}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                {mealTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date et heure *</label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description du repas</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              placeholder="Raclette avec salade verte, tartiflette..."
            />
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
              disabled={isLoading || !formData.date}
            >
              {isLoading ? 'Ajout...' : 'Planifier le repas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;
