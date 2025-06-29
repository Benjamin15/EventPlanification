import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { apiService } from '../services/api';

interface FinancialBalanceTabProps {
  eventId: number;
  participants: Participant[];
}

interface ParticipantBalance {
  [participantName: string]: number;
}

interface Transfer {
  from: string;
  to: string;
  amount: number;
}

interface FinancialBalance {
  total_cost: number;
  participant_balance: ParticipantBalance;
  recommended_transfers: Transfer[];
  summary: {
    total_shopping: number;
    total_transport: number;
    per_person_target: number;
  };
}

const FinancialBalanceTab: React.FC<FinancialBalanceTabProps> = ({ 
  eventId, 
  participants 
}) => {
  const [balance, setBalance] = useState<FinancialBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const balanceData = await apiService.getFinancialBalance(eventId);
      setBalance(balanceData);
    } catch (err) {
      console.error('Error fetching financial balance:', err);
      setError('Erreur lors du calcul de l\'équilibre financier');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="tab-content">
        <div className="dashboard-section">
          <h2 className="section-title">💰 Équilibre financier</h2>
          <div className="loading-state">Calcul de l'équilibre...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-content">
        <div className="dashboard-section">
          <h2 className="section-title">💰 Équilibre financier</h2>
          <div className="error-state">
            ⚠️ {error}
            <button onClick={fetchBalance} className="retry-button">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="tab-content">
        <div className="dashboard-section">
          <h2 className="section-title">💰 Équilibre financier</h2>
          <div className="empty-state">Aucune donnée disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="dashboard-section">
        <h2 className="section-title">💰 Équilibre financier</h2>
        
        {/* Résumé général */}
        <div className="balance-overview">
          <div className="balance-cards">
            <div className="balance-card primary">
              <div className="balance-icon">💳</div>
              <div className="balance-content">
                <div className="balance-amount">{balance.summary.per_person_target.toFixed(2)}€</div>
                <div className="balance-label">Contribution par personne</div>
              </div>
            </div>
            
            <div className="balance-card">
              <div className="balance-icon">🛒</div>
              <div className="balance-content">
                <div className="balance-amount">{balance.summary.total_shopping.toFixed(2)}€</div>
                <div className="balance-label">Total courses</div>
              </div>
            </div>
            
            <div className="balance-card">
              <div className="balance-icon">🚗</div>
              <div className="balance-content">
                <div className="balance-amount">{balance.summary.total_transport.toFixed(2)}€</div>
                <div className="balance-label">Transport</div>
              </div>
            </div>
            
            <div className="balance-card">
              <div className="balance-icon">💰</div>
              <div className="balance-content">
                <div className="balance-amount">{balance.total_cost.toFixed(2)}€</div>
                <div className="balance-label">Total général</div>
              </div>
            </div>
          </div>
        </div>

        {/* Balance par participant */}
        <div className="participant-balances">
          <h3 className="subsection-title">📊 Situation actuelle</h3>
          <div className="balance-list">
            {participants.map(participant => {
              const participantBalance = balance.participant_balance[participant.name] || 0;
              const isCreditor = participantBalance > 0.01;
              const isDebtor = participantBalance < -0.01;
              const isBalanced = Math.abs(participantBalance) <= 0.01;
              
              return (
                <div 
                  key={participant.id} 
                  className={`balance-item ${isCreditor ? 'creditor' : isDebtor ? 'debtor' : 'balanced'}`}
                >
                  <div className="participant-info">
                    <span className="participant-name">{participant.name}</span>
                    <span className="balance-status">
                      {isCreditor && '💚 À recevoir'}
                      {isDebtor && '🔴 À payer'}
                      {isBalanced && '✅ Équilibré'}
                    </span>
                  </div>
                  <div className="balance-amount">
                    <span className={`amount ${isCreditor ? 'positive' : isDebtor ? 'negative' : 'neutral'}`}>
                      {Math.abs(participantBalance).toFixed(2)}€
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transferts recommandés */}
        {balance.recommended_transfers.length > 0 && (
          <div className="recommended-transfers">
            <h3 className="subsection-title">🔄 Transferts recommandés</h3>
            <div className="transfers-list">
              {balance.recommended_transfers.map((transfer, index) => (
                <div key={index} className="transfer-item">
                  <div className="transfer-flow">
                    <span className="transfer-from">{transfer.from}</span>
                    <div className="transfer-arrow">
                      <span className="arrow">→</span>
                      <span className="transfer-amount">{transfer.amount.toFixed(2)}€</span>
                    </div>
                    <span className="transfer-to">{transfer.to}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="transfers-note">
              <p>💡 <strong>Comment procéder :</strong> Effectuez ces transferts pour équilibrer tous les comptes. Après ces transferts, personne ne devra plus d'argent à personne.</p>
            </div>
          </div>
        )}

        {balance.recommended_transfers.length === 0 && (
          <div className="balanced-state">
            <div className="balanced-card">
              <div className="balanced-icon">🎉</div>
              <h3>Comptes équilibrés !</h3>
              <p>Tous les participants sont à jour. Aucun transfert n'est nécessaire.</p>
            </div>
          </div>
        )}

        {/* Bouton actualiser */}
        <div className="balance-actions">
          <button 
            onClick={fetchBalance} 
            className="refresh-button"
            disabled={isLoading}
          >
            🔄 Actualiser l'équilibre
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialBalanceTab;
