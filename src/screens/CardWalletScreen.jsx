import React from 'react';

// Onboarding card picker + ongoing wallet management (same component, two modes).
export default function CardWalletScreen({ cards, selected, onToggle, onSave, onBack, mode = 'onboard' }) {
  const isManage = mode === 'manage';
  return (
    <div className="screen-container animate-fade-in">
      <div className="results-header-bar">
        {isManage ? <button className="back-btn" aria-label="Back" onClick={onBack}>←</button> : <span className="back-btn" aria-hidden="true" />}
        <h2 className="header-title">{isManage ? 'Manage Cards' : 'Add your cards'}</h2>
        <span className="bell-icon" aria-hidden="true">💳</span>
      </div>

      <div className="section-container animate-slide-up">
        <h2 className="section-title">{isManage ? 'Your wallet' : 'Which cards do you own?'}</h2>
        <p className="section-subtitle">Select every card you hold. RewardTrust checks each one on every payment.</p>

        <div className="methods-select-list" role="group" aria-label="Available cards">
          {cards.map((card) => {
            const on = selected.includes(card.id);
            return (
              <button
                type="button"
                key={card.id}
                className={`method-select-card ${on ? 'active' : ''}`}
                onClick={() => onToggle(card.id)}
                aria-pressed={on}
                style={{ '--border-color': card.borderColor }}
              >
                <span className="method-badge-icon" style={{ background: card.bgGradient, borderColor: card.borderColor }}>
                  {card.badge}
                </span>
                <span className="method-details-col">
                  <span className="method-select-name">{card.name}</span>
                  <span className="method-select-type">{card.issuer} · {card.type}</span>
                </span>
                <span className="checkbox-outer">{on && <span className="checkbox-inner" aria-hidden="true">✓</span>}</span>
              </button>
            );
          })}
        </div>

        <div className="action-button-container">
          <button className={`btn-primary ${selected.length === 0 ? 'disabled' : ''}`} disabled={selected.length === 0} onClick={onSave}>
            {isManage ? 'Save wallet' : `Create my wallet (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
