import React from 'react';
import { cardArt } from '../utils/cardArt';
import formatCurrency from '../utils/formatCurrency';

const OUT = {
  received: { bg: 'rgba(52,211,153,.1)', bd: 'rgba(52,211,153,.2)', c: '#34D399', t: '✓ RECEIVED' },
  partial: { bg: 'rgba(245,158,11,.1)', bd: 'rgba(245,158,11,.2)', c: '#F59E0B', t: '⚠ PARTIAL' },
  not_received: { bg: 'rgba(248,113,113,.1)', bd: 'rgba(248,113,113,.2)', c: '#F87171', t: '✗ MISSED' },
  pending: { bg: 'rgba(148,163,184,.12)', bd: 'rgba(148,163,184,.2)', c: '#94A3B8', t: '• PENDING' },
};

function MerchantTile({ m, onClick }) {
  const a = m.accentColor || '#94A3B8';
  return (
    <button type="button" onClick={onClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 56, height: 56, background: `linear-gradient(135deg, ${a}26, ${a}0d)`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.08)' }}>
        <span style={{ font: "700 20px/1 'Outfit'", color: a }}>{m.name[0]}</span>
      </div>
      <span style={{ font: "400 10.5px/1.2 'Inter'", color: 'rgba(245,245,247,.55)', textAlign: 'center' }}>{m.name}</span>
    </button>
  );
}

export default function HomeScreen({ walletCards, merchants, records, onAsk, onScan, onReceipt, onManage, onSelectMerchant }) {
  const gridMerchants = ['amazon', 'swiggy', 'zomato', 'flipkart', 'myntra', 'blinkit', 'starbucks']
    .map((id) => merchants.find((m) => m.id === id)).filter(Boolean);
  const recent = (records || []).slice(0, 2);

  return (
    <div>
      {/* Greeting */}
      <div style={{ padding: '10px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ font: "400 12px/1 'Inter'", color: 'rgba(245,245,247,.4)', marginBottom: 4 }}>Welcome back</div>
          <div style={{ font: "600 19px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.02em' }}>Your rewards ✦</div>
        </div>
        <button onClick={onManage} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} aria-label="Notifications">
          <div style={{ width: 38, height: 38, background: '#141418', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </div>
          <div style={{ position: 'absolute', top: -3, right: -3, width: 9, height: 9, background: '#34D399', borderRadius: '50%', border: '2px solid #0B0B0E' }} />
        </button>
      </div>

      {/* AI Search Bar */}
      <div style={{ padding: '18px 22px 0' }}>
        <button type="button" onClick={onAsk} style={{ width: '100%', textAlign: 'left', background: '#141418', border: '1.5px solid rgba(52,211,153,.25)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 0 0 4px rgba(52,211,153,.05)', cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, background: 'rgba(52,211,153,.12)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ font: "500 10px/1 'Inter'", letterSpacing: '.09em', textTransform: 'uppercase', color: '#34D399', marginBottom: 5 }}>Ask RewardTrust</div>
            <div style={{ font: "400 13px/1 'Inter'", color: 'rgba(245,245,247,.35)' }}>₹1,250 at Starbucks on HDFC Swiggy…</div>
          </div>
        </button>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '14px 22px 0', display: 'flex', gap: 10 }}>
        <button type="button" onClick={onScan} style={{ flex: 1, background: '#141418', border: '1px solid rgba(255,255,255,.08)', borderRadius: 13, padding: 13, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, background: 'rgba(52,211,153,.1)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M17 14v6M14 17h6" /></svg>
          </div>
          <span style={{ font: "500 12.5px/1 'Inter'", color: '#F5F5F7' }}>Scan QR</span>
        </button>
        <button type="button" onClick={onReceipt} style={{ flex: 1, background: '#141418', border: '1px solid rgba(255,255,255,.08)', borderRadius: 13, padding: 13, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, background: 'rgba(245,245,247,.06)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 2v6h6" /></svg>
          </div>
          <span style={{ font: "500 12.5px/1 'Inter'", color: '#F5F5F7' }}>Add Receipt</span>
        </button>
      </div>

      {/* Card wallet strip */}
      {walletCards.length > 0 && (
        <div style={{ padding: '18px 0 0' }}>
          <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ font: "500 10px/1 'Inter'", letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,245,247,.38)' }}>My Cards</div>
            <button onClick={onManage} style={{ background: 'none', border: 'none', font: "500 11.5px/1 'Inter'", color: '#34D399', cursor: 'pointer' }}>Manage ›</button>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 22px 4px' }}>
            {walletCards.map((c) => {
              const art = cardArt(c.id);
              return (
                <div key={c.id} style={{ width: 152, height: 96, background: art.grad, borderRadius: 14, flexShrink: 0, padding: 13, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ font: "700 11px/1 'Outfit'", color: 'rgba(255,255,255,.5)', letterSpacing: '.04em' }}>{art.short}</span>
                    <span style={{ font: "600 8px/1 'Outfit'", color: 'rgba(255,255,255,.45)' }}>{c.network || ''}</span>
                  </div>
                  <div>
                    <div style={{ font: "500 10px/1 'Inter'", color: 'rgba(255,255,255,.4)', marginBottom: 3 }}>{art.tag}</div>
                    <div style={{ font: "600 11.5px/1 'Outfit'", color: 'rgba(255,255,255,.85)' }}>{c.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Merchants */}
      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ font: "500 10px/1 'Inter'", letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,245,247,.38)', marginBottom: 14 }}>Merchants</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          {gridMerchants.map((m) => <MerchantTile key={m.id} m={m} onClick={() => onSelectMerchant(m)} />)}
          <button type="button" onClick={onManage} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 56, height: 56, background: '#141418', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.08)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.4)" strokeWidth="1.5" strokeLinecap="round"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
            </div>
            <span style={{ font: "400 10.5px/1.2 'Inter'", color: 'rgba(245,245,247,.55)' }}>More</span>
          </button>
        </div>
      </div>

      {/* Recent checks */}
      {recent.length > 0 && (
        <div style={{ padding: '4px 22px 20px' }}>
          <div style={{ font: "500 10px/1 'Inter'", letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,245,247,.38)', marginBottom: 12 }}>Recent Checks</div>
          <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,.07)', borderRadius: 13, overflow: 'hidden' }}>
            {recent.map((r, i) => {
              const o = OUT[r.outcome] || OUT.pending;
              return (
                <div key={r.id} style={{ padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: "500 13px/1 'Inter'", color: '#F5F5F7', marginBottom: 3 }}>{r.merchantName} · {formatCurrency(r.amount)}</div>
                    <div style={{ font: "400 11px/1 'Inter'", color: 'rgba(245,245,247,.38)' }}>{r.cardName} · {formatCurrency(r.predictedReward)} predicted</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: o.bg, border: `1px solid ${o.bd}`, borderRadius: 6, padding: '3px 8px', font: "600 10px/1 'Inter'", letterSpacing: '.06em', color: o.c }}>{o.t}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
