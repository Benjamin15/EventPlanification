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
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{[key: number]: ShoppingItemUpdate}>({});

  const totalShopping = shoppingItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  const boughtItems = shoppingItems.filter(item => item.is_bought);

  const handleEditStart = (item: ShoppingItem) => {
    setEditingItem(item.id);
    setEditValues({
      ...editValues,
      [item.id]: {
        price: item.price,
        quantity: item.quantity,
        assigned_to: item.assigned_to || '',
        contributors: item.contributors || 'tous'
      }
    });
  };

  // Fonction pour formater l'affichage des contributeurs
  const formatContributors = (contributors?: string) => {
    if (!contributors || contributors === 'tous') {
      return 'Tous les participants';
    }
    try {
      const contributorsList = JSON.parse(contributors);
      return contributorsList.join(', ');
    } catch {
      return contributors;
    }
  };

  // Fonction pour gérer la sélection des contributeurs
  const handleContributorsChange = (itemId: number, selectedContributors: string[]) => {
    const contributorsValue = selectedContributors.length === participants.length ? 
      'tous' : 
      JSON.stringify(selectedContributors);
    
    handleEditChange(itemId, 'contributors', contributorsValue);
  };

  const handleEditSave = async (itemId: number) => {
    const updates = editValues[itemId];
    if (updates) {
      await onUpdateItem(itemId, updates);
      setEditingItem(null);
      setEditValues(prev => {
        const newValues = { ...prev };
        delete newValues[itemId];
        return newValues;
      });
    }
  };

  const handleEditCancel = () => {
    setEditingItem(null);
    setEditValues(prev => {
      const newValues = { ...prev };
      if (editingItem) {
        delete newValues[editingItem];
      }
      return newValues;
    });
  };

  const handleEditChange = (itemId: number, field: keyof ShoppingItemUpdate, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleToggleBought = (item: ShoppingItem) => {
    if (item.is_bought) {
      onUnmarkAsBought(item.id);
    } else {
      onMarkAsBought(item.id);
    }
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
        
        <div className="shopping-list">
          {shoppingItems.length > 0 ? (
            shoppingItems.map((item) => (
              <div 
                key={item.id} 
                className={`shopping-item ${item.is_bought ? 'bought' : ''}`}
              >
                <div className="item-info">
                  <button
                    className="item-checkbox"
                    onClick={() => handleToggleBought(item)}
                    disabled={isLoading}
                    title={item.is_bought ? "Cliquer pour déselectionner" : "Marquer comme acheté"}
                  >
                    {item.is_bought ? '✅' : '⬜'}
                  </button>
                  <div className="item-content">
                    <div className="item-header">
                      <span className="item-name">{item.name}</span>
                      <span className="item-category">({item.category})</span>
                      {item.assigned_to && !item.is_bought && (
                        <span className="item-assigned">👤 {item.assigned_to}</span>
                      )}
                      <span className="item-contributors" title="Qui contribue au paiement">
                        💰 {formatContributors(item.contributors)}
                      </span>
                    </div>
                    
                    {editingItem === item.id ? (
                      <div className="item-edit-form">
                        <div className="edit-row">
                          <div className="edit-field">
                            <label>Prix unitaire (€)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editValues[item.id]?.price || 0}
                              onChange={(e) => handleEditChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="edit-field">
                            <label>Quantité</label>
                            <input
                              type="number"
                              min="1"
                              value={editValues[item.id]?.quantity || 1}
                              onChange={(e) => handleEditChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div className="edit-field">
                            <label>Responsable</label>
                            <input
                              type="text"
                              placeholder="Qui va l'acheter?"
                              value={editValues[item.id]?.assigned_to || ''}
                              onChange={(e) => handleEditChange(item.id, 'assigned_to', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="edit-row">
                          <div className="edit-field contributors-field">
                            <label>Contributeurs (qui paie)</label>
                            <div className="contributors-selection">
                              <label className="contributor-option">
                                <input
                                  type="radio"
                                  name={`contributors-${item.id}`}
                                  checked={(editValues[item.id]?.contributors || 'tous') === 'tous'}
                                  onChange={() => handleEditChange(item.id, 'contributors', 'tous')}
                                />
                                Tous les participants
                              </label>
                              <label className="contributor-option">
                                <input
                                  type="radio"
                                  name={`contributors-${item.id}`}
                                  checked={(editValues[item.id]?.contributors || 'tous') !== 'tous'}
                                  onChange={() => {}}
                                />
                                Participants spécifiques
                              </label>
                              {(editValues[item.id]?.contributors || 'tous') !== 'tous' && (
                                <div className="specific-contributors">
                                  {participants.map(p => {
                                    const currentContributors = editValues[item.id]?.contributors;
                                    let isSelected = false;
                                    try {
                                      const contributorsList = currentContributors ? JSON.parse(currentContributors) : [];
                                      isSelected = contributorsList.includes(p.name);
                                    } catch {
                                      isSelected = false;
                                    }
                                    
                                    return (
                                      <label key={p.id} className="participant-checkbox">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            const currentContributors = editValues[item.id]?.contributors;
                                            let contributorsList: string[] = [];
                                            try {
                                              contributorsList = currentContributors ? JSON.parse(currentContributors) : [];
                                            } catch {
                                              contributorsList = [];
                                            }
                                            
                                            if (e.target.checked) {
                                              contributorsList = [...contributorsList, p.name];
                                            } else {
                                              contributorsList = contributorsList.filter(name => name !== p.name);
                                            }
                                            
                                            handleContributorsChange(item.id, contributorsList);
                                          }}
                                        />
                                        {p.name}
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="edit-actions">
                          <button 
                            className="save-btn"
                            onClick={() => handleEditSave(item.id)}
                            disabled={isLoading}
                          >
                            ✅ Sauvegarder
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={handleEditCancel}
                            disabled={isLoading}
                          >
                            ❌ Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="item-details">
                        <span className="item-quantity">Qté: {item.quantity}</span>
                        <span className="item-price">{(item.price * item.quantity).toFixed(2)}€</span>
                        {item.is_bought && item.bought_by && (
                          <span className="item-bought-by">✅ acheté par {item.bought_by}</span>
                        )}
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditStart(item)}
                          disabled={isLoading || editingItem !== null}
                          title="Modifier le prix, la quantité ou assigner un responsable"
                        >
                          ✏️ Modifier
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">Aucun article dans la liste de courses</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShoppingTab;
