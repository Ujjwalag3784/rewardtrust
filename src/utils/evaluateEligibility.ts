/**
 * RewardTrust — Explainable, MCC-aware eligibility engine.
 *
 * For every lookup it returns a VERDICT (eligible | partial | ineligible | unknown),
 * a plain-language REASON, a computed CONFIDENCE (with basis), and the SOURCE +
 * freshness that back the decision. Nothing is fabricated. Pure function.
 */
import type {
  CardProgram,
  Confidence,
  Corroboration,
  EligibilityResult,
  EvaluateArgs,
  MccCatalog,
  MerchantRecord,
  Rule,
  RewardType,
  Verdict,
} from '../types';

const TIER_BASE_CONFIDENCE: Record<string, number> = {
  official: 90,
  faq: 78,
  community: 55,
  unverified: 35,
};

const MCC_CONFIDENCE_PENALTY: Record<string, number> = { high: 0, medium: 8, low: 18 };

function daysBetween(fromISO: string, today: Date): number | null {
  const a = new Date(fromISO);
  const b = today instanceof Date ? today : new Date(today);
  if (isNaN(a.getTime())) return null;
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

interface RuleContext {
  merchant: MerchantRecord;
  channel: string;
  amount: number;
  options: { isPrime?: boolean };
}

/** Does a rule apply, IGNORING mcc exclusion (so we can detect what was blocked)? */
function ruleAppliesIgnoringMcc(rule: Rule, { merchant, channel, amount, options }: RuleContext): boolean {
  const m = rule.match || {};
  if (rule.channels && !rule.channels.includes(channel as never)) return false;
  if (m.merchants !== undefined) {
    if (!Array.isArray(m.merchants) || !m.merchants.includes(merchant.id)) return false;
  }
  if (m.mccIn && merchant.mcc && !m.mccIn.includes(merchant.mcc)) return false;
  if (rule.requires === 'prime' && !options.isPrime) return false;
  if (rule.minSpend && amount < rule.minSpend) return false;
  return true;
}

interface ConfidenceArgs {
  program: CardProgram;
  merchant: Partial<MerchantRecord>;
  verdict: Verdict;
  today: Date;
  corroboration?: Corroboration | null;
}

function computeConfidence({ program, merchant, verdict, today, corroboration }: ConfidenceArgs): Confidence {
  const tier = program.source?.tier || 'unverified';
  let score = TIER_BASE_CONFIDENCE[tier] ?? 35;
  const basis: string[] = [`${tier} source`];

  const ageDays = program.source?.lastVerified ? daysBetween(program.source.lastVerified, today) : null;
  if (ageDays != null) {
    const agePenalty = Math.min(30, Math.floor(ageDays / 30) * 2);
    score -= agePenalty;
    if (agePenalty > 0) basis.push(`-${agePenalty} for data age (${ageDays}d)`);
  }

  const mccPenalty = MCC_CONFIDENCE_PENALTY[merchant.mccConfidence ?? ''] ?? 12;
  score -= mccPenalty;
  if (mccPenalty > 0) basis.push(`-${mccPenalty} for ${merchant.mccConfidence || 'unknown'} MCC certainty`);

  // Real post-payment outcomes (only when we have enough resolved samples).
  if (corroboration && corroboration.received + corroboration.notReceived >= 3) {
    const resolved = corroboration.received + corroboration.notReceived;
    const rate = corroboration.received / resolved;
    const weight = Math.min(1, resolved / 20);
    const adj = Math.round((rate - 0.5) * 2 * 15 * weight);
    score += adj;
    basis.push(`${adj >= 0 ? '+' : ''}${adj} from ${corroboration.received}/${resolved} confirmed outcomes`);
  }

  if (verdict === 'unknown') score = Math.min(score, 40);

  score = Math.max(5, Math.min(99, Math.round(score)));
  const band = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
  return { score, band, basis: basis.join('; '), ageDays };
}

function formatReward(amount: number, rewardType?: RewardType): string {
  if (rewardType === 'points') return `≈ ${amount} in CRED reward points`;
  if (rewardType === 'amazon_pay_balance') return `₹${amount} in Amazon Pay balance`;
  return `₹${amount} cashback`;
}

export default function evaluateEligibility({
  amount,
  merchant,
  program,
  mccCatalog = {} as MccCatalog,
  channel = 'online',
  options = {},
  today = new Date(),
  corroboration = null,
}: EvaluateArgs): EligibilityResult {
  const cardMeta = {
    cardId: program?.cardId,
    cardName: program?.cardName,
    rewardType: program?.rewardType,
    rewardUnitNote: program?.rewardUnitNote,
    source: {
      url: program?.source?.primaryUrl,
      tier: program?.source?.tier,
      lastVerified: program?.source?.lastVerified,
      note: program?.source?.note,
    },
    notes: program?.notes,
  };

  if (!merchant || !merchant.mcc) {
    const confidence = computeConfidence({ program, merchant: merchant || {}, verdict: 'unknown', today, corroboration });
    return {
      ...cardMeta,
      verdict: 'unknown',
      rewardAmount: 0,
      effectiveRate: 0,
      appliedRule: null,
      mcc: null,
      reason: 'No verified merchant category (MCC) is available, so the reward outcome cannot be confirmed.',
      confidence,
      cap: null,
      conditions: [],
    };
  }

  const mcc = merchant.mcc;
  const mccInfo = mccCatalog[mcc] || { mcc, label: `MCC ${mcc}`, friendlyCategory: null };

  let winner: Rule | null = null;
  let blockedHeadline: Rule | null = null;

  for (const rule of program.rules || []) {
    if (!ruleAppliesIgnoringMcc(rule, { merchant, channel, amount, options })) continue;
    const excludedHere = (rule.match?.mccNotIn || []).includes(mcc);
    if (!excludedHere) {
      if (!winner) winner = rule;
    } else if (rule.isHeadline && !blockedHeadline) {
      blockedHeadline = rule;
    }
  }

  if (!winner || winner.rate === 0) {
    const confidence = computeConfidence({ program, merchant, verdict: 'ineligible', today, corroboration });
    return {
      ...cardMeta,
      verdict: 'ineligible',
      rewardAmount: 0,
      effectiveRate: 0,
      appliedRule: winner ? { id: winner.id, label: winner.label, rate: 0 } : null,
      mcc,
      mccLabel: mccInfo.label,
      mccFriendly: mccInfo.friendlyCategory,
      reason: `Merchant classified as MCC ${mcc} (${mccInfo.label}), which is excluded from rewards under the ${program.cardName} terms. No reward will be earned.`,
      confidence,
      cap: null,
      conditions: winner?.conditions || ['exclusions_mcc'],
    };
  }

  const rate = winner.rate;
  let rewardAmount = amount * rate;
  let capApplied = false;
  let cap = null as EligibilityResult['cap'];
  if (winner.cap && rewardAmount > winner.cap) {
    cap = { value: winner.cap, period: winner.capPeriod || 'cycle', applied: true, needsVerification: !!winner.capNeedsVerification };
    rewardAmount = winner.cap;
    capApplied = true;
  } else if (winner.cap) {
    cap = { value: winner.cap, period: winner.capPeriod || 'cycle', applied: false, needsVerification: !!winner.capNeedsVerification };
  }
  rewardAmount = round2(rewardAmount);

  const droppedByExclusion = !!blockedHeadline && winner.rate < blockedHeadline.rate;
  let verdict: Verdict = 'eligible';
  let reason: string;

  if (droppedByExclusion && blockedHeadline) {
    verdict = 'partial';
    reason =
      `Merchant classified as MCC ${mcc} (${mccInfo.label}), which is excluded from the ` +
      `${(blockedHeadline.rate * 100).toFixed(1)}% "${blockedHeadline.label}" tier. ` +
      `It instead earns the ${(rate * 100).toFixed(1)}% base rate — ${formatReward(rewardAmount, program.rewardType)}.`;
  } else if (capApplied && cap) {
    verdict = 'partial';
    reason =
      `Merchant MCC ${mcc} (${mccInfo.label}) qualifies for ${(rate * 100).toFixed(1)}% via "${winner.label}", ` +
      `but the reward is capped at ₹${cap.value} per ${cap.period}, so you earn ${formatReward(rewardAmount, program.rewardType)}.`;
  } else {
    reason =
      `Merchant MCC ${mcc} (${mccInfo.label}) qualifies for ${(rate * 100).toFixed(1)}% via "${winner.label}" ` +
      `— ${formatReward(rewardAmount, program.rewardType)}.`;
  }

  const confidence = computeConfidence({ program, merchant, verdict, today, corroboration });

  return {
    ...cardMeta,
    verdict,
    rewardAmount,
    effectiveRate: rate,
    appliedRule: { id: winner.id, label: winner.label, rate },
    mcc,
    mccLabel: mccInfo.label,
    mccFriendly: mccInfo.friendlyCategory,
    reason,
    confidence,
    cap,
    conditions: winner.conditions || [],
  };
}
