/**
 * Client-side OCR for payment receipts (Tesseract.js, lazy-loaded).
 * Receipts almost never print the MCC, so OCR can only *seed* a lookup —
 * amount, merchant name, card hint — which the user then confirms. It never
 * decides eligibility on its own.
 */
import merchantsData from '../data/merchants.json';
import type { MerchantRecord } from '../types';

const merchants = merchantsData as unknown as MerchantRecord[];

export interface ReceiptFields {
  ok: boolean;
  rawText: string;
  amount: number | null;
  merchantName: string | null;
  merchantId: string | null;
  cardHint: string | null;
  confidence: 'low' | 'medium';
  error?: string;
}

function pickAmount(text: string): number | null {
  const lines = text.split(/\n+/);
  const labelled = lines.find((l) => /(grand\s*total|total|amount\s*paid|paid|amount)/i.test(l) && /[0-9]/.test(l));
  const scan = (l: string): number | null => {
    const m = l.match(/(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i);
    if (!m) return null;
    const n = parseFloat(m[1].replace(/,/g, ''));
    return isNaN(n) ? null : n;
  };
  if (labelled) {
    const v = scan(labelled);
    if (v) return v;
  }
  // fallback: largest currency-looking number
  let best: number | null = null;
  for (const l of lines) {
    const v = scan(l);
    if (v != null && (best == null || v > best)) best = v;
  }
  return best;
}

function pickMerchant(text: string): { id: string | null; name: string | null } {
  const t = text.toLowerCase();
  for (const m of merchants) {
    if (t.includes(m.name.toLowerCase())) return { id: m.id, name: m.name };
  }
  const firstLine = text.split(/\n+/).map((l) => l.trim()).find((l) => l.length > 2) || null;
  return { id: null, name: firstLine };
}

function pickCardHint(text: string): string | null {
  const last4 = text.match(/(?:ending|xxxx|\*{2,})\s*([0-9]{4})/i);
  if (last4) return `card ending ${last4[1]}`;
  const known = ['swiggy', 'cashback', 'millennia', 'simplyclick', 'flipkart', 'ace', 'kiwi', 'cred', 'amazon pay', 'idfc'];
  const t = text.toLowerCase();
  const hit = known.find((k) => t.includes(k));
  return hit ? `mentions "${hit}"` : null;
}

export async function extractReceipt(image: File | string): Promise<ReceiptFields> {
  try {
    const Tesseract = (await import('tesseract.js')).default;
    const { data } = await Tesseract.recognize(image, 'eng');
    const rawText = data?.text || '';
    if (!rawText.trim()) {
      return { ok: false, rawText: '', amount: null, merchantName: null, merchantId: null, cardHint: null, confidence: 'low', error: 'No readable text found in the image.' };
    }
    const amount = pickAmount(rawText);
    const { id, name } = pickMerchant(rawText);
    const cardHint = pickCardHint(rawText);
    const confidence: 'low' | 'medium' = id && amount ? 'medium' : 'low';
    return { ok: true, rawText, amount, merchantName: name, merchantId: id, cardHint, confidence };
  } catch (e) {
    return { ok: false, rawText: '', amount: null, merchantName: null, merchantId: null, cardHint: null, confidence: 'low', error: e instanceof Error ? e.message : 'OCR failed.' };
  }
}

export default extractReceipt;
