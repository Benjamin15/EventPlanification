import React, { useState } from 'react';
import { ActivityCreate } from '../types';
import './AddActivityModal.css';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (activity: ActivityCreate) => Promise<void>;
  eventId: number;
}

const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onAddActivity,
  eventId,
}) => {
  const [formData, setFormData] = useState<ActivityCreate>({
    event_id: eventId,
    name: '',
    activity_type: 'meal',
    date: '',
    description: '',
    location: '',
    max_participants: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activityTypes = [
    { value: 'meal', label: '🍽️ Repas', emoji: '🍽️' },
    { value: 'sport', label: '⛷️ Sport', emoji: '⛷️' },
    { value: 'leisure', label: '🎮 Loisirs', emoji: '🎮' },
    { value: 'tourism', label: '🏔️ Tourisme', emoji: '🏔️' },
    { value: 'other', label: '📝 Autre', emoji: '📝' },
  ];

  const mealSuggestions = [
    'Petit-déjeuner',
    'Déjeuner',
    'Dîner',
    'Apéritif',
    'Collation',
  ];

  const sportSuggestions = [
    'Randonnée matinale',
    'Session kayak',
    'Ski de fond',
    'Escalade',
    'VTT',
    'Natation',
  ];

  const leisureSuggestions = [
    'Soirée jeux',
    'Lecture',
    'Sieste',
    'Spa/Détente',
    'Musique',
  ];

  const tourismSuggestions = [
    'Visite village',
    'Musée local',
    'Marché artisanal',
    'Point de vue',
    'Château',
  ];

  const getSuggestions = () => {
    switch (formData.activity_type) {
      case 'meal': return mealSuggestions;
      case 'sport': return sportSuggestions;
      case 'leisure': return leisureSuggestions;
      case 'tourism': return tourismSuggestions;
      default: return [];
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_participants' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onAddActivity({
        ...formData,
        event_id: eventId,
      });
      
      // Reset form
      setFormData({
        event_id: eventId,
        name: '',
        activity_type: 'meal',
        date: '',
        description: '',
        location: '',
        max_participants: undefined,
      });
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'activité');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedType = activityTypes.find(type => type.value === formData.activity_type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✨ Ajouter une activité</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="add-activity-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="activity_type">Type d'activité</label>
              <select
                id="activity_type"
                name="activity_type"
                value={formData.activity_type}
                onChange={handleInputChange}
                required
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name">Nom de l'activité</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={`Ex: ${getSuggestions()[0] || 'Nom de l\'activité'}`}
                required
              />
            </div>
          </div>

          {getSuggestions().length > 0 && (
            <div className="suggestions">
              <span className="suggestions-label">Suggestions:</span>
              {getSuggestions().map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date et heure</label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="max_participants">Participants max</label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                value={formData.max_participants || ''}
                onChange={handleInputChange}
                placeholder="Illimité"
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Lieu</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Où se déroule l'activité?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Détails sur l'activité..."
              rows={3}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? '⏳ Ajout...' : `${selectedType?.emoji} Ajouter`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivityModal;
