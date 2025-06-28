import React from 'react';
import { Car, Participant } from '../types';

interface TransportTabProps {
  cars: Car[];
  participants: Participant[];
  onAddCar: () => void;
  onAssignCar: () => void;
  onUpdateCar: (car: Car) => void;
  isLoading?: boolean;
}

const TransportTab: React.FC<TransportTabProps> = ({ 
  cars, 
  participants,
  onAddCar, 
  onAssignCar,
  onUpdateCar,
  isLoading = false 
}) => {
  const totalTransportCost = cars.reduce((sum, car) => 
    sum + car.fuel_cost + (car.rental_cost || 0), 0
  );

  const totalPassengers = participants.filter(p => p.car_id).length;
  const participantsWithoutCar = participants.filter(p => !p.car_id);

  const getCarPassengers = (carId: number) => {
    return participants.filter(p => p.car_id === carId);
  };

  return (
    <div className="tab-content">
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">🚗 Organisation du transport</h2>
          <div className="section-actions">
            <button 
              className="add-button secondary"
              onClick={onAssignCar}
              disabled={isLoading}
            >
              👤 Assigner
            </button>
            <button 
              className="add-button"
              onClick={onAddCar}
              disabled={isLoading}
            >
              ➕ Ajouter une voiture
            </button>
          </div>
        </div>

        {/* Résumé du transport */}
        <div className="transport-summary">
          <div className="transport-stats">
            <div className="stat-item">
              <span className="stat-value">{cars.length}</span>
              <span className="stat-label">voitures</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalPassengers}</span>
              <span className="stat-label">assignés</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalTransportCost.toFixed(2)}€</span>
              <span className="stat-label">coût total</span>
            </div>
          </div>
        </div>

        {/* Liste des voitures */}
        <div className="cars-list">
          {cars.length > 0 ? (
            cars.map((car) => {
              const passengers = getCarPassengers(car.id);
              return (
                <div key={car.id} className="car-card">
                  <div className="car-header">
                    <div className="car-info">
                      <span className="car-driver">🚗 {car.driver_name}</span>
                      <span className="car-plate">{car.license_plate}</span>
                    </div>
                    <button 
                      className="car-edit-btn"
                      onClick={() => onUpdateCar(car)}
                      disabled={isLoading}
                    >
                      ⚙️
                    </button>
                  </div>
                  
                  <div className="car-details">
                    <div className="car-capacity">
                      <span className="capacity-info">
                        👥 {passengers.length}/{car.max_passengers} places
                      </span>
                      {passengers.length > 0 && (
                        <div className="passenger-list">
                          {passengers.map(passenger => (
                            <span key={passenger.id} className="passenger-tag">
                              {passenger.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="car-costs">
                      <div className="cost-item">
                        <span>Essence: {car.fuel_cost.toFixed(2)}€</span>
                      </div>
                      {car.rental_cost && (
                        <div className="cost-item">
                          <span>Location: {car.rental_cost.toFixed(2)}€</span>
                        </div>
                      )}
                      <div className="cost-total">
                        <span>Total: {(car.fuel_cost + (car.rental_cost || 0)).toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="empty-state">Aucune voiture ajoutée pour le moment</p>
          )}
        </div>

        {/* Participants sans voiture */}
        {participantsWithoutCar.length > 0 && (
          <div className="unassigned-participants">
            <h3 className="unassigned-title">🚶 Participants sans voiture ({participantsWithoutCar.length})</h3>
            <div className="unassigned-list">
              {participantsWithoutCar.map(participant => (
                <span key={participant.id} className="unassigned-tag">
                  {participant.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TransportTab;
