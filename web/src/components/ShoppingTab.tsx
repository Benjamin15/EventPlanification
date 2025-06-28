import React from 'react';
import { ShoppingItem, Participant } from '../types';

interface ShoppingTabProps {
  shoppingItems: ShoppingItem[];
  participant: Participant;
  onAddItem: () => void;
  onMarkAsBought: (itemId: number) => void;
  isLoading?: boolean;
}

const ShoppingTab: React.FC<ShoppingTabProps> = ({ 
  shoppingItems, 
  participant,
  onAddItem, 
  onMarkAsBought,
  isLoading = false 
}) => {
  const totalShopping = shoppingItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  const boughtItems = shoppingItems.filter(item => item.is_bought);

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
                    onClick={() => !item.is_bought && onMarkAsBought(item.id)}
                    disabled={item.is_bought || isLoading}
                  >
                    {item.is_bought ? '✅' : '⬜'}
                  </button>
                  <span className="item-name">{item.name}</span>
                  <span className="item-category">({item.category})</span>
                </div>
                <div className="item-details">
                  <span className="item-quantity">Qté: {item.quantity}</span>
                  <span className="item-price">{(item.price * item.quantity).toFixed(2)}€</span>
                  {item.is_bought && item.bought_by && (
                    <span className="item-bought-by">par {item.bought_by}</span>
                  )}
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
