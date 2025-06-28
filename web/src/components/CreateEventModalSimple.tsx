import React, { useState } from 'react';
import { EventCreate } from '../types';
import './CreateEventModal.css';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: EventCreate) => Promise<void>;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
}) => {
  const [formData, setFormData] = useState<EventCreate>({
    name: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    chalet_link: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Seuls les formats JPEG, PNG et WebP sont acceptés');
        return;
      }

      setSelectedImage(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!formData.name?.trim()) {
      setError('Le nom de l\'événement est requis');
      return;
    }
    if (!formData.location?.trim()) {
      setError('Le lieu est requis');
      return;
    }
    if (!formData.start_date) {
      setError('La date de début est requise');
      return;
    }
    if (!formData.end_date) {
      setError('La date de fin est requise');
      return;
    }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    setIsLoading(true);

    try {
      await onCreateEvent(formData);
      // Reset form
      setFormData({
        name: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        chalet_link: '',
      });
      setSelectedImage(null);
      setImagePreview(null);
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création de l\'événement');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un nouvel événement</h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-event-form">
            <div className="form-group">
              <label htmlFor="name">Nom de l'événement</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Weekend au chalet"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (optionnel)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Détails sur le weekend..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Lieu du chalet</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Chamonix, France"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">Date de début</label>
                <input
                  type="datetime-local"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">Date de fin</label>
                <input
                  type="datetime-local"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="chalet_link">Lien du chalet (optionnel)</label>
              <input
                type="url"
                id="chalet_link"
                name="chalet_link"
                value={formData.chalet_link}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="event_image">Photo de l'événement (optionnel)</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="event_image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={isLoading}
                  className="image-input"
                />
                <label htmlFor="event_image" className="image-upload-label">
                  {selectedImage ? '📷 Changer l\'image' : '📷 Ajouter une image'}
                </label>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Aperçu" />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading || !formData.name?.trim()}
              >
                {isLoading ? 'Création...' : 'Créer l\'événement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
