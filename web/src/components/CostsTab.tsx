import React from 'react';
import { CostSummary, ShoppingItem, Car } from '../types';

interface CostsTabProps {
  costs?: CostSummary;
  shoppingItems: ShoppingItem[];
  cars: Car[];
  participantCount: number;
}

const CostsTab: React.FC<CostsTabProps> = ({ 
  costs, 
  shoppingItems, 
  cars, 
  participantCount 
}) => {
  // Calculs locaux si pas de costs fourni
  const totalShopping = shoppingItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );
  
  const totalTransport = cars.reduce(
    (sum, car) => sum + car.fuel_cost + (car.rental_cost || 0), 
    0
  );
  
  const totalCost = totalShopping + totalTransport;
  const costPerPerson = participantCount > 0 ? totalCost / participantCount : 0;

  // Calculs détaillés par catégorie
  const shoppingByCategory = shoppingItems.reduce((acc, item) => {
    const category = item.category;
    const cost = item.price * item.quantity;
    acc[category] = (acc[category] || 0) + cost;
    return acc;
  }, {} as Record<string, number>);

  const transportBreakdown = {
    fuel: cars.reduce((sum, car) => sum + car.fuel_cost, 0),
    rental: cars.reduce((sum, car) => sum + (car.rental_cost || 0), 0)
  };

  return (
    <div className="tab-content">
      <section className="dashboard-section">
        <h2 className="section-title">💰 Résumé des coûts</h2>
        
        {/* Résumé principal */}
        <div className="costs-overview">
          <div className="cost-cards">
            <div className="cost-card primary">
              <div className="cost-icon">💳</div>
              <div className="cost-content">
                <div className="cost-amount">{costPerPerson.toFixed(2)}€</div>
                <div className="cost-label">Par personne</div>
              </div>
            </div>
            
            <div className="cost-card">
              <div className="cost-icon">🛒</div>
              <div className="cost-content">
                <div className="cost-amount">{totalShopping.toFixed(2)}€</div>
                <div className="cost-label">Courses</div>
              </div>
            </div>
            
            <div className="cost-card">
              <div className="cost-icon">🚗</div>
              <div className="cost-content">
                <div className="cost-amount">{totalTransport.toFixed(2)}€</div>
                <div className="cost-label">Transport</div>
              </div>
            </div>
            
            <div className="cost-card">
              <div className="cost-icon">💰</div>
              <div className="cost-content">
                <div className="cost-amount">{totalCost.toFixed(2)}€</div>
                <div className="cost-label">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Détail des courses par catégorie */}
        {Object.keys(shoppingByCategory).length > 0 && (
          <div className="cost-breakdown">
            <h3 className="breakdown-title">🛒 Détail des courses</h3>
            <div className="breakdown-items">
              {Object.entries(shoppingByCategory).map(([category, amount]) => (
                <div key={category} className="breakdown-item">
                  <span className="breakdown-label">{category}</span>
                  <span className="breakdown-amount">{amount.toFixed(2)}€</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Détail du transport */}
        {cars.length > 0 && (
          <div className="cost-breakdown">
            <h3 className="breakdown-title">🚗 Détail du transport</h3>
            <div className="breakdown-items">
              {transportBreakdown.fuel > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-label">Essence</span>
                  <span className="breakdown-amount">{transportBreakdown.fuel.toFixed(2)}€</span>
                </div>
              )}
              {transportBreakdown.rental > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-label">Location</span>
                  <span className="breakdown-amount">{transportBreakdown.rental.toFixed(2)}€</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Répartition par voiture */}
        {cars.length > 0 && (
          <div className="cost-breakdown">
            <h3 className="breakdown-title">🚗 Coût par voiture</h3>
            <div className="car-costs-list">
              {cars.map(car => {
                const carTotal = car.fuel_cost + (car.rental_cost || 0);
                return (
                  <div key={car.id} className="car-cost-item">
                    <div className="car-cost-info">
                      <span className="car-cost-driver">{car.driver_name}</span>
                      <span className="car-cost-plate">{car.license_plate}</span>
                    </div>
                    <span className="car-cost-amount">{carTotal.toFixed(2)}€</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Informations de partage */}
        <div className="cost-sharing-info">
          <div className="sharing-card">
            <h4>📊 Répartition</h4>
            <p>
              Coût total de <strong>{totalCost.toFixed(2)}€</strong> réparti entre{' '}
              <strong>{participantCount} participants</strong>
            </p>
            <p className="sharing-note">
              Chaque participant doit contribuer <strong>{costPerPerson.toFixed(2)}€</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CostsTab;
