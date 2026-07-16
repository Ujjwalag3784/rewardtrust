// Shared domain types for RewardTrust.

export type Channel = 'online' | 'offline' | 'upi';
export type Verdict = 'eligible' | 'partial' | 'ineligible' | 'unknown';
export type ConfidenceBand = 'high' | 'medium' | 'low';
export type MccCertainty = 'high' | 'medium' | 'low';
export type SourceTier = 'official' | 'faq' | 'community' | 'unverified';
export type RewardType = 'cashback' | 'points' | 'amazon_pay_balance';
export type Outcome = 'pending' | 'received' | 'not_received' | 'partial';

export interface MerchantRecord {
  id: string;
  name: string;
  fullName?: string;
  category?: string | null;
  mcc: string | null;
  mccConfidence?: MccCertainty;
  mccNote?: string;
  vpaPatterns?: string[];
  logo?: string | null;
  icon?: string;
  accentColor?: string;
}

export interface MccInfo {
  mcc: string;
  label: string;
  friendlyCategory: string | null;
}
export type MccCatalog = Record<string, MccInfo>;

export interface RuleMatch {
  merchants?: string[];
  mccIn?: string[];
  mccNotIn?: string[];
}

export interface Rule {
  id: string;
  label: string;
  channels?: Channel[];
  match?: RuleMatch;
  rate: number;
  cap?: number;
  capPeriod?: string;
  capNeedsVerification?: boolean;
  minSpend?: number;
  isHeadline?: boolean;
  requires?: 'prime' | string;
  conditions?: string[];
}

export interface ProgramSource {
  primaryUrl?: string;
  helpUrl?: string;
  tier?: SourceTier;
  lastVerified?: string;
  note?: string;
}

export interface CardProgram {
  cardId: string;
  cardName: string;
  network?: string;
  rewardType: RewardType;
  rewardUnitNote?: string;
  source?: ProgramSource;
  rules?: Rule[];
  notes?: string;
}
export type CardPrograms = Record<string, CardProgram>;

export interface Corroboration {
  received: number;
  notReceived: number;
  total: number;
}

export interface Confidence {
  score: number;
  band: ConfidenceBand;
  basis: string;
  ageDays: number | null;
}

export interface CapInfo {
  value: number;
  period: string;
  applied: boolean;
  needsVerification: boolean;
}

export interface EligibilityResult {
  cardId?: string;
  cardName?: string;
  rewardType?: RewardType;
  rewardUnitNote?: string;
  source: {
    url?: string;
    tier?: SourceTier;
    lastVerified?: string;
    note?: string;
  };
  notes?: string;
  verdict: Verdict;
  rewardAmount: number;
  effectiveRate: number;
  appliedRule: { id: string; label: string; rate: number } | null;
  mcc: string | null;
  mccLabel?: string;
  mccFriendly?: string | null;
  reason: string;
  confidence: Confidence;
  cap: CapInfo | null;
  conditions: string[];
}

export interface EvaluateArgs {
  amount: number;
  merchant: MerchantRecord | null;
  program: CardProgram;
  mccCatalog?: MccCatalog;
  channel?: Channel;
  options?: { isPrime?: boolean };
  today?: Date;
  corroboration?: Corroboration | null;
}

export interface UpiParseResult {
  valid: boolean;
  raw: string;
  params: Record<string, string>;
  vpa: string | null;
  payeeName: string | null;
  mcc: string | null;
  amount: number | null;
  currency: string | null;
  isDynamic: boolean;
  error: string | null;
}

export interface MerchantResolution {
  vpa: string | null;
  payeeName: string | null;
  registryMatch: string | null;
  mcc: string | null;
  mccLabel: string | null;
  mccSource: 'qr' | 'registry' | 'none';
  confidence: MccCertainty;
  isDynamic: boolean;
  amount: number | null;
  notes: string[];
}

export interface ResolveResult {
  ok: boolean;
  error?: string;
  merchant: MerchantRecord | null;
  resolution: MerchantResolution | null;
}

export interface VerificationRecord {
  id: string;
  ts: string;
  outcome: Outcome;
  actualReward: number | null;
  resolvedTs?: string;
  cardId: string;
  cardName: string;
  merchantId?: string;
  merchantName?: string;
  mcc: string | null;
  amount: number;
  predictedVerdict: Verdict;
  predictedRate: number;
  predictedReward: number;
  source?: string | null;
}

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
