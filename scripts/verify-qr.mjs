import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import parseUpiQr from '../src/utils/parseUpiQr.ts';
import resolveMerchant from '../src/utils/resolveMerchant.ts';
import evaluateEligibility from '../src/utils/evaluateEligibility.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', p), 'utf8'));
const merchants = readJson('merchants.json');
const programs = readJson('card-programs.json');
const mccCatalog = readJson('mcc-catalog.json');

let pass = 0, fail = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (got: ${actual}${ok ? '' : `, expected: ${expected}`})`);
  ok ? pass++ : fail++;
};

console.log('=== UPI QR parse + resolve — verification ===\n');

// 1. Amazon QR with mc=5262 -> MCC read from QR, high confidence.
const a = resolveMerchant(parseUpiQr('upi://pay?pa=amazon@apl&pn=Amazon&mc=5262&am=2000&cu=INR'), merchants, mccCatalog);
check('Amazon QR mcc = 5262', a.resolution.mcc, '5262');
check('Amazon QR mccSource = qr', a.resolution.mccSource, 'qr');
check('Amazon QR confidence = high', a.resolution.confidence, 'high');
check('Amazon QR dynamic', a.resolution.isDynamic, true);
// Feed into engine on HDFC Swiggy -> the real 5262 exclusion still fires.
const aEval = evaluateEligibility({ amount: 2000, merchant: a.merchant, program: programs.hdfc_swiggy, mccCatalog });
check('Scanned Amazon x HDFC = partial', aEval.verdict, 'partial');
console.log(`      ${aEval.reason}\n`);

// 2. Zepto QR WITHOUT mc -> inferred from VPA handle (zeptonow), medium confidence.
const z = resolveMerchant(parseUpiQr('upi://pay?pa=zeptonow@ybl&pn=Zepto&am=350&cu=INR'), merchants, mccCatalog);
check('Zepto VPA match id = zepto', z.resolution.registryMatch, 'zepto');
check('Zepto mccSource = registry', z.resolution.mccSource, 'registry');
check('Zepto confidence = medium', z.resolution.confidence, 'medium');
check('Zepto mcc = 5411', z.resolution.mcc, '5411');
console.log('');

// 3. P2P / unknown VPA -> no MCC, low confidence, engine returns unknown.
const p = resolveMerchant(parseUpiQr('upi://pay?pa=rahul.kumar@oksbi&pn=Rahul Kumar&am=100&cu=INR'), merchants, mccCatalog);
check('P2P no registry match', p.resolution.registryMatch, null);
check('P2P mcc = null', p.resolution.mcc, null);
check('P2P confidence = low', p.resolution.confidence, 'low');
const pEval = evaluateEligibility({ amount: 100, merchant: p.merchant, program: programs.kiwi, mccCatalog });
check('P2P engine verdict = unknown', pEval.verdict, 'unknown');
console.log('');

// 4. Static QR (no am) -> isDynamic false.
const s = parseUpiQr('upi://pay?pa=swiggy.stores@axb&pn=Swiggy&mc=5814');
check('Static QR isDynamic = false', s.isDynamic, false);
check('Static QR mcc = 5814', s.mcc, '5814');

// 5. Non-UPI input rejected.
const bad = parseUpiQr('https://evil.example.com/pay');
check('Non-UPI rejected', bad.valid, false);

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail === 0 ? 0 : 1);
