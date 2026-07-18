import React, { useState } from 'react';
import { MerchantLogo } from '../components/Brand';

export default function MerchantsScreen({ merchants, onSelect, onBack }) {
  const [q, setQ] = useState('');
  const list = merchants.filter((m) =>
    m.name.toLowerCase().includes(q.toLowerCase()) || (m.category || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{ padding: '6px 0 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} aria-label="Back" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ font: "700 20px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.03em' }}>All merchants</div>
      </div>

      <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, height: 44, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, marginBottom: 18 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search merchants…" aria-label="Search merchants"
          style={{ font: "400 13.5px/1 'Inter'", color: '#F5F5F7', background: 'transparent', border: 'none', outline: 'none', flex: 1 }} />
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: 'rgba(245,245,247,.4)', font: "400 13px/1.5 'Inter'" }}>No merchants match "{q}".</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, paddingBottom: 20 }}>
          {list.map((m) => (
            <button key={m.id} type="button" onClick={() => onSelect(m)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <MerchantLogo merchant={m} size={56} radius={16} />
              <span style={{ font: "400 10.5px/1.2 'Inter'", color: 'rgba(245,245,247,.55)', textAlign: 'center' }}>{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
