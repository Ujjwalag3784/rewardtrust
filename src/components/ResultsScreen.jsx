import React from 'react';
import formatCurrency from '../utils/formatCurrency';
import { cardArt } from '../utils/cardArt';
import { MerchantLogo } from './Brand';

const C = { green: '#34D399', red: '#F87171', grey: '#6B7280' };

function value(r) {
  if (r.rewardType === 'points') return `≈ ${formatCurrency(r.rewardValueInr)}`;
  return formatCurrency(r.rewardValueInr);
}
function rateText(r) {
  if (r.verdict === 'ineligible') return 'excluded';
  if (r.verdict === 'unknown') return '';
  const pct = `${(r.effectiveRate * 100).toFixed(r.effectiveRate < 0.1 ? 1 : 0)}%`;
  return r.verdict === 'partial' ? `${pct} base` : pct;
}
function confChip(band, tone) {
  const col = tone === 'red' ? C.red : tone === 'grey' ? C.grey : C.green;
  const bg = tone === 'red' ? 'rgba(248,113,113,.08)' : tone === 'grey' ? 'rgba(107,114,128,.1)' : 'rgba(52,211,153,.1)';
  const bd = tone === 'red' ? 'rgba(248,113,113,.2)' : tone === 'grey' ? 'rgba(107,114,128,.2)' : 'rgba(52,211,153,.22)';
  const label = tone === 'grey' ? 'UNKNOWN' : (band || 'low').toUpperCase();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: bg, border: `1px solid ${bd}`, borderRadius: 6, padding: '3px 8px' }}>
      <span style={{ width: 5, height: 5, background: col, borderRadius: '50%', flexShrink: 0 }} />
      <span style={{ font: "700 9.5px/1 'Inter'", letterSpacing: '.07em', color: col }}>{label}</span>
    </span>
  );
}

function SectionHead({ label, count, color }) {
  const line = { flex: 1, height: 1, background: color + '26' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 12px' }}>
      <div style={line} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 7, height: 7, background: color, borderRadius: '50%' }} />
        <span style={{ font: "700 9.5px/1 'Inter'", letterSpacing: '.12em', textTransform: 'uppercase', color }}>{label}</span>
        <span style={{ font: "400 9.5px/1 'Inter'", color: color + '80' }}>{count} card{count === 1 ? '' : 's'}</span>
      </div>
      <div style={line} />
    </div>
  );
}

function Row({ r, best, tone, onWhy }) {
  const art = cardArt(r.methodId);
  const valCol = tone === 'green' ? C.green : tone === 'red' && r.verdict === 'ineligible' ? C.red : 'rgba(245,245,247,.45)';
  const nameCol = tone === 'green' ? '#F5F5F7' : tone === 'grey' ? 'rgba(245,245,247,.55)' : 'rgba(245,245,247,.7)';
  const showRedReason = r.verdict === 'partial' || r.verdict === 'ineligible';

  return (
    <div style={{ background: '#141418', border: `1.5px solid ${best ? 'rgba(52,211,153,.28)' : 'rgba(255,255,255,.07)'}`, borderRadius: 16, overflow: 'hidden', marginBottom: 9 }}>
      {best && (
        <div style={{ background: 'rgba(52,211,153,.1)', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(52,211,153,.15)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#34D399"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          <span style={{ font: "700 9.5px/1 'Inter'", letterSpacing: '.1em', textTransform: 'uppercase', color: '#34D399' }}>Best for this payment</span>
        </div>
      )}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
          <div style={{ width: 40, height: 26, background: art.grad, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ font: "700 7px/1 'Outfit'", color: 'rgba(255,255,255,.45)' }}>{art.short}</span></div>
          <div style={{ flex: 1 }}><div style={{ font: "600 13px/1 'Inter'", color: nameCol }}>{r.cardName}</div></div>
          {r.verdict === 'unknown' ? confChip(null, 'grey') : (
            <div style={{ textAlign: 'right' }}>
              <div style={{ font: "700 16px/1 'Outfit'", color: valCol, fontFeatureSettings: "'tnum'" }}>{r.verdict === 'ineligible' ? '₹0' : value(r)}</div>
              <div style={{ font: "500 10px/1 'Outfit'", color: valCol + (tone === 'green' ? '99' : ''), marginTop: 2, opacity: .7 }}>{rateText(r)}</div>
            </div>
          )}
        </div>

        {showRedReason ? (
          <div style={{ background: 'rgba(248,113,113,.07)', borderLeft: '2.5px solid rgba(248,113,113,.4)', borderRadius: '0 8px 8px 0', padding: '8px 10px', marginBottom: 9 }}>
            <div style={{ font: "400 11px/1.5 'Inter'", color: 'rgba(245,245,247,.55)' }}>{r.reason}</div>
          </div>
        ) : r.verdict === 'unknown' ? (
          <div style={{ background: 'rgba(107,114,128,.08)', border: '1px solid rgba(107,114,128,.15)', borderRadius: 10, padding: '10px 12px', marginBottom: 8, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
            <div style={{ font: "400 11px/1.5 'Inter'", color: 'rgba(107,114,128,.85)' }}>{r.reason}</div>
          </div>
        ) : (
          <div style={{ font: "400 11.5px/1.5 'Inter'", color: 'rgba(245,245,247,.5)', marginBottom: 9 }}>{r.reason}</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {r.verdict === 'unknown' ? <span /> : confChip(r.confidence?.band, tone === 'green' ? 'green' : 'red')}
          <button onClick={() => onWhy(r)} style={{ background: 'none', border: 'none', font: "500 11px/1 'Inter'", color: '#34D399', cursor: 'pointer' }}>{tone === 'green' ? 'Source ↗' : 'Why? ↗'}</button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsScreen({ merchant, spendAmount, results, onBack, onShowTrustReport }) {
  const willEarn = results.filter((r) => r.verdict === 'eligible').sort((a, b) => b.rewardValueInr - a.rewardValueInr);
  const wontEarn = results.filter((r) => r.verdict === 'partial' || r.verdict === 'ineligible').sort((a, b) => b.rewardValueInr - a.rewardValueInr);
  const cantConfirm = results.filter((r) => r.verdict === 'unknown');
  const a = merchant?.accentColor || '#94A3B8';
  const best = willEarn[0];

  return (
    <div>
      {/* Merchant header */}
      <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} aria-label="Back" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <MerchantLogo merchant={merchant} size={36} radius={10} />
          <div>
            <div style={{ font: "600 16px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.01em' }}>{merchant?.name}</div>
            <div style={{ font: "400 10px/1 'Inter'", color: 'rgba(245,245,247,.38)' }}>{merchant?.category || ''}</div>
          </div>
        </div>
      </div>

      {/* Amount + MCC */}
      <div style={{ padding: '14px 20px', background: 'linear-gradient(180deg,rgba(52,211,153,.05) 0%,transparent 100%)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
          <span style={{ font: "300 22px/1 'Outfit'", color: 'rgba(245,245,247,.5)' }}>₹</span>
          <span style={{ font: "700 42px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.04em', fontFeatureSettings: "'tnum'" }}>{Number(spendAmount).toLocaleString('en-IN')}</span>
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#141418', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '4px 9px' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.4)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-4 0v2" /></svg>
            <span style={{ font: "500 10.5px/1 'Inter'", color: 'rgba(245,245,247,.45)' }}>{merchant?.mcc ? `MCC ${merchant.mcc}` : 'MCC unknown'}</span>
          </span>
          <span style={{ font: "400 11px/1 'Inter'", color: 'rgba(245,245,247,.4)' }}>{merchant?.mccLabel || merchant?.category || ''}</span>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {willEarn.length > 0 && <SectionHead label="Will Earn" count={willEarn.length} color={C.green} />}
        {willEarn.map((r, i) => <Row key={r.methodId} r={r} best={i === 0 && best === r} tone="green" onWhy={onShowTrustReport} />)}

        {wontEarn.length > 0 && <SectionHead label="Won't Earn" count={wontEarn.length} color={C.red} />}
        {wontEarn.map((r) => <Row key={r.methodId} r={r} tone="red" onWhy={onShowTrustReport} />)}

        {cantConfirm.length > 0 && <SectionHead label="Can't Confirm" count={cantConfirm.length} color={C.grey} />}
        {cantConfirm.map((r) => <Row key={r.methodId} r={r} tone="grey" onWhy={onShowTrustReport} />)}

        {best && (
          <button onClick={() => onShowTrustReport(best)} style={{ width: '100%', margin: '12px 0 20px', height: 48, background: '#141418', border: '1.5px solid rgba(52,211,153,.25)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
            <span style={{ font: "600 13px/1 'Inter'", color: '#34D399' }}>View Full Trust Report</span>
          </button>
        )}
      </div>
    </div>
  );
}
