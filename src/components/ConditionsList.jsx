import React from 'react';
import formatCurrency from '../utils/formatCurrency';

const VERDICT_ICON = { eligible: '✓', partial: '◐', ineligible: '✕', unknown: '?' };

export default function ConditionsList({ calculation, spendAmount }) {
  const { rewardAmount, rate, conditionsList = [], verdict = 'unknown', reason, mcc, mccLabel } = calculation;
  const hasReward = verdict === 'eligible' || verdict === 'partial';

  const requirements = conditionsList.filter((c) => c.type === 'requirement');
  const benefits = conditionsList.filter((c) => c.type === 'benefit' || c.type === 'info');
  const exclusions = conditionsList.filter((c) => c.type === 'exclusion');

  return (
    <div className="calculation-details-card animate-fade-in">
      {/* Verdict + reason header */}
      <div className={`calc-verdict-header verdict-${verdict}`}>
        <span className="calc-verdict-icon">{VERDICT_ICON[verdict] || '?'}</span>
        <div>
          <span className="calc-verdict-label">{verdict.toUpperCase()}</span>
          <p className="calc-verdict-reason">{reason}</p>
        </div>
      </div>

      {mcc && (
        <div className="mcc-chip-row">
          <span className="mcc-chip">MCC {mcc} · {mccLabel}</span>
        </div>
      )}

      {hasReward && (
        <>
          <h4 className="card-inner-title">CALCULATION</h4>
          <div className="math-table">
            <div className="math-row">
              <span className="math-label">Spend amount</span>
              <span className="math-value">{formatCurrency(spendAmount)}</span>
            </div>
            <div className="math-row">
              <span className="math-label">Reward rate</span>
              <span className="math-value">{(rate * 100).toFixed(2)}%</span>
            </div>
            <hr className="math-divider" />
            <div className="math-row math-highlight">
              <span className="math-label">Your reward</span>
              <span className="math-value text-emerald">{formatCurrency(rewardAmount)}</span>
            </div>
          </div>
        </>
      )}

      {(requirements.length > 0 || benefits.length > 0) && (
        <div className="conditions-section">
          <h5 className="section-small-title">CONDITIONS</h5>
          <ul className="conditions-bullet-list">
            {requirements.map((cond, idx) => (
              <li key={`r${idx}`} className="cond-bullet text-yellow">
                <span className="cond-icon">●</span> {cond.text}
              </li>
            ))}
            {benefits.map((cond, idx) => (
              <li key={`b${idx}`} className="cond-bullet text-green">
                <span className="cond-icon">✓</span> {cond.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {exclusions.length > 0 && (
        <div className="exclusions-section">
          <h5 className="section-small-title">EXCLUSIONS</h5>
          <ul className="conditions-bullet-list">
            {exclusions.map((cond, idx) => (
              <li key={`e${idx}`} className="cond-bullet text-red">
                <span className="cond-icon">●</span> {cond.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
