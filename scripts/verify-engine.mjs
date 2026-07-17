/**
 * Verification harness for the explainable eligibility engine.
 * Run: node scripts/verify-engine.mjs
 * No test framework needed — plain assertions with readable output.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import evaluateEligibility from '../src/utils/evaluateEligibility.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', p), 'utf8'));

const merchants = readJson('merchants.json');
const programs = readJson('card-programs.json');
const mccCatalog = readJson('mcc-catalog.json');

const merchant = (id) => merchants.find((m) => m.id === id);
const TODAY = new Date('2026-07-16'); // fixed for deterministic confidence

let pass = 0;
let fail = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (got: ${actual}${ok ? '' : `, expected: ${expected}`})`);
  ok ? pass++ : fail++;
}

console.log('=== RewardTrust explainable engine — verification ===\n');

// 1. THE flagship real-world case: Amazon (MCC 5262) on HDFC Swiggy -> excluded from 5%, drops to 1% base.
const r1 = evaluateEligibility({ amount: 2000, merchant: merchant('amazon'), program: programs.hdfc_swiggy, mccCatalog, today: TODAY });
check('Amazon x HDFC Swiggy verdict = partial', r1.verdict, 'partial');
check('Amazon x HDFC Swiggy rate = 1%', r1.effectiveRate, 0.01);
check('Amazon x HDFC Swiggy reward = 20', r1.rewardAmount, 20);
console.log(`      reason: ${r1.reason}\n`);

// 2. Contrast: same Amazon (5262) on SBI Cashback -> 5262 NOT excluded -> eligible 5%.
const r2 = evaluateEligibility({ amount: 2000, merchant: merchant('amazon'), program: programs.sbi_cashback, mccCatalog, today: TODAY });
check('Amazon x SBI verdict = eligible', r2.verdict, 'eligible');
check('Amazon x SBI rate = 5%', r2.effectiveRate, 0.05);
check('Amazon x SBI reward = 100', r2.rewardAmount, 100);
console.log(`      reason: ${r2.reason}\n`);

// 3. Swiggy on HDFC Swiggy -> 10% headline.
const r3 = evaluateEligibility({ amount: 500, merchant: merchant('swiggy'), program: programs.hdfc_swiggy, mccCatalog, today: TODAY });
check('Swiggy x HDFC Swiggy verdict = eligible', r3.verdict, 'eligible');
check('Swiggy x HDFC Swiggy rate = 10%', r3.effectiveRate, 0.10);
console.log(`      reason: ${r3.reason}\n`);

// 4. Prime vs non-Prime on Amazon Pay ICICI.
const r4a = evaluateEligibility({ amount: 1000, merchant: merchant('amazon'), program: programs.amazon_pay_icici, mccCatalog, options: { isPrime: true }, today: TODAY });
const r4b = evaluateEligibility({ amount: 1000, merchant: merchant('amazon'), program: programs.amazon_pay_icici, mccCatalog, options: { isPrime: false }, today: TODAY });
check('Amazon Pay ICICI Prime rate = 5%', r4a.effectiveRate, 0.05);
check('Amazon Pay ICICI non-Prime rate = 3%', r4b.effectiveRate, 0.03);

// 5. Cap makes it partial: SBI 5% online on a large spend hits the monthly cap.
const r5 = evaluateEligibility({ amount: 200000, merchant: merchant('zomato'), program: programs.sbi_cashback, mccCatalog, today: TODAY });
check('SBI large spend verdict = partial (capped)', r5.verdict, 'partial');
check('SBI capped reward = 5000', r5.rewardAmount, 5000);
console.log(`      reason: ${r5.reason}\n`);

// 6. Unknown MCC -> unknown verdict, no rupee promise.
const r6 = evaluateEligibility({ amount: 500, merchant: { id: 'mystery', name: 'Mystery', mcc: null }, program: programs.kiwi, mccCatalog, today: TODAY });
check('Unknown MCC verdict = unknown', r6.verdict, 'unknown');
check('Unknown MCC reward = 0', r6.rewardAmount, 0);

// 7. CRED reward type is points, not cash.
const r7 = evaluateEligibility({ amount: 1000, merchant: merchant('blinkit'), program: programs.cred, mccCatalog, today: TODAY });
check('CRED rewardType = points', r7.rewardType, 'points');
console.log(`      reason: ${r7.reason}\n`);

// 8b. New cards (10-card dataset) + reward valuation.
const fk = evaluateEligibility({ amount: 2000, merchant: merchant('flipkart'), program: programs.flipkart_axis, mccCatalog, today: TODAY });
check('Flipkart x Flipkart-Axis verdict = eligible', fk.verdict, 'eligible');
check('Flipkart x Flipkart-Axis rate = 5%', fk.effectiveRate, 0.05);

const mil = evaluateEligibility({ amount: 1000, merchant: merchant('amazon'), program: programs.hdfc_millennia, mccCatalog, today: TODAY });
check('Amazon x HDFC Millennia = eligible 5% partner', mil.verdict, 'eligible');
check('Amazon x HDFC Millennia rate = 5%', mil.effectiveRate, 0.05);

const sc = evaluateEligibility({ amount: 1000, merchant: merchant('amazon'), program: programs.sbi_simplyclick, mccCatalog, today: TODAY });
check('SimplyCLICK Amazon rewardType = points', sc.rewardType, 'points');
check('SimplyCLICK Amazon has reward points', sc.rewardPoints > 0, true);
check('SimplyCLICK Amazon has rupee value', sc.rewardValueInr > 0, true);
console.log(`      SimplyCLICK: ${sc.rewardPoints} pts (~₹${sc.rewardValueInr}) — ${sc.reason}`);

const fuel = evaluateEligibility({ amount: 1000, merchant: merchant('indianoil'), program: programs.sbi_cashback, mccCatalog, today: TODAY });
check('Fuel (MCC 5541) x SBI = ineligible', fuel.verdict, 'ineligible');
check('Fuel x SBI reward = 0', fuel.rewardAmount, 0);
console.log(`      ${fuel.reason}`);

const aceMcc = evaluateEligibility({ amount: 1000, merchant: merchant('walletload'), program: programs.axis_ace, mccCatalog, today: TODAY });
check('Wallet load (6540) x Axis ACE = ineligible', aceMcc.verdict, 'ineligible');

// 8. Confidence is computed (not hardcoded) and within band.
console.log(`      HDFC confidence: ${r1.confidence.score}/100 (${r1.confidence.band}) — ${r1.confidence.basis}`);
check('Confidence is a number 5..99', r1.confidence.score >= 5 && r1.confidence.score <= 99, true);

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail === 0 ? 0 : 1);
