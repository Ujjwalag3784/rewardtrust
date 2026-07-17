/**
 * Deterministic NLU for RewardTrust — NO language model, so it cannot hallucinate.
 * It only classifies intent and extracts entities (amount, merchant, card, MCC)
 * from the user's text by matching against the *known* catalogs. Everything it
 * emits is structured; the verified engine produces every number downstream.
 */
import type { CardProgram, EligibilityResult, MerchantRecord } from '../types';

// Card aliases for matching free text -> card id.
const CARD_ALIASES: Record<string, string[]> = {
  kiwi: ['kiwi'],
  amazon_pay_icici: ['amazon pay icici', 'amazon pay', 'apay', 'icici amazon'],
  sbi_cashback: ['sbi cashback', 'cashback sbi'],
  hdfc_swiggy: ['hdfc swiggy', 'swiggy hdfc', 'swiggy card', 'swiggy credit'],
  cred: ['cred'],
  flipkart_axis: ['flipkart axis', 'axis flipkart', 'flipkart card'],
  axis_ace: ['axis ace', 'ace card', 'ace'],
  hdfc_millennia: ['hdfc millennia', 'millennia'],
  idfc_first_millennia: ['idfc first millennia', 'idfc first', 'idfc', 'first millennia'],
  sbi_simplyclick: ['simplyclick', 'simply click'],
};

export type Intent = 'lookup' | 'diagnose' | 'search';
export type InputConfidence = 'high' | 'medium' | 'low';

export interface ParsedQuery {
  intent: Intent;
  amountInr: number | null;
  merchant: MerchantRecord | null;
  merchantCandidates: MerchantRecord[];
  cardIds: string[];
  mcc: string | null;
  inputConfidence: InputConfidence;
  missing: string[];
}

function parseAmount(text: string): number | null {
  // ₹1,250 / rs 1250 / 1250 / inr 1250
  const m = text.match(/(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ''));
  return isNaN(n) || n <= 0 ? null : n;
}

function matchMerchants(text: string, merchants: MerchantRecord[]): MerchantRecord[] {
  const t = text.toLowerCase();
  const hits: MerchantRecord[] = [];
  for (const m of merchants) {
    const name = m.name.toLowerCase();
    const byName = t.includes(name);
    const byVpa = (m.vpaPatterns || []).some((p) => t.includes(String(p).toLowerCase()));
    if (byName || byVpa) hits.push(m);
  }
  // longest name first (so "amazon" doesn't beat a more specific match)
  return hits.sort((a, b) => b.name.length - a.name.length);
}

function matchCards(text: string): string[] {
  const t = text.toLowerCase();
  const ids: string[] = [];
  for (const [id, aliases] of Object.entries(CARD_ALIASES)) {
    if (aliases.some((a) => t.includes(a))) ids.push(id);
  }
  // de-dupe while keeping order
  return [...new Set(ids)];
}

export function parseQuery(text: string, merchants: MerchantRecord[] = []): ParsedQuery {
  const t = (text || '').toLowerCase();
  const amountInr = parseAmount(text);
  const merchantCandidates = matchMerchants(text, merchants);
  const merchant = merchantCandidates[0] || null;
  const cardIds = matchCards(text);
  const mccMatch = t.match(/mcc\s*([0-9]{3,4})/);
  const mcc = mccMatch ? mccMatch[1].padStart(4, '0') : null;

  const wantsWhy = /\b(why|didn'?t|not|no)\b/.test(t) && /(cashback|reward|point|earn)/.test(t);
  const intent: Intent = wantsWhy ? 'diagnose' : merchant || amountInr ? 'lookup' : 'search';

  let inputConfidence: InputConfidence = 'low';
  if (merchant) {
    const exact = t.includes(merchant.name.toLowerCase());
    inputConfidence = exact ? 'high' : 'medium';
  }

  const missing: string[] = [];
  if (intent === 'lookup') {
    if (!merchant) missing.push('merchant');
    if (!amountInr) missing.push('amount');
  } else if (intent === 'diagnose') {
    if (!merchant) missing.push('merchant');
    if (cardIds.length === 0) missing.push('card');
  } else {
    missing.push('merchant');
  }

  return { intent, amountInr, merchant, merchantCandidates, cardIds, mcc, inputConfidence, missing };
}

export interface DiagnosticItem {
  code: string;
  label: string;
  applies: boolean;
  detail: string;
}

/**
 * Explain, from the verified engine result, why a reward may not have posted.
 * Every "applies: true" item is grounded in the engine's own output.
 */
export function diagnose(result: EligibilityResult, amount: number, program?: CardProgram): DiagnosticItem[] {
  const items: DiagnosticItem[] = [];
  const excludedByMcc = result.verdict === 'ineligible';
  const downgraded = result.verdict === 'partial' && /excluded from the/.test(result.reason || '');
  const capped = !!(result.cap && result.cap.applied);

  items.push({
    code: 'mcc_excluded',
    label: 'Merchant category (MCC) excluded',
    applies: excludedByMcc,
    detail: excludedByMcc
      ? result.reason
      : `MCC ${result.mcc ?? '—'} is eligible for this card, so a full exclusion is not the cause.`,
  });

  items.push({
    code: 'headline_downgrade',
    label: 'Fell to base rate (headline tier excluded for this MCC)',
    applies: downgraded,
    detail: downgraded ? result.reason : 'The merchant qualified for the advertised tier (no downgrade).',
  });

  items.push({
    code: 'cap_reached',
    label: 'Monthly reward cap reached',
    applies: capped,
    detail: capped
      ? `This tier is capped at ₹${result.cap?.value} per ${result.cap?.period}; spends beyond the cap earn nothing.`
      : 'Your reward was within the monthly cap.',
  });

  // Minimum spend (from rule data, if any headline rule sets one).
  const minRule = (program?.rules || []).find((r) => r.isHeadline && r.minSpend && amount < r.minSpend);
  items.push({
    code: 'min_spend',
    label: 'Minimum spend not met',
    applies: !!minRule,
    detail: minRule ? `The "${minRule.label}" tier needs at least ₹${minRule.minSpend}.` : 'No minimum-spend threshold applied.',
  });

  // Informational reasons that RewardTrust cannot see but the user should check.
  items.push({
    code: 'payment_method',
    label: 'Reward-bearing card actually used?',
    applies: false,
    detail: 'Confirm you paid with this exact card (not a linked wallet, another card, or plain UPI) — the reward only applies to card spends.',
  });
  items.push({
    code: 'posting_delay',
    label: 'Reward posting delay',
    applies: false,
    detail: 'Cashback/points often post 1–2 billing cycles later. If everything above checks out, it may simply not have posted yet.',
  });

  // Applicable causes first.
  return items.sort((a, b) => Number(b.applies) - Number(a.applies));
}
