import React, { useState } from 'react';

export default function MerchantSearch({ merchants, onSelectMerchant, selectedMerchantId, onContinue, onScanClick }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMerchants = merchants.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="screen-container">
      <div className="landing-hero animate-fade-in">
        <span className="badge-trust">🛡️ Trust Layer for Rewards</span>
        <h1 className="hero-title">Know Your Rewards Before You Pay</h1>
        <p className="hero-subtitle">Compare payment rewards with confidence, backed by verified T&amp;C data.</p>
        {onScanClick && (
          <button className="btn-scan-qr" onClick={onScanClick}>
            📷 Scan a payment QR
          </button>
        )}
      </div>

      <hr className="divider" />

      <div className="section-container animate-slide-up">
        <h2 className="section-title">Where are you paying today?</h2>
        <p className="section-subtitle">Find the most rewarding payment option.</p>

        <div className="search-bar-container">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search for a merchant..."
            aria-label="Search for a merchant"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" aria-label="Clear search" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="merchant-header-row">
          <span className="section-label">POPULAR MERCHANTS</span>
          <span className="view-all-btn">View All</span>
        </div>

        <div className="merchants-grid" role="group" aria-label="Merchants">
          {filteredMerchants.length > 0 ? (
            filteredMerchants.map((merchant) => {
              const isSelected = selectedMerchantId === merchant.id;
              return (
                <button
                  type="button"
                  key={merchant.id}
                  className={`merchant-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectMerchant(merchant)}
                  aria-pressed={isSelected}
                  style={{ '--accent-color': merchant.accentColor }}
                >
                  {merchant.logo ? (
                    <img src={merchant.logo} alt="" className="merchant-logo-img" />
                  ) : (
                    <span className="merchant-icon" aria-hidden="true">{merchant.icon}</span>
                  )}
                  <span className="merchant-name">{merchant.name}</span>
                  <span className="merchant-category">{merchant.category}</span>
                  {isSelected && <span className="selected-check" aria-hidden="true">✓</span>}
                </button>
              );
            })
          ) : (
            <div className="no-results">No merchants found matching &ldquo;{searchQuery}&rdquo;</div>
          )}
        </div>

        <div className="action-button-container">
          <button
            className={`btn-primary ${!selectedMerchantId ? 'disabled' : ''}`}
            disabled={!selectedMerchantId}
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
