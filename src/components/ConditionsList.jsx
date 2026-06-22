import React from 'react';
import formatCurrency from '../utils/formatCurrency';

export default function ConditionsList({ calculation, spendAmount }) {
  const { rewardAmount, rate, conditionsList, isUnavailable } = calculation;

  if (isUnavailable) return null;

  // Filter conditions into requirements (yellow), benefits (green), exclusions (red)
  const requirements = conditionsList.filter(c => c.type === 'requirement');
  const benefits = conditionsList.filter(c => c.type === 'benefit' || c.type === 'info');
  const exclusions = conditionsList.filter(c => c.type === 'exclusion');

  return (
    <div className="calculation-details-card animate-fade-in">
      <h4 className="card-inner-title">CALCULATION</h4>
      
      {/* Math breakdown */}
      <div className="math-table">
        <div className="math-row">
          <span className="math-label">Spend amount</span>
          <span className="math-value">{formatCurrency(spendAmount)}</span>
        </div>
        <div className="math-row">
          <span className="math-label">Cashback rate</span>
          <span className="math-value">{(rate * 100).toFixed(2)}%</span>
        </div>
        <hr className="math-divider" />
        <div className="math-row math-highlight">
          <span className="math-label">Your reward</span>
          <span className="math-value text-emerald">{formatCurrency(rewardAmount)}</span>
        </div>
      </div>

      {/* Conditions list */}
      <div className="conditions-section">
        <h5 className="section-small-title">CONDITIONS</h5>
        <ul className="conditions-bullet-list">
          {requirements.map((cond, idx) => (
            <li key={idx} className="cond-bullet text-yellow">
              <span className="cond-icon">●</span> {cond.text}
            </li>
          ))}
          {benefits.map((cond, idx) => (
            <li key={idx} className="cond-bullet text-green">
              <span className="cond-icon">✓</span> {cond.text}
            </li>
          ))}
          {requirements.length === 0 && benefits.length === 0 && (
            <li className="cond-bullet text-muted">No specific conditions apply</li>
          )}
        </ul>
      </div>

      {/* Exclusions list */}
      <div className="exclusions-section">
        <h5 className="section-small-title">EXCLUSIONS</h5>
        <ul className="conditions-bullet-list">
          {exclusions.map((cond, idx) => (
            <li key={idx} className="cond-bullet text-red">
              <span className="cond-icon">●</span> {cond.text}
            </li>
          ))}
          {exclusions.length === 0 && (
            <li className="cond-bullet text-muted">
              <span className="cond-icon">●</span> Fuel, utilities, and wallet loads usually excluded
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
