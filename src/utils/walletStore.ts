/**
 * Client-side identity + card wallet (localStorage, injectable for tests).
 * No real auth/backend — the mobile number is a lightweight demo login and the
 * wallet is the list of card IDs the user says they own. Every lookup runs
 * against this wallet.
 */
import type { KeyValueStorage } from '../types';

const KEY_PHONE = 'rewardtrust.phone';
const KEY_WALLET = 'rewardtrust.wallet';

const memoryStore: KeyValueStorage = (() => {
  const d: Record<string, string> = {};
  return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); } };
})();

function storage(): KeyValueStorage {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) return localStorage as KeyValueStorage;
  } catch {
    /* privacy mode */
  }
  return memoryStore;
}

export function getPhone(s: KeyValueStorage = storage()): string | null {
  return s.getItem(KEY_PHONE);
}

export function setPhone(phone: string, s: KeyValueStorage = storage()): void {
  s.setItem(KEY_PHONE, phone);
}

export function getWallet(s: KeyValueStorage = storage()): string[] {
  try {
    const raw = s.getItem(KEY_WALLET);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setWallet(cardIds: string[], s: KeyValueStorage = storage()): void {
  s.setItem(KEY_WALLET, JSON.stringify(cardIds));
}

export function isOnboarded(s: KeyValueStorage = storage()): boolean {
  return !!getPhone(s) && getWallet(s).length > 0;
}

export function signOut(s: KeyValueStorage = storage()): void {
  s.setItem(KEY_PHONE, '');
  s.setItem(KEY_WALLET, '[]');
}

export default { getPhone, setPhone, getWallet, setWallet, isOnboarded, signOut };
