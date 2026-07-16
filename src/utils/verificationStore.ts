/**
 * Post-payment verification loop.
 * Logs a prediction as `pending`; the user later records the real outcome, which
 * becomes a corroboration signal that feeds the confidence score. Storage is
 * injectable for tests; in the browser it uses localStorage with an in-memory fallback.
 */
import type { Corroboration, KeyValueStorage, Outcome, VerificationRecord } from '../types';

const KEY = 'rewardtrust.verifications';

const memoryStore: KeyValueStorage = (() => {
  const data: Record<string, string> = {};
  return {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = String(v);
    },
  };
})();

function defaultStorage(): KeyValueStorage {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) return localStorage as KeyValueStorage;
  } catch {
    /* access denied (SSR / privacy mode) */
  }
  return memoryStore;
}

export function loadAll(storage: KeyValueStorage = defaultStorage()): VerificationRecord[] {
  try {
    const raw = storage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveAll(list: VerificationRecord[], storage: KeyValueStorage = defaultStorage()): void {
  try {
    storage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore quota / access errors */
  }
}

let counter = 0;
function newId(): string {
  counter += 1;
  return `v_${Date.now()}_${counter}`;
}

export interface PredictionInput {
  cardId: string;
  cardName: string;
  merchantId?: string;
  merchantName?: string;
  mcc?: string | null;
  amount: number;
  predictedVerdict: VerificationRecord['predictedVerdict'];
  predictedRate: number;
  predictedReward: number;
  source?: string | null;
}

export function addPrediction(pred: PredictionInput, storage: KeyValueStorage = defaultStorage()): VerificationRecord {
  const list = loadAll(storage);
  const record: VerificationRecord = {
    id: newId(),
    ts: new Date().toISOString(),
    outcome: 'pending',
    actualReward: null,
    cardId: pred.cardId,
    cardName: pred.cardName,
    merchantId: pred.merchantId,
    merchantName: pred.merchantName,
    mcc: pred.mcc ?? null,
    amount: pred.amount,
    predictedVerdict: pred.predictedVerdict,
    predictedRate: pred.predictedRate,
    predictedReward: pred.predictedReward,
    source: pred.source ?? null,
  };
  list.unshift(record);
  saveAll(list, storage);
  return record;
}

export function setOutcome(
  id: string,
  outcome: Outcome,
  actualReward: number | null = null,
  storage: KeyValueStorage = defaultStorage()
): VerificationRecord | null {
  const list = loadAll(storage);
  const rec = list.find((r) => r.id === id);
  if (rec) {
    rec.outcome = outcome;
    rec.actualReward = actualReward;
    rec.resolvedTs = new Date().toISOString();
    saveAll(list, storage);
  }
  return rec || null;
}

export function removeRecord(id: string, storage: KeyValueStorage = defaultStorage()): void {
  saveAll(loadAll(storage).filter((r) => r.id !== id), storage);
}

export function corroborationFor(
  cardId: string,
  mcc: string | null,
  storage: KeyValueStorage = defaultStorage()
): Corroboration {
  const list = loadAll(storage).filter((r) => r.cardId === cardId && (mcc == null || r.mcc === mcc));
  let received = 0;
  let notReceived = 0;
  for (const r of list) {
    if (r.outcome === 'received' || r.outcome === 'partial') received += 1;
    else if (r.outcome === 'not_received') notReceived += 1;
  }
  return { received, notReceived, total: received + notReceived };
}

export function statsFor(
  cardId: string,
  mcc: string | null,
  storage: KeyValueStorage = defaultStorage()
): Corroboration & { corroborationRate: number | null } {
  const c = corroborationFor(cardId, mcc, storage);
  return { ...c, corroborationRate: c.total > 0 ? c.received / c.total : null };
}

export default { loadAll, addPrediction, setOutcome, removeRecord, corroborationFor, statsFor };
