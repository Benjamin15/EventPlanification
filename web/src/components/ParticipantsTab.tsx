import React from 'react';
import { Participant } from '../types';

interface ParticipantsTabProps {
  participants: Participant[];
}

const ParticipantsTab: React.FC<ParticipantsTabProps> = ({ participants }) => {
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="tab-content">
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">👥 Participants ({participants.length})</h2>
        </div>
        
        <div className="participants-list">
          {participants.map((participant) => (
            <div key={participant.id} className="participant-card">
              <div className="participant-info">
                <span className="participant-name">{participant.name}</span>
                <span className="participant-join-date">
                  Rejoint le {formatJoinDate(participant.joined_at)}
                </span>
              </div>
              <div className="participant-status">
                <span className="participant-car">
                  {participant.car_id ? (
                    '🚗 En voiture'
                  ) : (
                    '🚶 Pas de voiture'
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ParticipantsTab;
