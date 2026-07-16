/**
 * Resolve a parsed UPI QR to a merchant + MCC, with explicit provenance.
 * MCC from QR (high) > MCC from registry via VPA/name (medium) > none (low, MCC null).
 * We never invent an MCC.
 */
import type { MccCatalog, MccCertainty, MerchantRecord, ResolveResult, UpiParseResult } from '../types';

function matchByVpa(vpa: string | null, merchants: MerchantRecord[]): MerchantRecord | null {
  if (!vpa) return null;
  const handle = vpa.toLowerCase().split('@')[0];
  return (
    merchants.find(
      (m) => Array.isArray(m.vpaPatterns) && m.vpaPatterns.some((p) => handle.includes(String(p).toLowerCase()))
    ) || null
  );
}

function matchByName(name: string | null, merchants: MerchantRecord[]): MerchantRecord | null {
  if (!name) return null;
  const n = name.toLowerCase();
  return merchants.find((m) => n.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(n)) || null;
}

export function resolveMerchant(
  parsed: UpiParseResult,
  merchants: MerchantRecord[] = [],
  mccCatalog: MccCatalog = {}
): ResolveResult {
  if (!parsed || !parsed.valid) {
    return { ok: false, error: parsed?.error || 'Invalid QR', merchant: null, resolution: null };
  }

  const byVpa = matchByVpa(parsed.vpa, merchants);
  const byName = byVpa ? null : matchByName(parsed.payeeName, merchants);
  const registryMatch = byVpa || byName;

  let mcc: string | null = null;
  let mccSource: 'qr' | 'registry' | 'none' = 'none';
  let confidence: MccCertainty = 'low';
  const notes: string[] = [];

  if (parsed.mcc) {
    mcc = parsed.mcc;
    mccSource = 'qr';
    confidence = 'high';
    notes.push('MCC read directly from the QR (mc field).');
    if (registryMatch && registryMatch.mcc && registryMatch.mcc !== parsed.mcc) {
      confidence = 'medium';
      notes.push(
        `QR MCC ${parsed.mcc} differs from our registry MCC ${registryMatch.mcc} for ${registryMatch.name}; issuer mapping may vary.`
      );
    }
  } else if (registryMatch && registryMatch.mcc) {
    mcc = registryMatch.mcc;
    mccSource = 'registry';
    confidence = 'medium';
    notes.push(`QR had no mc field; MCC inferred from ${byVpa ? 'VPA handle' : 'payee name'} via merchant registry.`);
  } else {
    notes.push('No MCC in QR and no registry match — reward outcome cannot be determined (likely a P2P or unregistered VPA).');
  }

  const mccLabel = mcc && mccCatalog[mcc] ? mccCatalog[mcc].label : null;

  const merchant: MerchantRecord = {
    id: registryMatch ? registryMatch.id : 'scanned',
    name: registryMatch ? registryMatch.name : parsed.payeeName || parsed.vpa || 'Unknown',
    fullName: registryMatch ? registryMatch.fullName : parsed.payeeName || parsed.vpa || 'Unknown',
    category: registryMatch ? registryMatch.category : null,
    mcc,
    mccConfidence: confidence,
    accentColor: registryMatch ? registryMatch.accentColor : '#64748B',
    icon: registryMatch ? registryMatch.icon : '🏦',
    logo: registryMatch ? registryMatch.logo : null,
  };

  return {
    ok: true,
    merchant,
    resolution: {
      vpa: parsed.vpa,
      payeeName: parsed.payeeName,
      registryMatch: registryMatch ? registryMatch.id : null,
      mcc,
      mccLabel,
      mccSource,
      confidence,
      isDynamic: parsed.isDynamic,
      amount: parsed.amount,
      notes,
    },
  };
}

export default resolveMerchant;
