import React, { useState } from 'react';
import { EventCreate } from '../types';
import { useErrorHandling, useFormValidation } from '../hooks/useErrorHandling';
import { apiService } from '../services/api';
import './CreateEventModal.css';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: EventCreate) => Promise<any>;
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { errors, fieldErrors, addError, clearFieldError, clearAllErrors } = useErrorHandling();
  
  const validationRules = {
    name: { 
      required: true, 
      minLength: 3,
      maxLength: 100 
    },
    location: { 
      required: true, 
      minLength: 3 
    },
    start_date: { 
      required: true,
      custom: (value: string) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today ? 'La date de début ne peut pas être dans le passé' : null;
      }
    },
    end_date: { 
      required: true,
      custom: (value: string) => {
        if (!formData.start_date) return null;
        const startDate = new Date(formData.start_date);
        const endDate = new Date(value);
        return endDate <= startDate ? 'La date de fin doit être après la date de début' : null;
      }
    },
    chalet_link: {
      custom: (value: string) => {
        if (!value) return null;
        try {
          new URL(value);
          return null;
        } catch {
          return 'Veuillez entrer une URL valide';
        }
      }
    }
  };

  const { errors: validationErrors, validateForm, validateSingleField, clearFieldError: clearValidationError, clearAllErrors: clearValidationErrors } = useFormValidation(validationRules);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation de la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        addError({
          message: 'L\'image ne doit pas dépasser 5MB',
          field: 'image'
        });
        return;
      }
      
      // Validation du format
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        addError({
          message: 'Seuls les formats JPEG, PNG et WebP sont acceptés',
          field: 'image'
        });
        return;
      }

      setSelectedImage(file);
      clearFieldError('image');

      // Créer l'aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    clearFieldError('image');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation en temps réel
    clearFieldError(name);
    clearValidationError(name);
    validateSingleField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    clearValidationErrors();
    
    // Validation complète du formulaire
    const isValid = validateForm(formData);

    if (!isValid) {
      addError({
        message: 'Veuillez corriger les erreurs dans le formulaire'
      });
      return;
    }

    setIsLoading(true);

    try {
      const createdEvent = await onCreateEvent(formData);
      
      // Upload de l'image si une image est sélectionnée
      if (selectedImage && createdEvent?.id) {
        try {
          await apiService.uploadEventImage(createdEvent.id, selectedImage);
        } catch (imageError) {
          console.error('Erreur lors de l\'upload de l\'image:', imageError);
          addError({
            message: 'Événement créé mais erreur lors de l\'upload de l\'image'
          });
        }
      }
      
      // Reset du formulaire en cas de succès
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
      clearAllErrors();
      onClose();
    } catch (error: any) {
      addError({
        message: error.response?.data?.detail || 'Erreur lors de la création de l\'événement'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      clearAllErrors();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un nouvel événement</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Erreurs générales */}
          {errors.filter(e => !e.field).map((error, index) => (
            <div key={index} className="error-message general-error">
              {error.message}
            </div>
          ))}

          <div className="form-group">
            <label htmlFor="name">Nom de l'événement *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={fieldErrors.name || validationErrors.name ? 'error' : ''}
              disabled={isLoading}
              placeholder="Week-end au chalet"
            />
            {(fieldErrors.name || validationErrors.name) && (
              <span className="error-message">{fieldErrors.name || validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="location">Lieu *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={fieldErrors.location || validationErrors.location ? 'error' : ''}
              disabled={isLoading}
              placeholder="Chamonix, France"
            />
            {(fieldErrors.location || validationErrors.location) && (
              <span className="error-message">{fieldErrors.location || validationErrors.location}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Date de début *</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={fieldErrors.start_date || validationErrors.start_date ? 'error' : ''}
                disabled={isLoading}
              />
              {(fieldErrors.start_date || validationErrors.start_date) && (
                <span className="error-message">{fieldErrors.start_date || validationErrors.start_date}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="end_date">Date de fin *</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={fieldErrors.end_date || validationErrors.end_date ? 'error' : ''}
                disabled={isLoading}
              />
              {(fieldErrors.end_date || validationErrors.end_date) && (
                <span className="error-message">{fieldErrors.end_date || validationErrors.end_date}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="chalet_link">Lien du chalet</label>
            <input
              type="url"
              id="chalet_link"
              name="chalet_link"
              value={formData.chalet_link}
              onChange={handleInputChange}
              className={fieldErrors.chalet_link || validationErrors.chalet_link ? 'error' : ''}
              disabled={isLoading}
              placeholder="https://exemple.com"
            />
            {(fieldErrors.chalet_link || validationErrors.chalet_link) && (
              <span className="error-message">{fieldErrors.chalet_link || validationErrors.chalet_link}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Décrivez votre événement..."
              rows={3}
            />
          </div>

          {/* Upload d'image */}
          <div className="form-group">
            <label>Photo de l'événement</label>
            <div className="image-upload-container">
              {!imagePreview ? (
                <div className="image-upload-zone">
                  <input
                    type="file"
                    id="image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="image-input"
                  />
                  <label htmlFor="image" className="image-upload-label">
                    <div className="upload-icon">📷</div>
                    <span>Cliquez pour ajouter une photo</span>
                    <small>JPEG, PNG, WebP - Max 5MB</small>
                  </label>
                </div>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Aperçu" className="image-preview" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="remove-image-button"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              )}
              {fieldErrors.image && (
                <span className="error-message">{fieldErrors.image}</span>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-button"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Création...' : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;