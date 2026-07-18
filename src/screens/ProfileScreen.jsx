import React from 'react';

const card = { background: '#141418', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 14 };

export default function ProfileScreen({ isPrime, onTogglePrime, onReset, phone, walletCount, onManageCards }) {
  const masked = phone ? `+91 ${phone.slice(0, 2)}xxxxx${phone.slice(-3)}` : 'Not signed in';
  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{ padding: '8px 0 16px', font: "700 22px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.03em' }}>Profile</div>

      {/* Hero */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(145deg,rgba(52,211,153,.2),rgba(52,211,153,.05))', border: '1px solid rgba(52,211,153,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2 4 6.5V12c0 5.5 3.5 10.6 8 12 4.5-1.4 8-6.5 8-12V6.5L12 2Z" stroke="#34D399" strokeWidth="1.4" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div>
          <div style={{ font: "600 16px/1 'Outfit'", color: '#F5F5F7', marginBottom: 5 }}>{masked}</div>
          <div style={{ font: "400 12px/1 'Inter'", color: 'rgba(245,245,247,.45)' }}>{walletCount} card{walletCount === 1 ? '' : 's'} in your wallet</div>
        </div>
      </div>

      {/* Manage wallet */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ font: "600 13.5px/1 'Inter'", color: '#F5F5F7', marginBottom: 4 }}>Manage wallet</div>
          <div style={{ font: "400 11.5px/1.4 'Inter'", color: 'rgba(245,245,247,.45)' }}>Add or remove the cards you own.</div>
        </div>
        <button onClick={onManageCards} style={{ background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.25)', borderRadius: 10, padding: '8px 14px', font: "600 12px/1 'Inter'", color: '#34D399', cursor: 'pointer' }}>Manage ›</button>
      </div>

      {/* Prime toggle */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{ font: "600 13.5px/1 'Inter'", color: '#F5F5F7', marginBottom: 4 }}>Amazon Prime member</div>
          <div style={{ font: "400 11.5px/1.4 'Inter'", color: 'rgba(245,245,247,.45)' }}>Enables the 5% rate on Amazon Pay ICICI.</div>
        </div>
        <button onClick={() => onTogglePrime(!isPrime)} role="switch" aria-checked={isPrime} aria-label="Amazon Prime membership"
          style={{ width: 46, height: 28, borderRadius: 999, border: 'none', background: isPrime ? '#34D399' : '#2a2a30', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .2s' }}>
          <span style={{ position: 'absolute', top: 3, left: isPrime ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
        </button>
      </div>

      {/* Sign out */}
      <button onClick={onReset} style={{ ...card, width: '100%', textAlign: 'center', color: '#F87171', font: "600 13.5px/1 'Inter'", cursor: 'pointer', marginTop: 6 }}>Sign out</button>
      <div style={{ height: 16 }} />
    </div>
  );
}
