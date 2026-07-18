import React from 'react';

// Merchant logo: real image when available, else a clean brand-coloured monogram.
export function MerchantLogo({ merchant, size = 56, radius = 16 }) {
  const a = merchant?.accentColor || '#94A3B8';
  if (merchant?.logo) {
    return (
      <div style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', background: '#141418', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src={merchant.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, background: `linear-gradient(135deg,${a}26,${a}0d)`, borderRadius: radius, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
      <span style={{ font: `700 ${Math.round(size * 0.36)}px/1 'Outfit'`, color: a }}>{(merchant?.name || '?')[0]}</span>
    </div>
  );
}

// Card payment-network mark (simple representations, not trademark reproductions).
export function NetworkMark({ network, opacity = 0.85 }) {
  const n = String(network || '').toLowerCase();
  if (n.includes('master')) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center' }} aria-hidden="true">
        <span style={{ width: 15, height: 15, background: '#eb001b', borderRadius: '50%', opacity }} />
        <span style={{ width: 15, height: 15, background: '#f79e1b', borderRadius: '50%', opacity, marginLeft: -6 }} />
      </span>
    );
  }
  if (n.includes('visa')) return <span style={{ font: "italic 800 11px/1 'Outfit'", color: `rgba(255,255,255,${opacity})`, letterSpacing: '.02em' }}>VISA</span>;
  if (n.includes('rupay')) return <span style={{ font: "700 9px/1 'Outfit'", color: `rgba(255,255,255,${opacity})` }}>RuPay»</span>;
  return null;
}

// Card face logo slot: real card/bank logo image if provided, else short issuer code.
export function CardMark({ card, art }) {
  if (card?.logo) return <img src={card.logo} alt="" style={{ height: 16, maxWidth: 60, objectFit: 'contain' }} />;
  return <span style={{ font: "700 11px/1 'Outfit'", color: 'rgba(255,255,255,.55)', letterSpacing: '.04em' }}>{art?.short || card?.badge}</span>;
}
