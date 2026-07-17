import React from 'react';

// Compact horizontal view of the cards in the user's wallet.
export default function WalletStrip({ cards, onManage }) {
  return (
    <div className="wallet-strip">
      <div className="wallet-strip-head">
        <span className="section-label">YOUR WALLET · {cards.length}</span>
        <button className="linkish wallet-manage" onClick={onManage}>Manage →</button>
      </div>
      <div className="wallet-chips">
        {cards.map((c) => (
          <span key={c.id} className="wallet-chip" style={{ borderColor: c.borderColor }}>
            <span className="wallet-chip-badge" style={{ background: c.bgGradient, borderColor: c.borderColor }}>{c.badge}</span>
            {c.name}
          </span>
        ))}
      </div>
    </div>
  );
}
