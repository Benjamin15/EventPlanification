import React from 'react';
import { Participant, Car } from '../types';

interface ParticipantsTabProps {
  participants: Participant[];
  cars: Car[];
}

const ParticipantsTab: React.FC<ParticipantsTabProps> = ({ participants, cars }) => {
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fonction pour déterminer le statut transport d'un participant
  const getTransportStatus = (participant: Participant) => {
    // Vérifier si la personne est conductrice d'une voiture (priorité sur passager)
    const drivenCar = cars.find(car => car.driver_id === participant.id);
    if (drivenCar) {
    return {
      type: 'driver',
      car: drivenCar,
      message: `🚗 ${drivenCar.license_plate}`,
      badge: '👨‍✈️ Conducteur'
    };
    }

    // Vérifier si la personne est passagère d'une voiture (mais pas conductrice)
    const passengerCar = cars.find(car => car.id === participant.car_id && car.driver_id !== participant.id);
    if (passengerCar) {
    return {
      type: 'passenger',
      car: passengerCar,
      message: `🚗 ${passengerCar.license_plate}`,
      badge: '🧑‍💼 Passager'
    };
    }

    // Aucune voiture assignée
    return {
      type: 'none',
      car: null,
      message: '🚶 Pas de voiture',
      badge: null
    };
  };

  return (
    <div className="tab-content">
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">👥 Participants ({participants.length})</h2>
        </div>
        
        <div className="participants-list">
          {participants.map((participant) => {
            const transportStatus = getTransportStatus(participant);
            
            return (
              <div key={participant.id} className="participant-card">
                <div className="participant-info">
                  <div className="participant-header">
                    <span className="participant-name">{participant.name}</span>
                    {transportStatus.badge && (
                      <span className="driver-badge">{transportStatus.badge}</span>
                    )}
                  </div>
                  <span className="participant-join-date">
                    Rejoint le {formatJoinDate(participant.joined_at)}
                  </span>
                </div>
                <div className="participant-status">
                  <span className={`transport-status ${transportStatus.type}`}>
                    {transportStatus.message}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ParticipantsTab;
