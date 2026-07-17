import React, { useState } from 'react';
import formatCurrency from '../utils/formatCurrency';

const CONF = { high: 'trust-high', medium: 'trust-medium', low: 'trust-low' };

function rewardValue(r) {
  if (r.rewardType === 'points') return `≈ ${formatCurrency(r.rewardValueInr)} · ${r.rewardPoints} pts`;
  if (r.rewardType === 'amazon_pay_balance') return `${formatCurrency(r.rewardValueInr)} Amazon Pay`;
  return formatCurrency(r.rewardValueInr);
}

function CardRow({ r, method, onWhy, onTrack }) {
  return (
    <div className={`res-row verdict-${r.verdict}`}>
      <div className="res-row-main">
        <span className="method-badge-icon sm" style={{ background: method?.bgGradient, borderColor: method?.borderColor }}>{method?.badge}</span>
        <div className="res-row-text">
          <span className="res-card-name">{r.cardName || method?.name}</span>
          <span className="res-reason">{r.reason}</span>
        </div>
        <div className="res-row-value">
          {(r.verdict === 'eligible' || r.verdict === 'partial')
            ? <span className="res-value-amt">{rewardValue(r)}</span>
            : <span className="res-value-amt text-muted">{r.verdict === 'unknown' ? '—' : '₹0'}</span>}
          <span className={`res-conf ${CONF[r.confidence?.band] || 'trust-low'}`}>{r.confidence?.score}/100</span>
        </div>
      </div>
      <div className="res-row-actions">
        <button className="linkish res-why" onClick={() => onWhy(r)}>Why? ↗</button>
        {(r.verdict === 'eligible' || r.verdict === 'partial') && (
          <button className="linkish res-track" onClick={() => onTrack(r)}>Track</button>
        )}
      </div>
    </div>
  );
}

export default function ResultsScreen({ merchant, spendAmount, results, paymentMethods, onBack, onShowTrustReport, onTrackPrediction }) {
  const method = (id) => paymentMethods.find((m) => m.id === id);
  const willEarn = results.filter((r) => r.verdict === 'eligible' || r.verdict === 'partial')
    .sort((a, b) => b.rewardValueInr - a.rewardValueInr);
  const wontEarn = results.filter((r) => r.verdict === 'ineligible');
  const cantConfirm = results.filter((r) => r.verdict === 'unknown');

  const best = willEarn[0];

  return (
    <div className="screen-container">
      <div className="results-header-bar">
        <button className="back-btn" aria-label="Back" onClick={onBack}>←</button>
        <h2 className="header-title">Rewards</h2>
        <span className="bell-icon" aria-hidden="true">🛡️</span>
      </div>

      <div className="merchant-amount-subbar">
        <div className="subbar-unit">
          <span className="subbar-lbl">MERCHANT</span>
          <span className="subbar-val">{merchant?.fullName || merchant?.name}</span>
        </div>
        <div className="subbar-unit text-right">
          <span className="subbar-lbl">AMOUNT</span>
          <span className="subbar-val">{formatCurrency(spendAmount)}</span>
        </div>
      </div>

      <div className="results-body-container animate-slide-up">
        {merchant?.mcc ? (
          <div className="mcc-chip-row"><span className="mcc-chip">MCC {merchant.mcc}{merchant.mccConfidence ? ` · ${merchant.mccConfidence} certainty` : ''}</span></div>
        ) : (
          <div className="qr-error-box"><span>⚠️ Merchant category (MCC) unknown — rewards can't be confirmed for this merchant.</span></div>
        )}

        {best && (
          <div className="best-pick-banner">
            <span className="best-pick-lbl">👑 BEST FOR THIS PAYMENT</span>
            <span className="best-pick-card">{best.cardName} · <strong>{rewardValue(best)}</strong></span>
          </div>
        )}

        {willEarn.length > 0 && (
          <section className="res-group">
            <h4 className="section-label text-emerald">✓ WILL EARN ({willEarn.length})</h4>
            {willEarn.map((r) => <CardRow key={r.methodId} r={r} method={method(r.methodId)} onWhy={onShowTrustReport} onTrack={onTrackPrediction} />)}
          </section>
        )}

        {wontEarn.length > 0 && (
          <section className="res-group">
            <h4 className="section-label text-red">✕ WON'T EARN ({wontEarn.length})</h4>
            {wontEarn.map((r) => <CardRow key={r.methodId} r={r} method={method(r.methodId)} onWhy={onShowTrustReport} onTrack={onTrackPrediction} />)}
          </section>
        )}

        {cantConfirm.length > 0 && (
          <section className="res-group">
            <h4 className="section-label text-muted">? CAN'T CONFIRM ({cantConfirm.length})</h4>
            {cantConfirm.map((r) => <CardRow key={r.methodId} r={r} method={method(r.methodId)} onWhy={onShowTrustReport} onTrack={onTrackPrediction} />)}
          </section>
        )}
      </div>
    </div>
  );
}
