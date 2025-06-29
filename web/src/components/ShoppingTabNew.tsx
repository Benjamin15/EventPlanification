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
    
    // Déterminer les contributeurs actuels
    let currentContributors: string[] = [];
    if (item.contributors && item.contributors !== 'tous') {
      try {
        currentContributors = JSON.parse(item.contributors);
      } catch {
        currentContributors = participants.map(p => p.name); // Fallback : tous
      }
    } else {
      currentContributors = participants.map(p => p.name); // Par défaut : tous
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

  // Formatage du responsable/acheteur
  const getResponsibleText = (item: ShoppingItem) => {
    if (item.is_bought && item.bought_by) {
      return `✅ Acheté par ${item.bought_by}`;
    } else if (item.assigned_to) {
      return `👤 Responsable: ${item.assigned_to}`;
    }
    return `👤 Pas de responsable`;
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
        
        {/* Liste des articles - Style Mobile-First avec panels */}
        <div className="shopping-list mobile-style">
          {shoppingItems.length > 0 ? (
            shoppingItems.map((item) => (
              <div 
                key={item.id} 
                className={`mobile-shopping-item ${item.is_bought ? 'bought' : ''}`}
              >
                {/* Header principal - toujours visible */}
                <div 
                  className="mobile-item-header"
                  onClick={() => toggleItemExpansion(item.id)}
                >
                  <div className="mobile-item-main">
                    <div className="mobile-item-left">
                      <button
                        className="mobile-checkbox"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBought(item);
                        }}
                        disabled={isLoading}
                        title={item.is_bought ? "Démarquer comme acheté" : "Marquer comme acheté"}
                      >
                        {item.is_bought ? '✅' : '☐'}
                      </button>
                      <div className="mobile-item-info">
                        <span className="mobile-item-name">
                          {item.name}
                        </span>
                        <span className="mobile-item-category">({item.category})</span>
                      </div>
                    </div>
                    <div className="mobile-item-price">
                      {(item.price * item.quantity).toFixed(2)}€
                    </div>
                  </div>
                  
                  {/* Responsable/Acheteur toujours visible */}
                  <div className="mobile-item-responsible">
                    {getResponsibleText(item)}
                  </div>
                  
                  <div className="mobile-item-hint">
                    📱 {expandedItems.has(item.id) ? 'Appuyer pour replier' : 'Appuyer pour détails'}
                  </div>
                </div>

                {/* Détails expansibles */}
                {expandedItems.has(item.id) && (
                  <div className="mobile-item-details">
                    <div className="mobile-detail-row">
                      <span className="detail-label">💰 Prix unitaire:</span>
                      <span className="detail-value">{item.price.toFixed(2)}€</span>
                    </div>
                    <div className="mobile-detail-row">
                      <span className="detail-label">📦 Quantité:</span>
                      <span className="detail-value">{item.quantity}</span>
                    </div>
                    {item.is_bought && item.bought_by && (
                      <div className="mobile-detail-row">
                        <span className="detail-label">✅ Acheté par:</span>
                        <span className="detail-value">{item.bought_by}</span>
                      </div>
                    )}
                    
                    <div className="mobile-item-actions">
                      <button 
                        className="mobile-btn primary"
                        onClick={(e) => openEditModal(item, e)}
                        disabled={isLoading}
                      >
                        ⚙️ Modifier
                      </button>
                      {!item.is_bought && (
                        <button 
                          className="mobile-btn secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBought(item);
                          }}
                          disabled={isLoading}
                        >
                          ✅ Marquer acheté
                        </button>
                      )}
                      {item.is_bought && (
                        <button 
                          className="mobile-btn secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBought(item);
                          }}
                          disabled={isLoading}
                        >
                          ↩️ Annuler achat
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-shopping-list">
              <p>Aucun article dans la liste de courses.</p>
              <button 
                className="add-button secondary"
                onClick={onAddItem}
                disabled={isLoading}
              >
                ➕ Ajouter le premier article
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal d'édition */}
      {editModal.isOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ Modifier l'article</h3>
              <button className="modal-close" onClick={closeEditModal}>✕</button>
            </div>
            
            <div className="modal-content">
              {editModal.item && (
                <>
                  <div className="modal-item-header">
                    <span className="modal-item-name">{editModal.item.name}</span>
                    <span className="modal-item-category">({editModal.item.category})</span>
                  </div>

                  <div className="modal-form">
                    <div className="form-row">
                      <div className="form-field">
                        <label>💰 Prix unitaire (€)</label>
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
                      <div className="form-field">
                        <label>📦 Quantité</label>
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
                    </div>

                    <div className="form-field">
                      <label>👤 Responsable (qui va l'acheter)</label>
                      <input
                        type="text"
                        placeholder="Nom du responsable"
                        value={editModal.assignedTo}
                        onChange={(e) => setEditModal({
                          ...editModal,
                          assignedTo: e.target.value
                        })}
                      />
                    </div>

                    <div className="form-field">
                      <label>💰 Contributeurs (qui paie)</label>
                      <div className="contributors-selection-modal">
                        <div className="contributors-grid-modal">
                          {participants.map(p => (
                            <label key={p.id} className="participant-checkbox-modal">
                              <input
                                type="checkbox"
                                checked={editModal.contributors.includes(p.name)}
                                onChange={() => toggleContributor(p.name)}
                              />
                              <span className="checkbox-custom-modal"></span>
                              <span className="participant-name-modal">{p.name}</span>
                            </label>
                          ))}
                        </div>
                        <div className="contributors-info">
                          {editModal.contributors.length === participants.length ? (
                            <span className="contributors-all">✅ Tous les participants</span>
                          ) : (
                            <span className="contributors-specific">
                              👥 {editModal.contributors.length} participant(s) sélectionné(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={closeEditModal}
              >
                ↩️ Annuler
              </button>
              <button 
                className="modal-btn save"
                onClick={saveChanges}
                disabled={editModal.contributors.length === 0}
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingTab;
