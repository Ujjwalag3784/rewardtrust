/**
 * Parse a UPI QR payload per the NPCI UPI Deep-Linking Specification.
 * Relevant params: pa (VPA), pn (name), mc (MCC), am (amount => dynamic), cu, tn, tr, mode, sign.
 * `mc` is decisive: when present, the MCC that drives reward eligibility is in the QR.
 */
import type { UpiParseResult } from '../types';

export function parseUpiQr(raw: string): UpiParseResult {
  const result: UpiParseResult = {
    valid: false,
    raw: raw || '',
    params: {},
    vpa: null,
    payeeName: null,
    mcc: null,
    amount: null,
    currency: null,
    isDynamic: false,
    error: null,
  };

  if (!raw || typeof raw !== 'string') {
    result.error = 'Empty QR payload.';
    return result;
  }

  const text = raw.trim();
  if (!text.toLowerCase().startsWith('upi://')) {
    result.error = 'Not a UPI QR (must start with upi://).';
    return result;
  }

  const qIndex = text.indexOf('?');
  const query = qIndex >= 0 ? text.slice(qIndex + 1) : '';
  if (!query) {
    result.error = 'UPI URI has no parameters.';
    return result;
  }

  for (const pair of query.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = (eq >= 0 ? pair.slice(0, eq) : pair).toLowerCase();
    let val = eq >= 0 ? pair.slice(eq + 1) : '';
    try {
      val = decodeURIComponent(val.replace(/\+/g, ' '));
    } catch {
      /* keep raw value if not valid percent-encoding */
    }
    result.params[key] = val;
  }

  result.vpa = result.params.pa || null;
  result.payeeName = result.params.pn || null;
  result.currency = result.params.cu || null;

  if (result.params.mc && /^\d{3,4}$/.test(result.params.mc)) {
    result.mcc = result.params.mc.padStart(4, '0');
  }

  if (result.params.am && !isNaN(parseFloat(result.params.am))) {
    result.amount = parseFloat(result.params.am);
    result.isDynamic = result.amount > 0;
  }

  if (!result.vpa) {
    result.error = 'No payee VPA (pa) found in QR.';
    return result;
  }

  result.valid = true;
  return result;
}

export default parseUpiQr;
