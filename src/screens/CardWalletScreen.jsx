import React, { useState } from 'react';
import { cardArt } from '../utils/cardArt';

export default function CardWalletScreen({ cards, selected, onToggle, onSave, onBack, mode = 'onboard' }) {
  const [q, setQ] = useState('');
  const isManage = mode === 'manage';
  const filtered = cards.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || (c.issuer || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ padding: '0 22px' }}>
      <div style={{ paddingTop: 30, marginBottom: 6 }}>
        {isManage ? (
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, marginBottom: 12, cursor: 'pointer' }} aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
        ) : (
          <div style={{ font: "600 10px/1 'Inter'", letterSpacing: '.12em', textTransform: 'uppercase', color: '#34D399', marginBottom: 10 }}>Step 2 of 2</div>
        )}
        <div style={{ font: "700 24px/1.1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.03em', marginBottom: 6 }}>{isManage ? 'Manage cards' : 'Your card wallet'}</div>
        <div style={{ font: "400 13px/1.5 'Inter'", color: 'rgba(245,245,247,.5)', marginBottom: 22 }}>Select all the cards you use. RewardTrust checks rewards only for cards you've added.</div>
      </div>

      <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, height: 44, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, marginBottom: 16 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cards…" aria-label="Search cards"
          style={{ font: "400 13.5px/1 'Inter'", color: '#F5F5F7', background: 'transparent', border: 'none', outline: 'none', flex: 1 }} />
      </div>

      <div style={{ font: "500 10px/1 'Inter'", letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,245,247,.35)', marginBottom: 10 }}>Popular cards</div>

      {filtered.map((c) => {
        const on = selected.includes(c.id);
        const art = cardArt(c.id);
        return (
          <button key={c.id} type="button" onClick={() => onToggle(c.id)} aria-pressed={on}
            style={{ width: '100%', textAlign: 'left', background: '#141418', border: `1.5px solid ${on ? 'rgba(52,211,153,.3)' : 'rgba(255,255,255,.08)'}`, borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 28, background: art.grad, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ font: "700 8px/1 'Outfit'", color: 'rgba(255,255,255,.5)' }}>{art.short}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: "600 13.5px/1 'Inter'", color: '#F5F5F7', marginBottom: 3 }}>{c.name}</div>
              <div style={{ font: "400 11px/1 'Inter'", color: 'rgba(245,245,247,.45)' }}>{art.tag}</div>
            </div>
            {on ? (
              <div style={{ width: 22, height: 22, background: '#34D399', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B0B0E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              </div>
            ) : (
              <div style={{ width: 22, height: 22, background: '#1C1C22', border: '1.5px solid rgba(255,255,255,.12)', borderRadius: 6, flexShrink: 0 }} />
            )}
          </button>
        );
      })}

      <div style={{ background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.18)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 20px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
        <span style={{ font: "400 11.5px/1.4 'Inter'", color: 'rgba(52,211,153,.85)' }}>{selected.length} card{selected.length === 1 ? '' : 's'} selected. You can add more later from Profile.</span>
      </div>

      <button type="button" onClick={onSave} disabled={selected.length === 0}
        style={{ width: '100%', height: 52, background: selected.length ? '#34D399' : '#1a1a1f', border: 'none', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28, cursor: selected.length ? 'pointer' : 'default' }}>
        <span style={{ font: "600 15px/1 'Inter'", color: selected.length ? '#0B0B0E' : 'rgba(245,245,247,.4)' }}>{isManage ? 'Save wallet' : 'Continue to Home'}</span>
        {selected.length > 0 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0B0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
      </button>
    </div>
  );
}
