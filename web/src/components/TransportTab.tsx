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
  const participantsWithoutCar = participants.filter(p => {
    // Exclure les participants qui sont conducteurs
    const isDriver = cars.some(car => car.driver_id === p.id);
    // Exclure les participants qui sont passagers
    const isPassenger = p.car_id && !isDriver;
    // Ne garder que ceux qui ne sont ni conducteurs ni passagers
    return !isDriver && !isPassenger;
  });

  const getCarPassengers = (carId: number) => {
    // Récupérer uniquement les passagers (exclure le conducteur)
    return participants.filter(p => p.car_id === carId);
  };

  const getCarPassengersOnly = (carId: number, driverId: number) => {
    // Récupérer uniquement les passagers (exclure le conducteur)
    return participants.filter(p => p.car_id === carId && p.id !== driverId);
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
              const allCarParticipants = getCarPassengers(car.id); // Tous les participants de la voiture
              const passengersOnly = getCarPassengersOnly(car.id, car.driver_id || 0); // Seulement les passagers
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
                      <div className="capacity-header">
                        <span className="capacity-info">
                          👥 {allCarParticipants.length}/{car.max_passengers} places
                        </span>
                        <span className={`availability-badge ${allCarParticipants.length >= car.max_passengers ? 'full' : 'available'}`}>
                          {allCarParticipants.length >= car.max_passengers ? '🔴 Complet' : `🟢 ${car.max_passengers - allCarParticipants.length} place(s)`}
                        </span>
                      </div>
                      
                      {/* Affichage moderne des passagers */}
                      <div className="passengers-section">
                        <div className="driver-seat">
                          <div className="seat-item driver">
                            <div className="seat-icon">🚗</div>
                            <div className="seat-info">
                              <span className="seat-name">{car.driver_name}</span>
                              <span className="seat-role">Conducteur</span>
                            </div>
                          </div>
                        </div>
                        
                        {car.max_passengers > 1 && (
                          <div className="passengers-seats">
                            <h4 className="passengers-title">Passagers</h4>
                            <div className="seats-grid">
                              {Array.from({ length: car.max_passengers - 1 }, (_, index) => {
                                const passenger = passengersOnly[index]; // Utiliser seulement les passagers
                                const isOccupied = passenger !== undefined;
                                
                                return (
                                  <div key={index} className={`seat-item ${isOccupied ? 'occupied' : 'empty'}`}>
                                    <div className="seat-icon">
                                      {isOccupied ? '👤' : '💺'}
                                    </div>
                                    <div className="seat-info">
                                      {isOccupied ? (
                                        <>
                                          <span className="seat-name">{passenger.name}</span>
                                          <span className="seat-role">Passager</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="seat-name">Place libre</span>
                                          <span className="seat-role">Disponible</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
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
