/**
 * Shared reward-lookup wrapper used by both the manual flow (App) and the
 * AI assistant. It is a thin, deterministic bridge to the verified engine:
 * it never invents anything — every field comes from evaluateEligibility.
 */
import programsData from '../data/card-programs.json';
import mccCatalog from '../data/mcc-catalog.json';
import conditionsData from '../data/conditions.json';
import evaluateEligibility from './evaluateEligibility';
import { corroborationFor } from './verificationStore';
import { tierLabel, formatVerified } from './labels';
import type { CardProgram, EligibilityResult, MccCatalog, MerchantRecord } from '../types';

const programs = programsData as unknown as Record<string, CardProgram>;
const catalog = mccCatalog as unknown as MccCatalog;
const conditions = conditionsData as unknown as Record<string, { text: string; type: string; icon: string }>;

export type UiResult = EligibilityResult & {
  methodId: string;
  rate: number;
  confidenceScore: number;
  sourceType: string;
  lastVerified: string;
  conditionsList: Array<{ id: string; text?: string; type?: string; icon?: string }>;
  isUnavailable: boolean;
};

export function evaluateCard(
  methodId: string,
  merchant: MerchantRecord,
  amount: number,
  opts: { isPrime?: boolean } = {}
): UiResult | null {
  const program = programs[methodId];
  if (!program) return null;
  const corroboration = corroborationFor(methodId, merchant.mcc);
  const r = evaluateEligibility({
    amount, merchant, program, mccCatalog: catalog, channel: 'online', options: { isPrime: opts.isPrime }, corroboration,
  });
  const conditionsList = (r.conditions || []).map((cid) => ({
    id: cid, ...(conditions[cid] || { text: cid, type: 'info', icon: 'ℹ️' }),
  }));
  return {
    methodId, ...r,
    rate: r.effectiveRate,
    confidenceScore: r.confidence.score,
    sourceType: tierLabel(r.source?.tier),
    lastVerified: formatVerified(r.source?.lastVerified),
    conditionsList,
    isUnavailable: r.verdict === 'ineligible' || r.verdict === 'unknown',
  };
}

export function evaluateWallet(
  walletIds: string[],
  merchant: MerchantRecord,
  amount: number,
  opts: { isPrime?: boolean } = {}
): UiResult[] {
  return walletIds.map((id) => evaluateCard(id, merchant, amount, opts)).filter(Boolean) as UiResult[];
}
