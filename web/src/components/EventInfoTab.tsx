import React from 'react';
import { Event } from '../types';

interface EventInfoTabProps {
  event: Event;
}

const EventInfoTab: React.FC<EventInfoTabProps> = ({ event }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="tab-content">
      <section className="dashboard-section">
        <h2 className="section-title">📍 Informations sur le chalet</h2>
        <div className="info-grid">
          {event.location && (
            <div className="info-item">
              <span className="info-icon">🏠</span>
              <span className="info-text">{event.location}</span>
            </div>
          )}
          
          {event.start_date && event.end_date && (
            <div className="info-item">
              <span className="info-icon">📅</span>
              <span className="info-text">
                Du {formatDate(event.start_date)} au {formatDate(event.end_date)}
              </span>
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
                Voir le chalet
              </a>
            </div>
          )}
          
          {event.description && (
            <div className="info-item full-width">
              <span className="info-icon">📝</span>
              <span className="info-text">{event.description}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventInfoTab;
