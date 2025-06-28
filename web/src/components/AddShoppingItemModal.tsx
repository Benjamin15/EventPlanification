import React, { useState } from 'react';
import { ShoppingItemCreate } from '../types';
import './AddShoppingItemModal.css';

interface AddShoppingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: ShoppingItemCreate) => Promise<void>;
  eventId: number;
}

const AddShoppingItemModal: React.FC<AddShoppingItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  eventId,
}) => {
  const [formData, setFormData] = useState<ShoppingItemCreate>({
    event_id: eventId,
    name: '',
    category: 'food',
    quantity: 1,
    price: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'food', label: '🍽️ Alimentation', emoji: '🍽️' },
    { value: 'beverages', label: '🥤 Boissons', emoji: '🥤' },
    { value: 'cleaning', label: '🧹 Ménage', emoji: '🧹' },
    { value: 'other', label: '📦 Autre', emoji: '📦' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      await onAddItem({
        ...formData,
        event_id: eventId,
      });
      
      // Reset form
      setFormData({
        event_id: eventId,
        name: '',
        category: 'food',
        quantity: 1,
        price: 0,
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
          <h2>🛒 Ajouter un article</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-group">
            <label htmlFor="name">Nom de l'article *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Pain, lait, fromage..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Catégorie</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantité</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                step="1"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Prix unitaire (€)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
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
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Ajout...' : 'Ajouter l\'article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShoppingItemModal;
