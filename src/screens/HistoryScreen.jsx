import React from 'react';
import formatCurrency from '../utils/formatCurrency';
import { OUTCOME_LABEL } from '../utils/labels';

export default function HistoryScreen({ records, onSetOutcome }) {
  return (
    <div className="screen-container animate-fade-in">
      <div className="results-header-bar justify-center">
        <h2 className="header-title">Reward Audit History</h2>
      </div>
      <div className="section-container padding-20">
        <p className="section-subtitle">
          Predictions you tracked. Tell us what actually posted — your feedback is what turns the confidence score into real evidence.
        </p>

        {records.length === 0 ? (
          <div className="history-empty">
            <span className="history-empty-icon" aria-hidden="true">🧾</span>
            <p>No tracked rewards yet. Run a lookup and tap &ldquo;Track this reward&rdquo; to start your audit trail.</p>
          </div>
        ) : (
          <ul className="history-list" aria-label="Tracked reward predictions">
            {records.map((rec) => (
              <li key={rec.id} className={`history-item outcome-${rec.outcome}`}>
                <div className="history-item-top">
                  <span className="hist-merc">{rec.merchantName}</span>
                  <span className="hist-amt">{formatCurrency(rec.amount)}</span>
                </div>
                <div className="history-item-bottom">
                  <span>
                    Predicted <strong>{rec.predictedVerdict}</strong> · {formatCurrency(rec.predictedReward)} via {rec.cardName}
                    {rec.mcc ? ` · MCC ${rec.mcc}` : ''}
                  </span>
                  <span className={`hist-outcome-badge ${rec.outcome}`}>{OUTCOME_LABEL[rec.outcome]}</span>
                </div>

                {rec.outcome === 'pending' ? (
                  <div className="hist-actions">
                    <button className="hist-action received" onClick={() => onSetOutcome(rec.id, 'received')}>✓ Reward posted</button>
                    <button className="hist-action partial" onClick={() => onSetOutcome(rec.id, 'partial')}>◐ Partial</button>
                    <button className="hist-action not_received" onClick={() => onSetOutcome(rec.id, 'not_received')}>✕ Not received</button>
                  </div>
                ) : (
                  <div className="hist-resolved">
                    <span>Outcome logged: <strong>{OUTCOME_LABEL[rec.outcome]}</strong></span>
                    <button className="hist-reset-link" onClick={() => onSetOutcome(rec.id, 'pending')}>reset</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
