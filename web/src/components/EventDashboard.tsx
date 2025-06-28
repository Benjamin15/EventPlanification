import React, { useState, useCallback } from 'react';
import { Event, Participant, CostSummary, MealCreate, ShoppingItemCreate, CarCreate } from '../types';
import { apiService } from '../services/api';
import { realtimeService, EventUpdate } from '../services/realtime';
import AddMealModal from './AddMealModal';
import AddShoppingItemModal from './AddShoppingItemModal';
import AddCarModal from './AddCarModal';
import Notification from './Notification';
import MobileNavigation from './MobileNavigation';
import './EventDashboard.css';

interface EventDashboardProps {
  event: Event;
  participant: Participant;
  costs?: CostSummary;
  onEventUpdate: () => void;
}

const EventDashboard: React.FC<EventDashboardProps> = ({ 
  event, 
  participant, 
  costs,
  onEventUpdate
}) => {
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [isAddShoppingModalOpen, setIsAddShoppingModalOpen] = useState(false);
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMobileView, setCurrentMobileView] = useState<'info' | 'meals' | 'shopping' | 'transport' | 'costs'>('info');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  // Gestion des mises à jour en temps réel
  const handleRealtimeUpdate = useCallback((update: EventUpdate) => {
    const updateMessages = {
      participant_joined: `${update.data.name} a rejoint l'événement`,
      meal_added: `Nouveau repas ajouté: ${update.data.name}`,
      shopping_item_added: `Article ajouté: ${update.data.name}`,
      car_added: `Voiture ajoutée: ${update.data.driver_name}`,
      shopping_item_updated: `Article mis à jour: ${update.data.name}`,
    };

    const message = updateMessages[update.type as keyof typeof updateMessages] || 'Mise à jour reçue';
    
    setNotification({
      message,
      type: 'info',
      isVisible: true
    });

    // Actualiser les données
    onEventUpdate();
  }, [onEventUpdate]);

  // S'abonner aux mises à jour en temps réel
  React.useEffect(() => {
    const unsubscribe = realtimeService.subscribeToEvent(event.id, handleRealtimeUpdate);
    return unsubscribe;
  }, [event.id, handleRealtimeUpdate]);

  // Fonction pour rendre les sections selon la vue mobile
  const renderSection = (sectionType: string, content: React.ReactNode) => {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    if (isMobile && currentMobileView !== sectionType) {
      return null;
    }
    
    return content;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalShopping = event.shopping_items.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );
  const totalFuel = event.cars.reduce((sum, car) => sum + car.fuel_cost, 0);
  const costPerPerson = event.participants.length > 0 
    ? (totalShopping + totalFuel) / event.participants.length 
    : 0;

  const handleAddMeal = async (mealData: MealCreate) => {
    setIsLoading(true);
    try {
      await apiService.createMeal(mealData);
      onEventUpdate();
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddShoppingItem = async (itemData: ShoppingItemCreate) => {
    setIsLoading(true);
    try {
      await apiService.createShoppingItem(itemData);
      onEventUpdate();
    } catch (error) {
      console.error('Error adding shopping item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsBought = async (itemId: number) => {
    setIsLoading(true);
    try {
      await apiService.markItemAsBought(itemId, participant.name);
      onEventUpdate();
    } catch (error) {
      console.error('Error marking item as bought:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCar = async (carData: CarCreate) => {
    setIsLoading(true);
    try {
      await apiService.createCar(carData);
      onEventUpdate();
    } catch (error) {
      console.error('Error adding car:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Navigation mobile */}
      <MobileNavigation 
        currentView={currentMobileView}
        onViewChange={setCurrentMobileView}
        eventName={event.name}
      />
      
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="event-title">{event.name}</h1>
          <p className="welcome-text">Bienvenue, {participant.name}! 👋</p>
          {event.start_date && event.end_date && (
            <p className="event-dates">
              📅 Du {formatDate(event.start_date)} au {formatDate(event.end_date)}
            </p>
          )}
        </div>
      </header>

      <main className="dashboard-content">
        {/* Informations sur l'événement */}
        {renderSection('info', (
          <section className="dashboard-section">
            <h2 className="section-title">📍 Informations sur le chalet</h2>
            <div className="info-grid">
              {event.location && (
                <div className="info-item">
                  <span className="info-icon">🏠</span>
                  <span className="info-text">{event.location}</span>
                </div>
              )}
              {event.chalet_link && (
                <div className="info-item">
                  <span className="info-icon">🔗</span>
                  <a 
                    href={event.chalet_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="info-link"
                  >
                    Lien du chalet
                  </a>
                </div>
              )}
              {event.description && (
                <div className="info-item description">
                  <span className="info-icon">📝</span>
                  <span className="info-text">{event.description}</span>
                </div>
              )}
            </div>
          </section>
        ))}

        {/* Participants */}
        {renderSection('info', (
          <section className="dashboard-section">
            <h2 className="section-title">
              👥 Participants ({event.participants.length})
            </h2>
            <div className="participants-grid">
              {event.participants.map((p) => {
                const car = event.cars.find(c => c.id === p.car_id);
                return (
                  <div key={p.id} className="participant-card">
                    <span className="participant-name">{p.name}</span>
                    <span className="participant-transport">
                      {car ? `🚗 ${car.license_plate}` : '🚶 Pas de voiture'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Repas */}
        {renderSection('meals', (
          <section className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">🍽️ Planning des repas</h2>
              <button 
                className="add-button"
                onClick={() => setIsAddMealModalOpen(true)}
                disabled={isLoading}
              >
                ➕ Ajouter un repas
              </button>
            </div>
            <div className="meals-list">
              {event.meals.length > 0 ? (
                event.meals.map((meal) => (
                  <div key={meal.id} className="meal-card">
                    <div className="meal-header">
                      <span className="meal-type">
                        {meal.meal_type === 'breakfast' && '🥐'}
                        {meal.meal_type === 'lunch' && '🥙'}
                        {meal.meal_type === 'dinner' && '🍽️'}
                        {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                      </span>
                      <span className="meal-date">{formatDateTime(meal.date)}</span>
                    </div>
                    {meal.description && (
                      <p className="meal-description">{meal.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-state">Aucun repas planifié pour le moment</p>
              )}
            </div>
          </section>
        ))}

        {/* Liste de courses */}
        {renderSection('shopping', (
          <section className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">🛒 Liste de courses</h2>
              <button 
                className="add-button"
                onClick={() => setIsAddShoppingModalOpen(true)}
                disabled={isLoading}
              >
                ➕ Ajouter un article
              </button>
            </div>
            <div className="shopping-list">
              {event.shopping_items.length > 0 ? (
                event.shopping_items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`shopping-item ${item.is_bought ? 'bought' : ''}`}
                  >
                    <div className="item-info">
                      <button
                        className="item-checkbox"
                        onClick={() => !item.is_bought && handleMarkAsBought(item.id)}
                        disabled={item.is_bought || isLoading}
                      >
                        {item.is_bought ? '✅' : '⬜'}
                      </button>
                      <span className="item-name">{item.name}</span>
                      <span className="item-category">({item.category})</span>
                    </div>
                    <div className="item-details">
                      <span className="item-price">
                        {item.price.toFixed(2)}€ × {item.quantity}
                      </span>
                      {item.bought_by && (
                        <span className="bought-by">par {item.bought_by}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">Aucun article dans la liste de courses</p>
              )}
            </div>
          </section>
        ))}

        {/* Transport */}
        {renderSection('transport', (
          <section className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">🚗 Organisation du transport</h2>
              <button 
                className="add-button"
                onClick={() => setIsAddCarModalOpen(true)}
                disabled={isLoading}
              >
                ➕ Ajouter une voiture
              </button>
            </div>
            <div className="cars-list">
              {event.cars.length > 0 ? (
                event.cars.map((car) => {
                  const passengers = event.participants.filter(p => p.car_id === car.id);
                  return (
                    <div key={car.id} className="car-card">
                      <div className="car-header">
                        <h3 className="car-title">
                          🚗 {car.license_plate} - {car.driver_name}
                        </h3>
                        <span className="car-capacity">
                          {passengers.length}/{car.max_passengers} places
                        </span>
                      </div>
                      <div className="car-details">
                        <span className="fuel-cost">⛽ {car.fuel_cost.toFixed(2)}€</span>
                        {passengers.length > 0 && (
                          <div className="passengers">
                            <span className="passengers-label">Passagers:</span>
                            <span className="passengers-list">
                              {passengers.map(p => p.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="empty-state">Aucune voiture enregistrée</p>
              )}
            </div>
          </section>
        ))}

        {/* Résumé des coûts */}
        {renderSection('costs', (
          <section className="dashboard-section costs-section">
            <h2 className="section-title">💰 Résumé des coûts</h2>
            <div className="costs-grid">
              <div className="cost-item">
                <span className="cost-icon">🛒</span>
                <span className="cost-label">Courses</span>
                <span className="cost-value">{totalShopping.toFixed(2)}€</span>
              </div>
              <div className="cost-item">
                <span className="cost-icon">⛽</span>
                <span className="cost-label">Essence</span>
                <span className="cost-value">{totalFuel.toFixed(2)}€</span>
              </div>
              <div className="cost-item total">
                <span className="cost-icon">💳</span>
                <span className="cost-label">Par personne</span>
                <span className="cost-value">{costPerPerson.toFixed(2)}€</span>
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* Modales */}
      <AddMealModal
        isOpen={isAddMealModalOpen}
        onClose={() => setIsAddMealModalOpen(false)}
        onAddMeal={handleAddMeal}
        eventId={event.id}
      />

      <AddShoppingItemModal
        isOpen={isAddShoppingModalOpen}
        onClose={() => setIsAddShoppingModalOpen(false)}
        onAddItem={handleAddShoppingItem}
        eventId={event.id}
      />

      <AddCarModal
        isOpen={isAddCarModalOpen}
        onClose={() => setIsAddCarModalOpen(false)}
        onAddCar={handleAddCar}
        eventId={event.id}
      />

      {/* Notification */}
      <Notification 
        message={notification.message} 
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default EventDashboard;
