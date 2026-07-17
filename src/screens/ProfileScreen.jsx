import React from 'react';

export default function ProfileScreen({ isPrime, onTogglePrime, onReset, phone, walletCount, onManageCards }) {
  const masked = phone ? `+91 ${phone.slice(0, 2)}xxxxx${phone.slice(-3)}` : 'Not signed in';
  return (
    <div className="screen-container animate-fade-in">
      <div className="results-header-bar justify-center">
        <h2 className="header-title">Profile</h2>
      </div>
      <div className="section-container padding-20 profile-settings">
        <div className="profile-hero">
          <div className="profile-avatar" aria-hidden="true">🛡️</div>
          <h3 className="profile-name">{masked}</h3>
          <p className="profile-email">{walletCount} card{walletCount === 1 ? '' : 's'} in your wallet</p>
        </div>

        <div className="settings-card">
          <h4 className="settings-card-title">YOUR CARDS</h4>
          <div className="setting-toggle-row">
            <div>
              <div className="setting-label">Manage wallet</div>
              <div className="setting-desc">Add or remove the cards you own.</div>
            </div>
            <button className="btn-secondary" onClick={onManageCards}>Manage →</button>
          </div>
        </div>

        <div className="settings-card margin-top-20">
          <h4 className="settings-card-title">MEMBERSHIP CRITERIA</h4>
          <div className="setting-toggle-row">
            <div>
              <div className="setting-label" id="prime-label">Amazon Prime Membership</div>
              <div className="setting-desc">Enables the 5% rate on the Amazon Pay ICICI card.</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" aria-labelledby="prime-label" checked={isPrime} onChange={(e) => onTogglePrime(e.target.checked)} />
              <span className="toggle-slider" aria-hidden="true"></span>
            </label>
          </div>
        </div>

        <div className="settings-card margin-top-20">
          <h4 className="settings-card-title">ACCOUNT</h4>
          <button className="btn-secondary" onClick={onReset}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
