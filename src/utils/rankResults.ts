import type { Verdict } from '../types';

interface Rankable {
  verdict?: Verdict;
  rewardAmount: number;
  confidence?: { score: number };
  confidenceScore?: number;
}

// Trust-first ranking: a guaranteed reward should outrank a larger-but-excluded one.
const VERDICT_WEIGHT: Record<string, number> = {
  eligible: 0,
  partial: 1,
  unknown: 2,
  ineligible: 3,
};

function verdictWeight(r: Rankable): number {
  return VERDICT_WEIGHT[r.verdict ?? 'ineligible'] ?? 3;
}

function confidenceOf(r: Rankable): number {
  return (r.confidence && r.confidence.score) || r.confidenceScore || 0;
}

export default function rankResults<T extends Rankable>(results: T[]): T[] {
  if (!results || !Array.isArray(results)) return [];
  return [...results].sort((a, b) => {
    const wa = verdictWeight(a);
    const wb = verdictWeight(b);
    if (wa !== wb) return wa - wb;
    if (b.rewardAmount !== a.rewardAmount) return b.rewardAmount - a.rewardAmount;
    return confidenceOf(b) - confidenceOf(a);
  });
}
