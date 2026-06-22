import React, { useState } from 'react';

export default function ShareButton({ merchantName, spendAmount, bestMethodName, rewardAmount }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `I verified my payment reward on RewardTrust! Spending ₹${spendAmount} at ${merchantName} gets me ${rewardAmount} back via ${bestMethodName}. 🛡️ Verified against official terms.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="share-btn-wrapper">
      <button className="btn-secondary share-btn" onClick={handleShare}>
        {copied ? '✓ Reward Estimate Copied!' : '🔗 Share Verified Calculation'}
      </button>
    </div>
  );
}
