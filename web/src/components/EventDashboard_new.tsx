import React, { useState, useCallback } from 'react';
import { Event, Participant, CostSummary, ActivityCreate, ShoppingItemCreate, ShoppingItemUpdate, CarCreate, CarUpdate, Car } from '../types';
import { apiService } from '../services/api';
import { realtimeService, EventUpdate } from '../services/realtime';
import TabNavigation, { TabId } from './TabNavigation';
import EventInfoTab from './EventInfoTab';
import ParticipantsTab from './ParticipantsTab';
import ActivitiesTab from './ActivitiesTab';
import ShoppingTab from './ShoppingTab';
import TransportTab from './TransportTab';
import CostsTab from './CostsTab';
import FinancialBalanceTab from './FinancialBalanceTab';
import AddActivityModal from './AddActivityModal';
import AddShoppingItemModal from './AddShoppingItemModal';
import AddCarModal from './AddCarModal';
import AssignCarModal from './AssignCarModal';
import UpdateCarModal from './UpdateCarModal';
import Notification from './Notification';
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
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isAddShoppingModalOpen, setIsAddShoppingModalOpen] = useState(false);
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [isAssignCarModalOpen, setIsAssignCarModalOpen] = useState(false);
  const [isUpdateCarModalOpen, setIsUpdateCarModalOpen] = useState(false);
  const [selectedCarForUpdate, setSelectedCarForUpdate] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabId>('info');
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
      activity_added: `Nouvelle activité ajoutée: ${update.data.name}`,
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

  // Fonction pour rendre le contenu de l'onglet actuel
  const renderTabContent = () => {
    switch (currentTab) {
      case 'info':
        return <EventInfoTab event={event} onEventUpdate={onEventUpdate} />;
      
      case 'participants':
        return <ParticipantsTab 
          participants={event.participants || []} 
          cars={event.cars || []} 
        />;
      
      case 'activities':
        return (
          <ActivitiesTab 
            activities={event.activities || []}
            onAddActivity={() => setIsAddActivityModalOpen(true)}
            isLoading={isLoading}
          />
        );
      
      case 'shopping':
        return (
          <ShoppingTab 
            shoppingItems={event.shopping_items || []}
            participants={event.participants || []}
            participant={participant}
            onAddItem={() => setIsAddShoppingModalOpen(true)}
            onMarkAsBought={handleMarkAsBought}
            onUnmarkAsBought={handleUnmarkAsBought}
            onUpdateItem={handleUpdateShoppingItem}
            onAssignItem={handleAssignShoppingItem}
            isLoading={isLoading}
          />
        );
      
      case 'transport':
        return (
          <TransportTab 
            cars={event.cars || []}
            participants={event.participants || []}
            onAddCar={() => setIsAddCarModalOpen(true)}
            onAssignCar={() => setIsAssignCarModalOpen(true)}
            onUpdateCar={handleOpenUpdateCarModal}
            isLoading={isLoading}
          />
        );
      
      case 'costs':
        return (
          <FinancialBalanceTab 
            eventId={event.id}
            participants={event.participants || []}
          />
        );
      
      default:
        return <EventInfoTab event={event} />;
    }
  };

  // Gestionnaires d'événements
  const handleAddActivity = async (activityData: ActivityCreate) => {
    setIsLoading(true);
    try {
      await apiService.createActivity(activityData);
      onEventUpdate();
    } catch (error) {
      console.error('Error adding activity:', error);
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

  const handleUnmarkAsBought = async (itemId: number) => {
    setIsLoading(true);
    try {
      await apiService.unmarkItemAsBought(itemId);
      onEventUpdate();
      setNotification({
        message: 'Article déselectionné avec succès',
        type: 'info',
        isVisible: true
      });
    } catch (error) {
      console.error('Error unmarking item as bought:', error);
      setNotification({
        message: 'Erreur lors de la déselection de l\'article',
        type: 'error',
        isVisible: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateShoppingItem = async (itemId: number, updates: ShoppingItemUpdate) => {
    setIsLoading(true);
    try {
      await apiService.updateShoppingItem(itemId, updates);
      onEventUpdate();
      setNotification({
        message: 'Article mis à jour avec succès',
        type: 'success',
        isVisible: true
      });
    } catch (error) {
      console.error('Error updating shopping item:', error);
      setNotification({
        message: 'Erreur lors de la mise à jour de l\'article',
        type: 'error',
        isVisible: true
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignShoppingItem = async (itemId: number, assignedTo: string) => {
    setIsLoading(true);
    try {
      await apiService.assignShoppingItem(itemId, assignedTo);
      onEventUpdate();
      setNotification({
        message: `Article assigné à ${assignedTo}`,
        type: 'success',
        isVisible: true
      });
    } catch (error) {
      console.error('Error assigning shopping item:', error);
      setNotification({
        message: 'Erreur lors de l\'assignation de l\'article',
        type: 'error',
        isVisible: true
      });
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

  const handleAssignToCar = async (participantId: number, carId: number) => {
    setIsLoading(true);
    try {
      await apiService.assignCarToParticipant(participantId, carId);
      onEventUpdate();
      setNotification({
        message: 'Participant assigné à la voiture avec succès',
        type: 'success',
        isVisible: true
      });
    } catch (error) {
      console.error('Error assigning participant to car:', error);
      setNotification({
        message: 'Erreur lors de l\'assignation à la voiture',
        type: 'error',
        isVisible: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCar = async (participantId: number) => {
    setIsLoading(true);
    try {
      await apiService.assignCarToParticipant(participantId, 0);
      onEventUpdate();
      setNotification({
        message: 'Participant retiré de la voiture',
        type: 'info',
        isVisible: true
      });
    } catch (error) {
      console.error('Error removing participant from car:', error);
      setNotification({
        message: 'Erreur lors du retrait de la voiture',
        type: 'error',
        isVisible: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCar = async (carId: number, carUpdate: CarUpdate) => {
    setIsLoading(true);
    try {
      await apiService.updateCar(carId, carUpdate);
      onEventUpdate();
      setNotification({
        message: 'Voiture mise à jour avec succès',
        type: 'success',
        isVisible: true
      });
      setIsUpdateCarModalOpen(false);
      setSelectedCarForUpdate(null);
    } catch (error) {
      console.error('Error updating car:', error);
      setNotification({
        message: 'Erreur lors de la mise à jour de la voiture',
        type: 'error',
        isVisible: true
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenUpdateCarModal = (car: Car) => {
    setSelectedCarForUpdate(car);
    setIsUpdateCarModalOpen(true);
  };

  return (
    <div className="dashboard">
      {/* Navigation par onglets */}
      <TabNavigation 
        activeTab={currentTab}
        onTabChange={setCurrentTab}
        eventName={event.name}
      />
      
      {/* Contenu de l'onglet actuel */}
      <main className="dashboard-content">
        {renderTabContent()}
      </main>

      {/* Modales */}
      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        onAddActivity={handleAddActivity}
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
        participants={event.participants || []}
      />

      <AssignCarModal
        isOpen={isAssignCarModalOpen}
        onClose={() => setIsAssignCarModalOpen(false)}
        cars={event.cars || []}
        participants={event.participants || []}
        onAssignToCar={handleAssignToCar}
        onRemoveFromCar={handleRemoveFromCar}
      />

      <UpdateCarModal
        isOpen={isUpdateCarModalOpen}
        onClose={() => {
          setIsUpdateCarModalOpen(false);
          setSelectedCarForUpdate(null);
        }}
        onUpdateCar={handleUpdateCar}
        car={selectedCarForUpdate}
        participants={event.participants || []}
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
