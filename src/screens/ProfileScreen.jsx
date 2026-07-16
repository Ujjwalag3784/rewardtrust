import React from 'react';

export default function ProfileScreen({ isPrime, onTogglePrime, onReset }) {
  return (
    <div className="screen-container animate-fade-in">
      <div className="results-header-bar justify-center">
        <h2 className="header-title">User Settings</h2>
      </div>
      <div className="section-container padding-20 profile-settings">
        <div className="profile-hero">
          <div className="profile-avatar" aria-hidden="true">🛡️</div>
          <h3 className="profile-name">Fintech Operator</h3>
          <p className="profile-email">operator@rewardtrust.com</p>
        </div>

        <div className="settings-card">
          <h4 className="settings-card-title">MEMBERSHIP CRITERIA</h4>
          <div className="setting-toggle-row">
            <div>
              <div className="setting-label" id="prime-label">Amazon Prime Membership</div>
              <div className="setting-desc">Enables 5% cashback rate on the Amazon Pay ICICI card.</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                aria-labelledby="prime-label"
                checked={isPrime}
                onChange={(e) => onTogglePrime(e.target.checked)}
              />
              <span className="toggle-slider" aria-hidden="true"></span>
            </label>
          </div>
        </div>

        <div className="settings-card margin-top-20">
          <h4 className="settings-card-title">UTILITIES</h4>
          <button className="btn-secondary" onClick={onReset}>
            Reset Selection Flow
          </button>
        </div>
      </div>
    </div>
  );
}
