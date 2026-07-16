import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import evaluateEligibility from '../src/utils/evaluateEligibility.ts';
import { addPrediction, setOutcome, loadAll, corroborationFor, statsFor } from '../src/utils/verificationStore.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const programs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'card-programs.json'), 'utf8'));
const mccCatalog = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'mcc-catalog.json'), 'utf8'));

// In-memory storage so the test never touches real localStorage.
function fakeStorage() {
  let d = {};
  return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); } };
}

let pass = 0, fail = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (got: ${JSON.stringify(actual)}${ok ? '' : `, expected: ${JSON.stringify(expected)}`})`);
  ok ? pass++ : fail++;
};

console.log('=== Post-payment verification loop — verification ===\n');

const store = fakeStorage();
const pred = {
  cardId: 'hdfc_swiggy', cardName: 'Swiggy HDFC', merchantId: 'swiggy', merchantName: 'Swiggy',
  mcc: '5814', amount: 500, predictedVerdict: 'eligible', predictedRate: 0.1, predictedReward: 50,
};

// 1. add + persist
const rec = addPrediction(pred, store);
check('record created as pending', rec.outcome, 'pending');
check('loadAll returns 1', loadAll(store).length, 1);

// 2. set outcome
setOutcome(rec.id, 'received', 50, store);
check('outcome updated', loadAll(store)[0].outcome, 'received');

// 3. corroboration counts resolved outcomes
addPrediction(pred, store); setOutcome(loadAll(store)[0].id, 'received', 50, store);
addPrediction(pred, store); setOutcome(loadAll(store)[0].id, 'not_received', 0, store);
const c = corroborationFor('hdfc_swiggy', '5814', store);
check('corroboration received=2', c.received, 2);
check('corroboration notReceived=1', c.notReceived, 1);
check('corroboration total=3', c.total, 3);
check('stats corroborationRate ~0.667', Math.round(statsFor('hdfc_swiggy','5814',store).corroborationRate*100)/100, 0.67);

// 4. corroboration lifts/does not lift confidence in the engine
const today = new Date('2026-07-16');
const base = evaluateEligibility({ amount: 500, merchant: { id: 'swiggy', mcc: '5814', mccConfidence: 'medium' }, program: programs.hdfc_swiggy, mccCatalog, today });
const withPositive = evaluateEligibility({ amount: 500, merchant: { id: 'swiggy', mcc: '5814', mccConfidence: 'medium' }, program: programs.hdfc_swiggy, mccCatalog, today, corroboration: { received: 18, notReceived: 2, total: 20 } });
const withNegative = evaluateEligibility({ amount: 500, merchant: { id: 'swiggy', mcc: '5814', mccConfidence: 'medium' }, program: programs.hdfc_swiggy, mccCatalog, today, corroboration: { received: 2, notReceived: 18, total: 20 } });
check('positive corroboration raises confidence', withPositive.confidence.score > base.confidence.score, true);
check('negative corroboration lowers confidence', withNegative.confidence.score < base.confidence.score, true);
console.log(`      base=${base.confidence.score}  +corr=${withPositive.confidence.score}  -corr=${withNegative.confidence.score}`);
console.log(`      +corr basis: ${withPositive.confidence.basis}`);

// 5. too few samples -> no adjustment
const withFew = evaluateEligibility({ amount: 500, merchant: { id: 'swiggy', mcc: '5814', mccConfidence: 'medium' }, program: programs.hdfc_swiggy, mccCatalog, today, corroboration: { received: 1, notReceived: 1, total: 2 } });
check('under 3 samples = no change', withFew.confidence.score, base.confidence.score);

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail === 0 ? 0 : 1);
