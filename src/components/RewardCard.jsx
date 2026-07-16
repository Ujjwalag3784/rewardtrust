import React from 'react';
import formatCurrency from '../utils/formatCurrency';

// Verdict → display metadata
const VERDICT_META = {
  eligible: { label: 'ELIGIBLE', icon: '✓', cls: 'verdict-eligible' },
  partial: { label: 'PARTIAL', icon: '◐', cls: 'verdict-partial' },
  ineligible: { label: 'NOT ELIGIBLE', icon: '✕', cls: 'verdict-ineligible' },
  unknown: { label: 'UNKNOWN', icon: '?', cls: 'verdict-unknown' },
};

function confidenceLabel(band) {
  if (band === 'high') return { text: 'HIGH CONFIDENCE', cls: 'trust-high' };
  if (band === 'medium') return { text: 'MEDIUM CONFIDENCE', cls: 'trust-medium' };
  return { text: 'LOW CONFIDENCE', cls: 'trust-low' };
}

// How to present the reward figure depending on reward type + verdict
function rewardDisplay(calc) {
  if (calc.verdict === 'unknown') return 'Unverified';
  if (calc.verdict === 'ineligible') return 'No reward';
  if (calc.rewardType === 'points') return `≈ ${calc.rewardAmount} coins`;
  return formatCurrency(calc.rewardAmount);
}

export default function RewardCard({
  method,
  calculation,
  isBest,
  isAlternative,
  onClickCard,
  onWhyTrustClick,
  diffVsBest,
  merchantName,
  spendAmount,
}) {
  const {
    rewardAmount,
    rate,
    verdict = 'unknown',
    reason,
    confidence,
    rewardType,
    sourceType,
    lastVerified,
  } = calculation;

  const vMeta = VERDICT_META[verdict] || VERDICT_META.unknown;
  const conf = confidenceLabel(confidence?.band);
  const hasReward = verdict === 'eligible' || verdict === 'partial';

  // ---------- Featured / best card ----------
  if (isBest) {
    return (
      <div className={`reward-card card-best animate-slide-up ${vMeta.cls}`}>
        <div className="best-badge-ribbon">{vMeta.icon} {vMeta.label}</div>

        <div className="card-header-row">
          <div className="method-meta">
            <span className="method-badge-icon" style={{ background: method.bgGradient, borderColor: method.borderColor }}>
              {method.badge}
            </span>
            <div>
              <h3 className="method-name">{method.name}</h3>
              <p className="method-type">{rewardType === 'points' ? 'Reward Points' : 'Cashback Reward'}</p>
            </div>
          </div>
          <span className={`badge-trust-level ${conf.cls}`}>🛡️ {conf.text}</span>
        </div>

        <div className="reward-display-row">
          <div className="reward-big-box">
            <span className={`reward-value ${!hasReward ? 'text-muted' : ''}`}>{rewardDisplay(calculation)}</span>
            {hasReward && (
              <span className="reward-details">
                On {formatCurrency(spendAmount)} spend · {(rate * 100).toFixed(1)}% rate
              </span>
            )}
          </div>
        </div>

        {/* Plain-language WHY — the core of the product */}
        <div className={`verdict-reason-box ${vMeta.cls}`}>
          <span className="verdict-reason-icon">{vMeta.icon}</span>
          <span className="verdict-reason-text">{reason}</span>
        </div>

        <div className="featured-stats-row" role="button" tabIndex={0} onClick={onWhyTrustClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onWhyTrustClick && onWhyTrustClick(); } }}>
          <div className="stat-unit">
            <span className="stat-unit-val">{confidence?.score ?? 0}/100</span>
            <span className="stat-unit-lbl">CONFIDENCE SCORE</span>
          </div>
          <div className="stat-unit border-left">
            <span className="stat-unit-val">{sourceType}</span>
            <span className="stat-unit-lbl">SOURCE TYPE</span>
          </div>
          <div className="stat-unit border-left">
            <span className="stat-unit-val">{lastVerified}</span>
            <span className="stat-unit-lbl">LAST VERIFIED</span>
          </div>
        </div>

        <div className="verification-guarantee-row" role="button" tabIndex={0} onClick={onWhyTrustClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onWhyTrustClick && onWhyTrustClick(); } }}>
          <span className="shield-icon">🛡️</span>
          <span className="guarantee-text">Based on official {method.name} terms</span>
          <span className="trust-link">Why? →</span>
        </div>

        {hasReward && (
          <button
            className="btn-pay-cta"
            onClick={() => alert(`Simulating payment of ${formatCurrency(spendAmount)} at ${merchantName} using ${method.name}.`)}
          >
            Pay with {method.name} &nbsp; →
          </button>
        )}
      </div>
    );
  }

  // ---------- Alternative (compact) card ----------
  return (
    <div className={`reward-card card-alternative animate-fade-in ${vMeta.cls}`} onClick={onClickCard}>
      <div className="card-header-row">
        <div className="method-meta">
          <span className="method-badge-icon" style={{ background: method.bgGradient, borderColor: method.borderColor }}>
            {method.badge}
          </span>
          <div>
            <h3 className="method-name">{method.name}</h3>
            <p className="method-type">{rewardType === 'points' ? 'Reward Points' : 'Cashback Reward'}</p>
          </div>
        </div>
        <span className={`badge-verdict ${vMeta.cls}`}>{vMeta.icon} {vMeta.label}</span>
      </div>

      <div className="reward-display-row">
        <span className={`reward-value ${!hasReward ? 'text-muted' : ''}`}>{rewardDisplay(calculation)}</span>
        {hasReward && diffVsBest !== undefined && diffVsBest > 0 && (
          <span className="diff-versus-best text-yellow">
            -{formatCurrency(diffVsBest)} vs best
          </span>
        )}
      </div>

      <div className="card-footer-condition">
        <span className="condition-warning-icon">{vMeta.icon}</span>
        <span className="condition-text-snippet">{reason}</span>
      </div>
    </div>
  );
}
