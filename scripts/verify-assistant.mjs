import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import evaluateEligibility from '../src/utils/evaluateEligibility.ts';
import { parseQuery, diagnose } from '../src/utils/assistant.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', p), 'utf8'));
const merchants = readJson('merchants.json');
const programs = readJson('card-programs.json');
const mccCatalog = readJson('mcc-catalog.json');
const M = (id) => merchants.find((m) => m.id === id);

let pass = 0, fail = 0;
const check = (n, a, e) => { const ok = a === e; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n} (got ${JSON.stringify(a)})`); ok ? pass++ : fail++; };

console.log('=== AI assistant (deterministic NLU) — verification ===\n');

// 1. NL payment lookup parse.
const q1 = parseQuery('Paying ₹1,250 at Starbucks on HDFC Swiggy', merchants);
check('intent = lookup', q1.intent, 'lookup');
check('amount = 1250', q1.amountInr, 1250);
check('merchant = starbucks', q1.merchant?.id, 'starbucks');
check('card matched = hdfc_swiggy', q1.cardIds.includes('hdfc_swiggy'), true);
check('input confidence high', q1.inputConfidence, 'high');

// 2. Diagnose intent parse.
const q2 = parseQuery("Why didn't I get cashback at Amazon on HDFC Swiggy?", merchants);
check('intent = diagnose', q2.intent, 'diagnose');
check('diagnose merchant = amazon', q2.merchant?.id, 'amazon');
check('diagnose card = hdfc_swiggy', q2.cardIds.includes('hdfc_swiggy'), true);

// 3. Diagnosis grounded in engine: Amazon (5262) on HDFC Swiggy = downgrade, not full exclusion.
const r = evaluateEligibility({ amount: 2000, merchant: M('amazon'), program: programs.hdfc_swiggy, mccCatalog });
const items = diagnose(r, 2000, programs.hdfc_swiggy);
const downgrade = items.find((i) => i.code === 'headline_downgrade');
const excluded = items.find((i) => i.code === 'mcc_excluded');
check('headline downgrade applies', downgrade.applies, true);
check('full MCC exclusion does NOT apply', excluded.applies, false);
console.log(`      → ${downgrade.detail}`);

// 4. Fuel on SBI = full MCC exclusion applies.
const rf = evaluateEligibility({ amount: 1000, merchant: M('indianoil'), program: programs.sbi_cashback, mccCatalog });
const itemsF = diagnose(rf, 1000, programs.sbi_cashback);
check('fuel: mcc_excluded applies', itemsF.find((i) => i.code === 'mcc_excluded').applies, true);

// 5. Amount-only / no merchant => needs merchant.
const q3 = parseQuery('hello there', merchants);
check('no merchant => search', q3.intent, 'search');
check('missing includes merchant', q3.missing.includes('merchant'), true);

// 6. "₹800 at Zomato" => lookup, no card specified.
const q4 = parseQuery('₹800 at Zomato', merchants);
check('zomato lookup amount 800', q4.amountInr, 800);
check('zomato merchant', q4.merchant?.id, 'zomato');
check('no card => cardIds empty', q4.cardIds.length, 0);

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail === 0 ? 0 : 1);
