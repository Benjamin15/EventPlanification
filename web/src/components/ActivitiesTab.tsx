import React from 'react';
import { Activity } from '../types';

interface ActivitiesTabProps {
  activities: Activity[];
  onAddActivity: () => void;
  isLoading?: boolean;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ 
  activities, 
  onAddActivity, 
  isLoading = false 
}) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="tab-content">
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">🎯 Planning des activités</h2>
          <button 
            className="add-button"
            onClick={onAddActivity}
            disabled={isLoading}
          >
            ➕ Ajouter une activité
          </button>
        </div>
        
        <div className="activities-list">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-header">
                  <span className="activity-type">
                    {activity.activity_type === 'meal' && '🍽️'}
                    {activity.activity_type === 'sport' && '⛷️'}
                    {activity.activity_type === 'leisure' && '🎮'}
                    {activity.activity_type === 'tourism' && '🏔️'}
                    {activity.activity_type === 'other' && '📝'}
                    {activity.name}
                  </span>
                  {activity.date && (
                    <span className="activity-date">{formatDateTime(activity.date)}</span>
                  )}
                </div>
                {activity.description && (
                  <p className="activity-description">{activity.description}</p>
                )}
                {activity.location && (
                  <p className="activity-location">📍 {activity.location}</p>
                )}
                {activity.max_participants && (
                  <p className="activity-participants">👥 Max {activity.max_participants} participants</p>
                )}
              </div>
            ))
          ) : (
            <p className="empty-state">Aucune activité planifiée pour le moment</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ActivitiesTab;
