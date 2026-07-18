import React, { useState } from 'react';
import formatCurrency from '../utils/formatCurrency';

const OUT = {
  received: { bg: 'rgba(52,211,153,.1)', bd: 'rgba(52,211,153,.2)', c: '#34D399', t: '✓ RECEIVED' },
  partial: { bg: 'rgba(245,158,11,.1)', bd: 'rgba(245,158,11,.2)', c: '#F59E0B', t: '⚠ PARTIAL' },
  not_received: { bg: 'rgba(248,113,113,.1)', bd: 'rgba(248,113,113,.2)', c: '#F87171', t: '✗ MISSED' },
  pending: { bg: 'rgba(148,163,184,.12)', bd: 'rgba(148,163,184,.2)', c: '#94A3B8', t: '• PENDING' },
};
const FILTERS = [['all', 'All'], ['received', 'Received ✓'], ['partial', 'Partial ⚠'], ['not_received', 'Missed ✗']];

function fmtDate(iso) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function monthKey(iso) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? 'Earlier' : d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function HistoryScreen({ records = [], onSetOutcome, onDiagnose }) {
  const [filter, setFilter] = useState('all');
  const filtered = records.filter((r) => filter === 'all' || r.outcome === filter);

  // group by month preserving order
  const groups = [];
  filtered.forEach((r) => {
    const k = monthKey(r.ts);
    let g = groups.find((x) => x.k === k);
    if (!g) { g = { k, items: [] }; groups.push(g); }
    g.items.push(r);
  });

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{ padding: '8px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ font: "700 22px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.03em' }}>History</div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 2 }}>
        {FILTERS.map(([id, label]) => {
          const on = filter === id;
          return (
            <button key={id} type="button" onClick={() => setFilter(id)} style={{ background: on ? 'rgba(52,211,153,.1)' : '#141418', border: `1.5px solid ${on ? 'rgba(52,211,153,.3)' : 'rgba(255,255,255,.08)'}`, borderRadius: 20, padding: '6px 14px', flexShrink: 0, cursor: 'pointer' }}>
              <span style={{ font: `${on ? 600 : 500} 11.5px/1 'Inter'`, color: on ? '#34D399' : 'rgba(245,245,247,.5)' }}>{label}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'rgba(245,245,247,.4)' }}>
          <div style={{ font: "600 15px/1.4 'Outfit'", color: '#F5F5F7', marginBottom: 8 }}>No tracked rewards yet</div>
          <div style={{ font: "400 13px/1.5 'Inter'", color: 'rgba(245,245,247,.45)', maxWidth: 260, margin: '0 auto' }}>Run a lookup and tap "Track this reward" to start your audit trail.</div>
        </div>
      )}

      {groups.map((g) => (
        <div key={g.k}>
          <div style={{ font: "500 10px/1 'Inter'", letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,245,247,.3)', margin: '4px 0 10px' }}>{g.k}</div>
          {g.items.map((r) => {
            const o = OUT[r.outcome] || OUT.pending;
            const missed = r.outcome === 'not_received' || r.outcome === 'partial';
            return (
              <div key={r.id} style={{ background: '#141418', border: `1px solid ${missed ? 'rgba(248,113,113,.15)' : 'rgba(255,255,255,.07)'}`, borderRadius: 14, padding: '13px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#26262c,#141418)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ font: "700 14px/1 'Outfit'", color: '#F5F5F7' }}>{(r.merchantName || '?')[0]}</span></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "600 13.5px/1 'Inter'", color: '#F5F5F7', marginBottom: 3 }}>{r.merchantName} · {formatCurrency(r.amount)}</div>
                    <div style={{ font: "400 10.5px/1 'Inter'", color: 'rgba(245,245,247,.38)' }}>{r.cardName} · {fmtDate(r.ts)}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: o.bg, border: `1px solid ${o.bd}`, borderRadius: 7, padding: '4px 9px', font: "600 10px/1 'Inter'", letterSpacing: '.06em', color: o.c, flexShrink: 0 }}>{o.t}</span>
                </div>

                {r.outcome === 'pending' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[['received', '✓ Posted', '#34D399'], ['partial', '◐ Partial', '#F59E0B'], ['not_received', '✗ Missed', '#F87171']].map(([oc, lbl, col]) => (
                      <button key={oc} type="button" onClick={() => onSetOutcome(r.id, oc)} style={{ flex: 1, background: 'rgba(255,255,255,.03)', border: `1px solid ${col}44`, borderRadius: 8, padding: '7px 4px', cursor: 'pointer', font: "600 10.5px/1 'Inter'", color: col }}>{lbl}</button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ font: "400 11px/1 'Inter'", color: 'rgba(245,245,247,.4)' }}>
                      Predicted <span style={{ color: 'rgba(245,245,247,.65)' }}>{formatCurrency(r.predictedReward)}</span>
                      {r.actualReward != null && <> · Received <span style={{ color: o.c, fontWeight: 600 }}>{formatCurrency(r.actualReward)}</span></>}
                    </div>
                    {missed
                      ? <button onClick={() => onDiagnose && onDiagnose(r)} style={{ background: 'none', border: 'none', font: "500 11px/1 'Inter'", color: '#34D399', cursor: 'pointer' }}>Why? ›</button>
                      : <button onClick={() => onSetOutcome(r.id, 'pending')} style={{ background: 'none', border: 'none', font: "500 11px/1 'Inter'", color: 'rgba(245,245,247,.35)', cursor: 'pointer' }}>Reset ›</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ height: 12 }} />
    </div>
  );
}
