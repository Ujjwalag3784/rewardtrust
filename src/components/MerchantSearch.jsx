import React, { useState } from 'react';

export default function MerchantSearch({ merchants, onSelectMerchant, selectedMerchantId, onContinue }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMerchants = merchants.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="screen-container">
      {/* Landing Hero Header */}
      <div className="landing-hero animate-fade-in">
        <span className="badge-trust">🛡️ Trust Layer for Rewards</span>
        <h1 className="hero-title">Know Your Rewards Before You Pay</h1>
        <p className="hero-subtitle">Compare payment rewards with confidence, backed by verified T&C data.</p>
      </div>

      <hr className="divider" />

      {/* Where to Pay Section */}
      <div className="section-container animate-slide-up">
        <h2 className="section-title">Where are you paying today?</h2>
        <p className="section-subtitle">Find the most rewarding payment option.</p>

        {/* Search Bar */}
        <div className="search-bar-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search for a merchant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="merchant-header-row">
          <span className="section-label">POPULAR MERCHANTS</span>
          <span className="view-all-btn">View All</span>
        </div>

        {/* Merchants Grid */}
        <div className="merchants-grid">
          {filteredMerchants.length > 0 ? (
            filteredMerchants.map((merchant) => {
              const isSelected = selectedMerchantId === merchant.id;
              return (
                <div
                  key={merchant.id}
                  className={`merchant-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectMerchant(merchant)}
                  style={{ '--accent-color': merchant.accentColor }}
                >
                  {merchant.logo ? (
                    <img src={merchant.logo} alt={merchant.name} className="merchant-logo-img" />
                  ) : (
                    <span className="merchant-icon">{merchant.icon}</span>
                  )}
                  <span className="merchant-name">{merchant.name}</span>
                  <span className="merchant-category">{merchant.category}</span>
                  {isSelected && <span className="selected-check">✓</span>}
                </div>
              );
            })
          ) : (
            <div className="no-results">No merchants found matching "{searchQuery}"</div>
          )}
        </div>

        {/* Continue Button */}
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
