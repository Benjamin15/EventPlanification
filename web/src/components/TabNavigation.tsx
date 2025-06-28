import React from 'react';
import './TabNavigation.css';

export type TabId = 'info' | 'participants' | 'activities' | 'shopping' | 'transport' | 'costs';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  shortLabel?: string;
}

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  eventName?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  eventName
}) => {
  const tabs: Tab[] = [
    {
      id: 'info',
      label: 'Informations',
      icon: '🏠',
      shortLabel: 'Info'
    },
    {
      id: 'participants',
      label: 'Participants',
      icon: '👥',
      shortLabel: 'Équipe'
    },
    {
      id: 'activities',
      label: 'Activités',
      icon: '🎯',
      shortLabel: 'Planning'
    },
    {
      id: 'shopping',
      label: 'Courses',
      icon: '🛒',
      shortLabel: 'Liste'
    },
    {
      id: 'transport',
      label: 'Transport',
      icon: '🚗',
      shortLabel: 'Voitures'
    },
    {
      id: 'costs',
      label: 'Coûts',
      icon: '💰',
      shortLabel: 'Budget'
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <>
      {/* Header mobile avec titre de l'onglet actuel */}
      <div className="tab-header">
        <div className="tab-header-content">
          <div className="tab-current-info">
            <span className="tab-current-icon">{currentTab?.icon}</span>
            <div className="tab-current-text">
              <h1 className="tab-current-title">{currentTab?.label}</h1>
              {eventName && (
                <p className="tab-event-name">{eventName}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets - Mode horizontal sur mobile */}
      <nav className="tab-navigation">
        <div className="tab-nav-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.shortLabel || tab.label}</span>
              {activeTab === tab.id && <div className="tab-indicator" />}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default TabNavigation;
