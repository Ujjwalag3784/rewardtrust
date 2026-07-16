import React, { useState } from 'react';
import RewardCard from './RewardCard';
import ConditionsList from './ConditionsList';
import ShareButton from './ShareButton';
import formatCurrency from '../utils/formatCurrency';

export default function ResultsRanking({
  merchant,
  spendAmount,
  rankedResults,
  paymentMethods,
  onBack,
  onShowTrustReport,
  onTrackPrediction
}) {
  // Track which card is currently inspected (default to the top ranked card)
  const [selectedMethodId, setSelectedMethodId] = useState(
    rankedResults.length > 0 ? rankedResults[0].methodId : null
  );

  const activeResult = rankedResults.find(r => r.methodId === selectedMethodId) || rankedResults[0];
  const activeMethod = paymentMethods.find(m => m.id === activeResult.methodId);

  // Separate the active card (to show on top) and alternatives (listed below)
  const alternatives = rankedResults.filter(r => r.methodId !== activeResult.methodId);

  // Overall best reward amount (first item, since sorted)
  const bestRewardAmount = rankedResults.length > 0 ? rankedResults[0].rewardAmount : 0;

  return (
    <div className="screen-container">
      {/* Header status bar */}
      <div className="results-header-bar">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2 className="header-title">Results</h2>
        <span className="bell-icon">🔔</span>
      </div>

      {/* Merchant / Amount row */}
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
        {/* Top Recommendation (Selected Card) */}
        <div className="section-header-row">
          <span className="section-label">
            {activeResult.methodId === rankedResults[0]?.methodId ? 'BEST RECOMMENDATION' : 'SELECTED OPTION'}
          </span>
        </div>

        {activeMethod && (
          <RewardCard
            method={activeMethod}
            calculation={activeResult}
            isBest={true}
            spendAmount={spendAmount}
            merchantName={merchant?.name}
            onWhyTrustClick={() => onShowTrustReport(activeResult)}
          />
        )}

        {/* Calculation Breakdown & Conditions */}
        <ConditionsList calculation={activeResult} spendAmount={spendAmount} />

        {/* Share Button */}
        {!activeResult.isUnavailable && (
          <ShareButton
            merchantName={merchant?.name}
            spendAmount={spendAmount}
            bestMethodName={activeMethod?.name}
            rewardAmount={formatCurrency(activeResult.rewardAmount)}
          />
        )}

        {/* Track this reward — feeds the post-payment verification loop */}
        {onTrackPrediction && !activeResult.isUnavailable && (
          <button className="btn-track-reward" onClick={() => onTrackPrediction(activeResult)}>
            ＋ Track this reward (tell us if it posts)
          </button>
        )}

        {/* Alternatives Section */}
        {alternatives.length > 0 && (
          <div className="alternatives-section">
            <h4 className="section-label">ALTERNATIVES</h4>
            <div className="alternatives-list">
              {alternatives.map((res) => {
                const method = paymentMethods.find(m => m.id === res.methodId);
                const diff = bestRewardAmount - res.rewardAmount;
                return (
                  <RewardCard
                    key={res.methodId}
                    method={method}
                    calculation={res}
                    isAlternative={true}
                    diffVsBest={res.isUnavailable ? undefined : diff}
                    spendAmount={spendAmount}
                    merchantName={merchant?.name}
                    onClickCard={() => setSelectedMethodId(res.methodId)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Trust Indicators Card — backed by real source metadata */}
        <div className="trust-indicators-card animate-fade-in">
          <h4 className="section-label">TRUST INDICATORS</h4>
          <div className="trust-table">
            <div className="trust-row">
              <span className="trust-cell-lbl">Official Source</span>
              {activeResult.source?.url ? (
                <a
                  className="trust-cell-val link-emerald"
                  href={activeResult.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {activeResult.sourceType} ↗
                </a>
              ) : (
                <span className="trust-cell-val">{activeResult.sourceType}</span>
              )}
            </div>
            <div className="trust-row">
              <span className="trust-cell-lbl">Last Verified</span>
              <span className="trust-cell-val">{activeResult.lastVerified}</span>
            </div>
            <div className="trust-row">
              <span className="trust-cell-lbl">Confidence</span>
              <span className="trust-cell-val">
                {activeResult.confidence?.score ?? 0}/100 ({activeResult.confidence?.band})
              </span>
            </div>
            <div className="trust-row">
              <span className="trust-cell-lbl">Merchant MCC</span>
              <span className="trust-cell-val">
                {activeResult.mcc ? `${activeResult.mcc} · ${activeResult.mccLabel}` : 'Unknown'}
              </span>
            </div>
            <div className="trust-row">
              <span className="trust-cell-lbl">Full report</span>
              <button type="button" className="trust-cell-val link-emerald linkish" onClick={() => onShowTrustReport(activeResult)}>
                View Trust Report →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
