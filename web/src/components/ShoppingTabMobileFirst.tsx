import React, { useState } from 'react';
import { ShoppingItem, ShoppingItemUpdate, Participant } from '../types';

interface ShoppingTabProps {
  shoppingItems: ShoppingItem[];
  participants: Participant[];
  participant: Participant;
  onAddItem: () => void;
  onMarkAsBought: (itemId: number) => void;
  onUnmarkAsBought: (itemId: number) => void;
  onUpdateItem: (itemId: number, updates: ShoppingItemUpdate) => void;
  onAssignItem: (itemId: number, assignedTo: string) => void;
  isLoading?: boolean;
}

interface EditModalState {
  isOpen: boolean;
  item: ShoppingItem | null;
  price: number;
  quantity: number;
  assignedTo: string;
  contributors: string[];
}

const ShoppingTab: React.FC<ShoppingTabProps> = ({ 
  shoppingItems, 
  participants,
  participant,
  onAddItem, 
  onMarkAsBought,
  onUnmarkAsBought,
  onUpdateItem,
  onAssignItem,
  isLoading = false 
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    item: null,
    price: 0,
    quantity: 1,
    assignedTo: '',
    contributors: []
  });

  const totalShopping = shoppingItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );
  const boughtItems = shoppingItems.filter(item => item.is_bought);

  // Toggle expansion des détails d'un article
  const toggleItemExpansion = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Ouvrir le modal d'édition
  const openEditModal = (item: ShoppingItem, event: React.MouseEvent) => {
    event.stopPropagation(); // Empêcher le toggle des détails
    
    // Déterminer les contributeurs actuels - tous par défaut selon vos spécifications
    let currentContributors: string[] = participants.map(p => p.name);
    if (item.contributors && item.contributors !== 'tous') {
      try {
        currentContributors = JSON.parse(item.contributors);
      } catch {
        currentContributors = participants.map(p => p.name); // Fallback : tous
      }
    }

    setEditModal({
      isOpen: true,
      item,
      price: item.price,
      quantity: item.quantity,
      assignedTo: item.assigned_to || '',
      contributors: currentContributors
    });
  };

  // Fermer le modal d'édition
  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      item: null,
      price: 0,
      quantity: 1,
      assignedTo: '',
      contributors: []
    });
  };

  // Sauvegarder les modifications
  const saveChanges = () => {
    if (!editModal.item) return;

    const contributorsString = editModal.contributors.length === participants.length 
      ? 'tous' 
      : JSON.stringify(editModal.contributors);

    onUpdateItem(editModal.item.id, {
      price: editModal.price,
      quantity: editModal.quantity,
      assigned_to: editModal.assignedTo,
      contributors: contributorsString
    });

    closeEditModal();
  };

  // Toggle contributor dans le modal
  const toggleContributor = (contributorName: string) => {
    const newContributors = editModal.contributors.includes(contributorName)
      ? editModal.contributors.filter(name => name !== contributorName)
      : [...editModal.contributors, contributorName];
    
    setEditModal({ ...editModal, contributors: newContributors });
  };

  // Marquer comme acheté/non acheté
  const handleToggleBought = (item: ShoppingItem) => {
    if (item.is_bought) {
      onUnmarkAsBought(item.id);
    } else {
      onMarkAsBought(item.id);
    }
  };

  // Formatage du responsable/acheteur pour affichage direct sur la carte
  const getResponsibleText = (item: ShoppingItem) => {
    if (item.is_bought && item.bought_by) {
      return `✅ Acheté par ${item.bought_by}`;
    } else if (item.assigned_to) {
      return `👤 ${item.assigned_to}`;
    }
    return null;
  };

  return (
    <div className="tab-content">
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">🛒 Liste de courses</h2>
          <button 
            className="add-button"
            onClick={onAddItem}
            disabled={isLoading}
          >
            ➕ Ajouter un article
          </button>
        </div>

        {/* Résumé des courses */}
        <div className="shopping-summary">
          <div className="shopping-stats">
            <div className="stat-item">
              <span className="stat-value">{shoppingItems.length}</span>
              <span className="stat-label">articles</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{boughtItems.length}</span>
              <span className="stat-label">achetés</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalShopping.toFixed(2)}€</span>
              <span className="stat-label">total</span>
            </div>
          </div>
        </div>
        
        {/* Liste des articles avec le nouveau design mobile-first */}
        <div className="shopping-list-mobile">
          {shoppingItems.length > 0 ? (
            shoppingItems.map((item) => (
              <div 
                key={item.id} 
                className={`shopping-item-card ${item.is_bought ? 'bought' : ''}`}
                onClick={() => toggleItemExpansion(item.id)}
              >
                {/* Header principal de la carte - toujours visible */}
                <div className="item-header-main">
                  <button
                    className="item-checkbox"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBought(item);
                    }}
                    disabled={isLoading}
                    title={item.is_bought ? "Cliquer pour déselectionner" : "Marquer comme acheté"}
                  >
                    {item.is_bought ? '✅' : '⬜'}
                  </button>
                  
                  <div className="item-main-info">
                    <div className="item-first-line">
                      <span className="item-name">{item.name}</span>
                      <span className="item-category">({item.category})</span>
                    </div>
                    
                    <div className="item-second-line">
                      <span className="item-price-main">{(item.price * item.quantity).toFixed(2)}€</span>
                      {getResponsibleText(item) && (
                        <span className="item-responsible">{getResponsibleText(item)}</span>
                      )}
                    </div>
                  </div>

                  <button className="expand-icon">
                    {expandedItems.has(item.id) ? '🔽' : '▶️'}
                  </button>
                </div>

                {/* Détails expandables */}
                {expandedItems.has(item.id) && (
                  <div className="item-details-expanded">
                    <div className="details-row">
                      <span className="detail-label">Prix unitaire:</span>
                      <span className="detail-value">{item.price.toFixed(2)}€</span>
                    </div>
                    <div className="details-row">
                      <span className="detail-label">Quantité:</span>
                      <span className="detail-value">{item.quantity}</span>
                    </div>
                    {!item.is_bought && (
                      <div className="details-row">
                        <span className="detail-label">Responsable:</span>
                        <span className="detail-value">{item.assigned_to || 'Non assigné'}</span>
                      </div>
                    )}
                    
                    <button 
                      className="edit-button-expanded"
                      onClick={(e) => openEditModal(item, e)}
                      disabled={isLoading}
                    >
                      ⚙️ Modifier
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty-state">Aucun article dans la liste de courses</p>
          )}
        </div>
      </section>

      {/* Modal d'édition */}
      {editModal.isOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier {editModal.item?.name}</h3>
              <button className="modal-close" onClick={closeEditModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Prix unitaire (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editModal.price}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    price: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="form-group">
                <label>Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={editModal.quantity}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    quantity: parseInt(e.target.value) || 1
                  })}
                />
              </div>

              <div className="form-group">
                <label>Responsable</label>
                <input
                  type="text"
                  placeholder="Qui va l'acheter?"
                  value={editModal.assignedTo}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    assignedTo: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label>Contributeurs (tous sélectionnés par défaut)</label>
                <div className="contributors-grid">
                  {participants.map(p => (
                    <label key={p.id} className="contributor-checkbox">
                      <input
                        type="checkbox"
                        checked={editModal.contributors.includes(p.name)}
                        onChange={() => toggleContributor(p.name)}
                      />
                      <span className="checkbox-custom"></span>
                      <span className="participant-name">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="save-btn"
                onClick={saveChanges}
                disabled={isLoading}
              >
                💾 Sauvegarder
              </button>
              <button 
                className="cancel-btn"
                onClick={closeEditModal}
                disabled={isLoading}
              >
                ↩️ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingTab;
