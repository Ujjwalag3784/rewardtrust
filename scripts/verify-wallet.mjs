import { getPhone, setPhone, getWallet, setWallet, isOnboarded, signOut } from '../src/utils/walletStore.ts';

function fake() { const d = {}; return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); } }; }
let pass = 0, fail = 0;
const check = (n, a, e) => { const ok = a === e; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n} (got ${JSON.stringify(a)})`); ok ? pass++ : fail++; };

console.log('=== Wallet store — verification ===\n');
const s = fake();
check('starts not onboarded', isOnboarded(s), false);
setPhone('9876543210', s);
check('phone persists', getPhone(s), '9876543210');
check('still not onboarded (no cards)', isOnboarded(s), false);
setWallet(['sbi_cashback', 'hdfc_millennia'], s);
check('wallet persists (2 cards)', getWallet(s).length, 2);
check('now onboarded', isOnboarded(s), true);
signOut(s);
check('sign out clears wallet', getWallet(s).length, 0);
check('sign out => not onboarded', isOnboarded(s), false);

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail === 0 ? 0 : 1);
