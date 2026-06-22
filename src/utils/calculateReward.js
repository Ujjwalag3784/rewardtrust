export default function calculateReward(amount, merchant, methodId, rates, conditions, isPrime = true) {
  if (!merchant || !methodId || !rates) {
    return {
      rewardAmount: 0,
      rate: 0,
      isUnavailable: false,
      confidenceScore: 0,
      sourceType: 'N/A',
      lastVerified: 'N/A',
      conditionsList: [],
      verificationChain: []
    };
  }

  // 1. Find the rate entry
  // Look for merchant-specific first
  let matches = rates.filter(r => r.paymentMethodId === methodId && r.merchantId === merchant.id);

  // If not found, look for category-specific
  if (matches.length === 0) {
    matches = rates.filter(r => r.paymentMethodId === methodId && r.categoryId === merchant.category);
  }

  // If still not found, fallback to method-general (no merchant, no category)
  if (matches.length === 0) {
    matches = rates.filter(r => r.paymentMethodId === methodId && !r.merchantId && !r.categoryId);
  }

  // 2. Filter by minimum spend
  const validMatches = matches.filter(r => amount >= r.minSpend);

  // Pick the one with the highest minSpend (most specific slab)
  let bestEntry = null;
  if (validMatches.length > 0) {
    bestEntry = validMatches.reduce((prev, current) => (prev.minSpend > current.minSpend) ? prev : current);
  }

  if (!bestEntry) {
    return {
      rewardAmount: 0,
      rate: 0,
      isUnavailable: false,
      confidenceScore: 0,
      sourceType: 'N/A',
      lastVerified: 'N/A',
      conditionsList: [],
      verificationChain: []
    };
  }

  // 3. Determine if card is unavailable (e.g. Kiwi on Amazon has baseRate/premiumRate of 0)
  const isUnavailable = bestEntry.baseRate === 0 && bestEntry.premiumRate === 0;

  // 4. Calculate reward rate
  // If it's Amazon ICICI and Prime is checked
  let rate = bestEntry.baseRate;
  if (bestEntry.conditionIds.includes('prime_required')) {
    rate = isPrime ? bestEntry.premiumRate : 0.03; // fall back to 3% for non-prime
  } else if (bestEntry.premiumRate > bestEntry.baseRate) {
    rate = isPrime ? bestEntry.premiumRate : bestEntry.baseRate;
  }

  let rewardAmount = amount * rate;

  // 5. Apply capping if it exists
  if (bestEntry.maxCapping) {
    rewardAmount = Math.min(rewardAmount, bestEntry.maxCapping);
  }

  // 6. Map condition text
  const conditionsList = (bestEntry.conditionIds || []).map(cid => {
    const cond = conditions[cid] || { text: cid, type: 'info', icon: 'ℹ️' };
    return {
      id: cid,
      ...cond
    };
  });

  return {
    rewardAmount,
    rate,
    isUnavailable,
    confidenceScore: bestEntry.confidenceScore,
    sourceType: bestEntry.sourceType,
    lastVerified: bestEntry.lastVerified,
    conditionsList,
    verificationChain: bestEntry.verificationChain || [],
    rateEntryId: bestEntry.id
  };
}
