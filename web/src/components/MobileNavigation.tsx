import React, { useState } from 'react';
import './MobileNavigation.css';

interface MobileNavigationProps {
  currentView: 'info' | 'meals' | 'shopping' | 'transport' | 'costs';
  onViewChange: (view: 'info' | 'meals' | 'shopping' | 'transport' | 'costs') => void;
  eventName: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onViewChange,
  eventName
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'info', label: 'Infos', icon: '📍' },
    { id: 'meals', label: 'Repas', icon: '🍽️' },
    { id: 'shopping', label: 'Courses', icon: '🛒' },
    { id: 'transport', label: 'Transport', icon: '🚗' },
    { id: 'costs', label: 'Coûts', icon: '💰' }
  ] as const;

  const currentItem = navigationItems.find(item => item.id === currentView);

  return (
    <>
      {/* Header mobile */}
      <div className="mobile-header">
        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
        <h1 className="mobile-title">
          {currentItem?.icon} {currentItem?.label}
        </h1>
        <div className="header-spacer"></div>
      </div>

      {/* Navigation mobile */}
      <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <h2 className="event-name">{eventName}</h2>
          <button 
            className="close-menu"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Fermer le menu"
          >
            ×
          </button>
        </div>
        
        <nav className="mobile-nav-items">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => {
                onViewChange(item.id);
                setIsMenuOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-nav-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Bottom navigation (pour tablettes) */}
      <div className="bottom-nav">
        {navigationItems.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default MobileNavigation;
