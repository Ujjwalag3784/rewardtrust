import React from 'react';

export default function AmountInput({ merchant, amount, onChangeAmount, onContinue, onBack }) {
  const handlePreset = (val) => {
    const currentVal = parseFloat(amount) || 0;
    onChangeAmount(currentVal + val);
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    onChangeAmount(val === '' ? '' : parseInt(val, 10));
  };

  return (
    <div className="screen-container animate-fade-in">
      {/* Merchant Header Status */}
      {merchant && (
        <div className="merchant-status-bar">
          <button className="back-btn" onClick={onBack}>←</button>
          <div className="merchant-status-info">
            {merchant.logo ? (
              <img src={merchant.logo} alt={merchant.name} className="merchant-status-logo" />
            ) : (
              <span className="merchant-status-icon">{merchant.icon}</span>
            )}
            <div>
              <div className="status-label">PURCHASING FROM</div>
              <div className="status-value">{merchant.fullName}</div>
            </div>
          </div>
          <span className="secure-badge">🛡️ SECURE</span>
        </div>
      )}

      <div className="section-container text-center spend-section">
        <h2 className="section-title">How much are you spending?</h2>
        <p className="section-subtitle">Enter amount to find the best card rewards.</p>

        {/* Input Box Card */}
        <div className="amount-input-card">
          <div className="currency-symbol">₹</div>
          <input
            type="text"
            pattern="[0-9]*"
            className="amount-input-field"
            value={amount}
            onChange={handleInputChange}
            placeholder="450"
          />

          {/* Quick presets */}
          <div className="presets-row">
            <button className="btn-preset" onClick={() => handlePreset(500)}>+ ₹500</button>
            <button className="btn-preset" onClick={() => handlePreset(1000)}>+ ₹1,000</button>
            <button className="btn-preset" onClick={() => handlePreset(5000)}>+ ₹5,000</button>
          </div>
        </div>

        {/* Continue Button */}
        <div className="action-button-container">
          <button
            className={`btn-primary ${!amount || amount <= 0 ? 'disabled' : ''}`}
            disabled={!amount || amount <= 0}
            onClick={onContinue}
          >
            Show Best Rewards &nbsp; →
          </button>
        </div>
      </div>
    </div>
  );
}
