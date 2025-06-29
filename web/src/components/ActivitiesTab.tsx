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

  // Trier les activités par date (plus anciennes en premier, sans date à la fin)
  const sortedActivities = [...activities].sort((a, b) => {
    // Si une activité n'a pas de date, la mettre à la fin
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    
    // Comparer les dates
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

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
          {sortedActivities.length > 0 ? (
            sortedActivities.map((activity) => (
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
