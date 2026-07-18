import React from 'react';
import formatCurrency from '../utils/formatCurrency';
import { cardArt } from '../utils/cardArt';
import { formatVerified } from '../utils/labels';

const VMETA = {
  eligible: { label: 'Eligible', c: '#34D399', bg: 'rgba(52,211,153,.1)', bd: 'rgba(52,211,153,.25)' },
  partial: { label: 'Partial', c: '#F59E0B', bg: 'rgba(245,158,11,.1)', bd: 'rgba(245,158,11,.25)' },
  ineligible: { label: 'Not eligible', c: '#F87171', bg: 'rgba(248,113,113,.1)', bd: 'rgba(248,113,113,.25)' },
  unknown: { label: 'Unknown', c: '#6B7280', bg: 'rgba(107,114,128,.1)', bd: 'rgba(107,114,128,.25)' },
};

function ageDays(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 86400000));
}

export default function TrustReportScreen({ report, method, spendAmount, onBack }) {
  if (!report) return <div style={{ padding: 40, color: 'rgba(245,245,247,.5)' }}>No report available.</div>;
  const score = report.confidence?.score ?? 0;
  const v = VMETA[report.verdict] || VMETA.unknown;
  const C = 2 * Math.PI * 74; // ≈465
  const dash = `${(C * score) / 100} ${C}`;
  const art = cardArt(report.methodId);
  const src = report.source || {};
  const age = ageDays(src.lastVerified);
  const fresh = age != null && age <= 30;
  const hasReward = report.verdict === 'eligible' || report.verdict === 'partial';

  return (
    <div style={{ padding: '0 22px' }}>
      <div style={{ padding: '6px 0 0', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button onClick={onBack} aria-label="Back" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <div>
          <div style={{ font: "600 15px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.01em' }}>Trust Report</div>
          <div style={{ font: "400 10.5px/1 'Inter'", color: 'rgba(245,245,247,.38)' }}>{report.cardName} · {formatCurrency(spendAmount)}</div>
        </div>
      </div>

      {/* Gauge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 16px' }}>
        <svg width="186" height="186" viewBox="0 0 186 186">
          <circle cx="93" cy="93" r="74" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="10" />
          <circle cx="93" cy="93" r="74" fill="none" stroke={v.c} strokeWidth="10" strokeLinecap="round" strokeDasharray={dash} transform="rotate(-90 93 93)" opacity=".9" />
          <text x="93" y="86" textAnchor="middle" fill="#F5F5F7" fontFamily="Outfit" fontWeight="700" fontSize="46" letterSpacing="-2">{score}</text>
          <text x="93" y="104" textAnchor="middle" fill="rgba(245,245,247,0.35)" fontFamily="Inter" fontSize="10.5" fontWeight="600" letterSpacing="2">CONFIDENCE</text>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: v.bg, border: `1px solid ${v.bd}`, borderRadius: 8, padding: '6px 14px', marginTop: -4 }}>
          <div style={{ width: 8, height: 8, background: v.c, borderRadius: '50%' }} />
          <span style={{ font: "700 12px/1 'Inter'", letterSpacing: '.1em', textTransform: 'uppercase', color: v.c }}>{v.label}</span>
        </div>
      </div>

      {/* Card context */}
      <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 28, background: art.grad, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ font: "700 8px/1 'Outfit'", color: 'rgba(255,255,255,.5)' }}>{art.short}</span></div>
        <div style={{ flex: 1 }}>
          <div style={{ font: "500 12.5px/1.4 'Inter'", color: '#F5F5F7', marginBottom: 3 }}>
            {hasReward
              ? <>{report.cardName} earns <span style={{ color: '#34D399', fontWeight: 600 }}>{formatCurrency(report.rewardValueInr)} ({(report.effectiveRate * 100).toFixed(report.effectiveRate < 0.1 ? 1 : 0)}%)</span> on this transaction.</>
              : report.verdict === 'ineligible'
                ? <>{report.cardName} earns <span style={{ color: '#F87171', fontWeight: 600 }}>no reward</span> here.</>
                : <>Reward for {report.cardName} <span style={{ color: '#6B7280', fontWeight: 600 }}>cannot be confirmed</span>.</>}
          </div>
          <div style={{ font: "400 10.5px/1.3 'Inter'", color: 'rgba(245,245,247,.4)' }}>{report.reason}</div>
        </div>
      </div>

      {/* Official Quote */}
      <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.4)" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>
          <span style={{ font: "600 9.5px/1 'Inter'", letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,245,247,.38)' }}>Official T&amp;C Quote</span>
        </div>
        <div style={{ padding: '13px 14px' }}>
          <div style={{ font: "400 12.5px/1.7 'Inter'", color: 'rgba(245,245,247,.7)', fontStyle: 'italic', marginBottom: 10 }}>{src.quote ? `"${src.quote}"` : 'No official quote is on file for this rule — treat as unverified.'}</div>
          {src.title && <div style={{ font: "500 10.5px/1 'Inter'", color: 'rgba(245,245,247,.35)' }}>— {src.title}</div>}
        </div>
      </div>

      {/* Source link */}
      {src.url && (
        <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ background: '#141418', border: '1px solid rgba(255,255,255,.08)', borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'rgba(52,211,153,.1)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "500 12px/1.3 'Inter'", color: '#34D399', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.url.replace(/^https?:\/\//, '')}</div>
            <div style={{ font: "400 10.5px/1.3 'Inter'", color: 'rgba(245,245,247,.38)' }}>Official source · opens live URL</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
        </a>
      )}

      {/* Freshness */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          <span style={{ font: "400 12px/1 'Inter'", color: 'rgba(245,245,247,.45)' }}>Last verified: {formatVerified(src.lastVerified)}</span>
        </div>
        {age != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: fresh ? 'rgba(52,211,153,.08)' : 'rgba(245,158,11,.08)', border: `1px solid ${fresh ? 'rgba(52,211,153,.18)' : 'rgba(245,158,11,.18)'}`, borderRadius: 6, padding: '3px 9px' }}>
            <div style={{ width: 5, height: 5, background: fresh ? '#34D399' : '#F59E0B', borderRadius: '50%' }} />
            <span style={{ font: "600 9.5px/1 'Inter'", letterSpacing: '.06em', color: fresh ? '#34D399' : '#F59E0B' }}>{fresh ? 'FRESH' : 'AGING'}</span>
            <span style={{ font: "400 9.5px/1 'Inter'", color: fresh ? 'rgba(52,211,153,.6)' : 'rgba(245,158,11,.6)' }}>{age}d ago</span>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,.06)', marginBottom: 14 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.35)" strokeWidth="1.5" strokeLinecap="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          <span style={{ font: "400 12px/1 'Inter'", color: 'rgba(245,245,247,.4)' }}>Seen different terms?</span>
        </div>
        <span style={{ font: "500 12px/1 'Inter'", color: '#34D399' }}>Report an issue ›</span>
      </div>
    </div>
  );
}
