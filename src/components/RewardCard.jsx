import React from 'react';
import formatCurrency from '../utils/formatCurrency';

export default function RewardCard({
  method,
  calculation,
  isBest,
  isAlternative,
  onClickCard,
  onWhyTrustClick,
  diffVsBest,
  merchantName,
  spendAmount
}) {
  const {
    rewardAmount,
    rate,
    isUnavailable,
    confidenceScore,
    sourceType,
    lastVerified,
    conditionsList
  } = calculation;

  // Render Unavailable Card
  if (isUnavailable) {
    return (
      <div className="reward-card card-unavailable animate-fade-in" onClick={onClickCard}>
        <div className="card-header-row">
          <div className="method-meta">
            <span className="method-badge-icon" style={{ background: method.bgGradient, borderColor: '#EF4444' }}>
              {method.badge}
            </span>
            <div>
              <h3 className="method-name">{method.name}</h3>
              <p className="method-type text-red">Reward Pending</p>
            </div>
          </div>
          <span className="badge-trust-level trust-low">LOW CONFIDENCE</span>
        </div>

        <div className="reward-display-row">
          <span className="reward-value text-muted">Unavailable</span>
        </div>

        <div className="card-error-row">
          <span className="error-icon">🚫</span>
          <span className="error-text">Insufficient official documentation for verification</span>
        </div>
      </div>
    );
  }

  // Determine trust label and color
  let trustLabel = "LOW CONFIDENCE";
  let trustClass = "trust-low";
  if (confidenceScore >= 90) {
    trustLabel = "MOST TRUSTED";
    trustClass = "trust-high";
  } else if (confidenceScore >= 75) {
    trustLabel = "MEDIUM TRUST";
    trustClass = "trust-medium";
  }

  // Render Best Card (Featured)
  if (isBest) {
    return (
      <div className="reward-card card-best animate-slide-up">
        <div className="best-badge-ribbon">👑 BEST OPTION</div>
        
        <div className="card-header-row">
          <div className="method-meta">
            <span className="method-badge-icon" style={{ background: method.bgGradient, borderColor: method.borderColor }}>
              {method.badge}
            </span>
            <div>
              <h3 className="method-name">{method.name}</h3>
              <p className="method-type">Cashback Reward</p>
            </div>
          </div>
          <span className={`badge-trust-level ${trustClass}`}>🛡️ {trustLabel}</span>
        </div>

        <div className="reward-display-row">
          <div className="reward-big-box">
            <span className="reward-value">{formatCurrency(rewardAmount)}</span>
            <span className="reward-details">
              Guaranteed on {formatCurrency(spendAmount)} spend · {(rate * 100).toFixed(1)}% rate
            </span>
          </div>
        </div>

        {/* Highlight Score Summary */}
        <div className="featured-stats-row" onClick={onWhyTrustClick}>
          <div className="stat-unit">
            <span className="stat-unit-val">{confidenceScore}/100</span>
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

        <div className="verification-guarantee-row" onClick={onWhyTrustClick}>
          <span className="shield-icon">🛡️</span>
          <span className="guarantee-text">Verified against official {method.name} terms</span>
          <span className="trust-link">Why Trust? →</span>
        </div>

        <button className="btn-pay-cta" onClick={() => alert(`Simulating payment of ${formatCurrency(spendAmount)} at ${merchantName} using ${method.name}.`)}>
          Pay with {method.name} &nbsp; →
        </button>
      </div>
    );
  }

  // Render Alternative Card
  return (
    <div className="reward-card card-alternative animate-fade-in" onClick={onClickCard}>
      <div className="card-header-row">
        <div className="method-meta">
          <span className="method-badge-icon" style={{ background: method.bgGradient, borderColor: method.borderColor }}>
            {method.badge}
          </span>
          <div>
            <h3 className="method-name">{method.name}</h3>
            <p className="method-type">Cashback Reward</p>
          </div>
        </div>
        <span className={`badge-trust-level ${trustClass}`}>{trustLabel}</span>
      </div>

      <div className="reward-display-row">
        <span className="reward-value">{formatCurrency(rewardAmount)}</span>
        {diffVsBest !== undefined && (
          <span className="diff-versus-best text-yellow">
            -{formatCurrency(diffVsBest)} vs best
          </span>
        )}
      </div>

      <div className="card-footer-condition">
        <span className="condition-warning-icon">⚠️</span>
        <span className="condition-text-snippet">
          {conditionsList.length > 0 ? conditionsList[0].text : 'Standard terms apply'}
        </span>
      </div>
    </div>
  );
}
