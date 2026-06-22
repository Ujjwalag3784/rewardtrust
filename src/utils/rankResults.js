export default function rankResults(results) {
  if (!results || !Array.isArray(results)) {
    return [];
  }

  return [...results].sort((a, b) => {
    // 1. Send unavailable to the bottom
    if (a.isUnavailable && !b.isUnavailable) return 1;
    if (!a.isUnavailable && b.isUnavailable) return -1;
    if (a.isUnavailable && b.isUnavailable) return 0;

    // 2. Rank by reward amount descending
    if (b.rewardAmount !== a.rewardAmount) {
      return b.rewardAmount - a.rewardAmount;
    }

    // 3. Tie-breaker: rank by confidence score descending
    return b.confidenceScore - a.confidenceScore;
  });
}
