import React from 'react';
import formatCurrency from '../utils/formatCurrency';
import { tierLabel, formatVerified } from '../utils/labels';

const VERDICT_META = {
  eligible: { label: 'ELIGIBLE', cls: 'text-emerald' },
  partial: { label: 'PARTIAL', cls: 'text-yellow' },
  ineligible: { label: 'NOT ELIGIBLE', cls: 'text-red' },
  unknown: { label: 'UNKNOWN', cls: 'text-muted' },
};

export default function TrustReportScreen({ report, method, spendAmount, onBack }) {
  if (!report) return <div className="screen-container">No report available</div>;

  const score = report.confidence?.score ?? report.confidenceScore ?? 0;
  const band = report.confidence?.band || (score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low');
  const basisFactors = (report.confidence?.basis || '').split(';').map((s) => s.trim()).filter(Boolean);
  const ageDays = report.confidence?.ageDays;
  const source = report.source || {};
  const verdict = report.verdict || 'unknown';

  const trustLabel = band === 'high' ? 'HIGH CONFIDENCE' : band === 'medium' ? 'MEDIUM CONFIDENCE' : 'LOW CONFIDENCE';
  const trustColorClass = band === 'high' ? 'text-emerald' : band === 'medium' ? 'text-yellow' : 'text-red';
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;
  const vMeta = VERDICT_META[verdict] || VERDICT_META.unknown;

  return (
    <div className="screen-container trust-report-screen">
      <div className="results-header-bar">
        <button className="back-btn" aria-label="Back to results" onClick={onBack}>←</button>
        <h2 className="header-title">Trust Report</h2>
        <span className="bell-icon" aria-hidden="true">🔔</span>
      </div>

      <div className="trust-meta-subbar">
        <div className="subbar-unit">
          <span className="subbar-lbl">FOR RECOMMENDATION</span>
          <span className="subbar-val">{method?.name} · {formatCurrency(spendAmount)}</span>
        </div>
        <div className="subbar-unit text-right">
          <span className="subbar-lbl">REPORT ID</span>
          <span className="subbar-val">#RT-{report.methodId}-{report.mcc || 'na'}</span>
        </div>
      </div>

      <div className="trust-body animate-slide-up">
        <div className="trust-verdict-card">
          <div className="verdict-text-block">
            <div className="verdict-lbl">TRUST VERDICT</div>
            <h1 className={`verdict-title ${trustColorClass}`}>{trustLabel}</h1>
            <p className="verdict-desc">
              Verdict: <strong className={vMeta.cls}>{vMeta.label}</strong> · {tierLabel(source.tier)}
            </p>
          </div>
          <div className="gauge-wrapper">
            <svg width="100" height="100" className="circular-gauge" role="img" aria-label={`Confidence ${score} of 100`}>
              <circle cx="50" cy="50" r="40" className="gauge-bg" />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`gauge-bar ${trustColorClass}-stroke`}
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="gauge-score-value">{score}<span>/100</span></div>
          </div>
        </div>

        <div className="breakdown-card">
          <div className="breakdown-header">
            <span className="breakdown-lbl">WHY THIS VERDICT</span>
          </div>
          <p className="verdict-reason-text">{report.reason}</p>
          {report.mcc && (
            <div className="mcc-chip-row">
              <span className="mcc-chip">MCC {report.mcc} · {report.mccLabel}</span>
              {report.appliedRule && <span className="mcc-chip">Rule: {report.appliedRule.label}</span>}
            </div>
          )}
          {report.cap && report.cap.applied && (
            <p className="step-details">
              Reward capped at ₹{report.cap.value} per {report.cap.period}
              {report.cap.needsVerification ? ' (cap value needs re-verification)' : ''}.
            </p>
          )}
        </div>

        <div className="breakdown-card">
          <div className="breakdown-header">
            <span className="breakdown-lbl">CONFIDENCE BREAKDOWN</span>
            <span className={`breakdown-pts ${trustColorClass}`}>{score} pts</span>
          </div>
          <ul className="conditions-bullet-list">
            {basisFactors.map((f, idx) => (
              <li key={idx} className="cond-bullet text-muted">
                <span className="cond-icon" aria-hidden="true">•</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="source-quality-card">
          <h4 className="timeline-section-title">SOURCE</h4>
          <div className="sources-list">
            <div className="source-row">
              <span className="source-indicator green" aria-hidden="true">🛡️</span>
              {source.url ? (
                <a className="source-link-text" href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.url.replace(/^https?:\/\//, '').slice(0, 46)}… ↗
                </a>
              ) : (
                <span className="source-link-text">No source URL on file</span>
              )}
              <span className="source-tier-badge primary">{tierLabel(source.tier).toUpperCase()}</span>
            </div>
            {source.note && <p className="step-details">{source.note}</p>}
            {report.notes && <p className="step-details">{report.notes}</p>}
          </div>
        </div>

        <div className="freshness-card">
          <div className="freshness-row">
            <div>
              <span className="freshness-lbl">LAST VERIFIED (SOURCE)</span>
              <h3 className="freshness-date">{formatVerified(source.lastVerified)}</h3>
            </div>
            <span className="freshness-status-badge">
              {ageDays != null ? `${ageDays} days old` : 'age unknown'}
            </span>
          </div>
          {ageDays != null && ageDays > 90 && (
            <div className="next-sched-row">
              <span>⚠️ Source data is over 90 days old — reward terms may have changed. Re-verify before large spends.</span>
            </div>
          )}
        </div>

        <div className="methodology-card">
          <h4 className="methodology-title">How this confidence is calculated</h4>
          <ul className="methodology-points">
            <li>
              <span className="bullet-num">1</span>
              <div><strong>Source tier:</strong> official terms score higher than FAQs or community reports.</div>
            </li>
            <li>
              <span className="bullet-num">2</span>
              <div><strong>Data age:</strong> confidence decays as the last-verified date gets older.</div>
            </li>
            <li>
              <span className="bullet-num">3</span>
              <div><strong>MCC certainty:</strong> an uncertain merchant category code lowers confidence, because the reward hinges on the MCC the issuer actually uses.</div>
            </li>
            <li>
              <span className="bullet-num">4</span>
              <div><strong>Live outcomes:</strong> confirmed post-payment results (from History) nudge the score up or down.</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
