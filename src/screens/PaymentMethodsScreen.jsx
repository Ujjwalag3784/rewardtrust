import React from 'react';

export default function PaymentMethodsScreen({ methods, selectedCardIds, onToggle, onContinue, onBack }) {
  return (
    <div className="screen-container animate-fade-in">
      <div className="results-header-bar">
        <button className="back-btn" aria-label="Back to amount" onClick={onBack}>←</button>
        <h2 className="header-title">Payment Methods</h2>
        <span className="bell-icon" aria-hidden="true">🔔</span>
      </div>

      <div className="section-container select-methods-section animate-slide-up">
        <h2 className="section-title">Which cards do you own?</h2>
        <p className="section-subtitle">Select your active accounts to compare. Multi-selection enabled.</p>

        <div className="methods-select-list" role="group" aria-label="Your payment methods">
          {methods.map((method) => {
            const isSelected = selectedCardIds.includes(method.id);
            return (
              <button
                type="button"
                key={method.id}
                className={`method-select-card ${isSelected ? 'active' : ''}`}
                onClick={() => onToggle(method.id)}
                aria-pressed={isSelected}
                style={{ '--border-color': method.borderColor }}
              >
                <span className="method-badge-icon" style={{ background: method.bgGradient, borderColor: method.borderColor }}>
                  {method.badge}
                </span>
                <span className="method-details-col">
                  <span className="method-select-name">{method.name}</span>
                  <span className="method-select-type">{method.type}</span>
                </span>
                <span className="checkbox-outer">
                  {isSelected && <span className="checkbox-inner" aria-hidden="true">✓</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="action-button-container">
          <button
            className={`btn-primary ${selectedCardIds.length === 0 ? 'disabled' : ''}`}
            disabled={selectedCardIds.length === 0}
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
