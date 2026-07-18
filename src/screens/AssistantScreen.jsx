import React, { useState, useEffect, useRef } from 'react';
import programsData from '../data/card-programs.json';
import merchantsData from '../data/merchants.json';
import formatCurrency from '../utils/formatCurrency';
import { parseQuery, diagnose } from '../utils/assistant';
import { evaluateWallet, evaluateCard } from '../utils/lookup';
import extractReceipt from '../utils/receiptOcr';
import { retrieveGlossary } from '../utils/glossary';
import askApi from '../utils/askApi';

const SUGGESTIONS = [
  'Paying ₹1,250 at Starbucks on HDFC Swiggy',
  '₹2000 at Amazon — best card?',
  "Why didn't I get cashback at Amazon on HDFC Swiggy?",
  'What is an MCC and why does it matter?',
];

function buildAnswer(q, walletIds, isPrime) {
  const parsed = parseQuery(q, merchantsData);
  if (parsed.intent === 'diagnose') {
    if (!parsed.merchant || parsed.cardIds.length === 0) {
      return { kind: 'text', text: `To diagnose I need ${!parsed.merchant ? 'the merchant' : ''}${!parsed.merchant && !parsed.cardIds.length ? ' and ' : ''}${!parsed.cardIds.length ? 'which card you used' : ''}.` };
    }
    const cardId = parsed.cardIds[0];
    const amount = parsed.amountInr || 1000;
    const r = evaluateCard(cardId, parsed.merchant, amount, { isPrime });
    return { kind: 'diagnose', r, items: diagnose(r, amount, programsData[cardId]) };
  }
  if (!parsed.merchant) return { kind: 'text', text: '' };
  if (!parsed.amountInr) return { kind: 'text', text: `Got ${parsed.merchant.name}. How much are you paying? e.g. "₹1000".` };
  const results = evaluateWallet(walletIds, parsed.merchant, parsed.amountInr, { isPrime });
  const best = results.filter((x) => x.verdict === 'eligible').sort((a, b) => b.rewardValueInr - a.rewardValueInr)[0];
  return { kind: 'lookup', merchant: parsed.merchant, amount: parsed.amountInr, results, best };
}

// Compact, verified facts sent to the LLM (the only source of truth for numbers).
function toFacts(a) {
  if (a.kind === 'lookup') {
    return {
      intent: 'lookup', merchant: a.merchant.name, mcc: a.merchant.mcc, amount: a.amount,
      cards: a.results.map((r) => ({ card: r.cardName, verdict: r.verdict, rewardInr: r.rewardValueInr, ratePct: +(r.effectiveRate * 100).toFixed(2), reason: r.reason, sourceUrl: r.source?.url, confidence: r.confidence?.score })),
    };
  }
  if (a.kind === 'diagnose') {
    return { intent: 'diagnose', card: a.r.cardName, verdict: a.r.verdict, reason: a.r.reason, causes: a.items.filter((i) => i.applies).map((i) => `${i.label}: ${i.detail}`), sourceUrl: a.r.source?.url, confidence: a.r.confidence?.score };
  }
  return { intent: 'clarify', note: a.text || null };
}
function fallbackText(a) {
  if (a.kind === 'lookup') {
    return a.best
      ? `Best pick — ${a.best.cardName} earns ${formatCurrency(a.best.rewardValueInr)} (${(a.best.effectiveRate * 100).toFixed(a.best.effectiveRate < 0.1 ? 1 : 0)}%) at ${a.merchant.name}.`
      : `No card in your wallet earns a reward at ${a.merchant.name} for this payment.`;
  }
  if (a.kind === 'diagnose') return a.r.reason;
  return a.text || 'Which merchant are you paying? Try "Amazon", "Zomato", or scan a QR.';
}

function Source({ url, band, tone }) {
  const col = tone === 'amber' ? '#F59E0B' : '#34D399';
  return (
    <div style={{ background: '#0B0B0E', border: `1px solid ${col}26`, borderRadius: 8, padding: '9px 11px', display: 'flex', alignItems: 'center', gap: 9 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
      <div style={{ minWidth: 0 }}>
        <div style={{ font: "500 10.5px/1.2 'Inter'", color: col, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url ? url.replace(/^https?:\/\//, '') : 'no source on file'}</div>
        <div style={{ font: "400 10px/1 'Inter'", color: 'rgba(245,245,247,.35)' }}>Confidence {band ?? '—'}</div>
      </div>
    </div>
  );
}

function AiCard({ a, aiText, loading, onWhy }) {
  const lead = loading ? null : (aiText || fallbackText(a));
  const leadBlock = lead && <div style={{ font: "400 12.5px/1.6 'Inter'", color: 'rgba(245,245,247,.78)', marginBottom: (a.kind === 'text') ? 0 : 12 }}>{lead}</div>;

  if (loading) return <div style={{ font: "400 12px/1 'Inter'", color: 'rgba(245,245,247,.45)', display: 'flex', gap: 8, alignItems: 'center' }}><span className="rt-spinner" /> Thinking…</div>;
  if (a.kind === 'text') return leadBlock;

  if (a.kind === 'diagnose') {
    return (
      <div>
        {leadBlock}
        <div style={{ marginBottom: 10 }}>
          {a.items.filter((i) => i.applies).slice(0, 2).map((i) => (
            <div key={i.code} style={{ background: '#0B0B0E', border: '1px solid rgba(245,158,11,.18)', borderRadius: 8, padding: '8px 10px', marginBottom: 6 }}>
              <div style={{ font: "600 11px/1.3 'Inter'", color: '#F59E0B', marginBottom: 2 }}>⚠ {i.label}</div>
              <div style={{ font: "400 10.5px/1.5 'Inter'", color: 'rgba(245,245,247,.5)' }}>{i.detail}</div>
            </div>
          ))}
        </div>
        <Source url={a.r.source?.url} band={a.r.confidence?.score} tone="amber" />
      </div>
    );
  }

  // lookup
  const { merchant, amount, best, results } = a;
  return (
    <div>
      {leadBlock}
      {best && (
        <div style={{ background: '#0B0B0E', border: '1px solid rgba(52,211,153,.15)', borderRadius: 10, padding: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 5, height: 5, background: '#34D399', borderRadius: '50%' }} />
            <span style={{ font: "700 9px/1 'Inter'", letterSpacing: '.12em', textTransform: 'uppercase', color: '#34D399' }}>Will Earn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ font: "600 12.5px/1 'Inter'", color: '#F5F5F7', marginBottom: 3 }}>{best.cardName}</div>
              <div style={{ font: "400 10.5px/1 'Inter'", color: 'rgba(245,245,247,.45)' }}>{merchant.name} · MCC {merchant.mcc} · {formatCurrency(amount)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ font: "700 16px/1 'Outfit'", color: '#34D399' }}>{formatCurrency(best.rewardValueInr)}</div>
              <div style={{ font: "500 10px/1 'Outfit'", color: 'rgba(52,211,153,.6)', marginTop: 2 }}>{(best.effectiveRate * 100).toFixed(best.effectiveRate < 0.1 ? 1 : 0)}%</div>
            </div>
          </div>
        </div>
      )}
      <Source url={(best || results[0])?.source?.url} band={(best || results[0])?.confidence?.score} tone="green" />
      <button onClick={() => onWhy(best || results[0])} style={{ background: 'none', border: 'none', font: "500 11px/1 'Inter'", color: '#34D399', cursor: 'pointer', marginTop: 8, padding: 0 }}>See full breakdown ↗</button>
    </div>
  );
}

export default function AssistantScreen({ walletIds, isPrime, onShowTrustReport, onScanClick, onBack, initialQuery }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const scrollRef = useRef(null);

  const run = async (q) => {
    const a = buildAnswer(q, walletIds, isPrime);
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'ai', a, aiText: null, loading: true }]);
    setText('');
    let aiText = null;
    try {
      aiText = await askApi({ question: q, facts: toFacts(a), glossary: retrieveGlossary(q) });
    } catch {
      aiText = null; // deterministic fallback used in render
    }
    setMessages((m) => {
      const c = [...m];
      for (let i = c.length - 1; i >= 0; i--) {
        if (c[i].role === 'ai' && c[i].loading) { c[i] = { ...c[i], aiText, loading: false }; break; }
      }
      return c;
    });
  };

  useEffect(() => { if (initialQuery) run(initialQuery); /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, busy]);

  const onUpload = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    const fields = await extractReceipt(f);
    setBusy(false);
    if (!fields.ok) { setMessages((m) => [...m, { role: 'ai', a: { kind: 'text', text: `⚠️ ${fields.error || 'Could not read the receipt.'}` }, aiText: null, loading: false }]); return; }
    const q = `${fields.merchantName || ''} ${fields.amount ? '₹' + fields.amount : ''}`.trim();
    if (q) run(q);
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 20px 12px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} aria-label="Back" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,rgba(52,211,153,.2),rgba(52,211,153,.06))', border: '1px solid rgba(52,211,153,.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c1.5 0 2.7 1.2 2.7 2.7 0 .4-.1.8-.2 1.1l4 2.3c.5.3.8.9.8 1.5v3.8c0 .6-.3 1.2-.8 1.5l-4 2.3c.1.3.2.7.2 1.1C14.7 19.8 13.5 21 12 21s-2.7-1.2-2.7-2.7c0-.4.1-.8.2-1.1L5.5 15c-.5-.3-.8-.9-.8-1.5V9.7c0-.6.3-1.2.8-1.5l4-2.3c-.1-.3-.2-.7-.2-1.1C9.3 3.2 10.5 2 12 2Z" /></svg>
          </div>
          <div>
            <div style={{ font: "600 14px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.01em' }}>Ask RewardTrust</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <div style={{ width: 5, height: 5, background: '#34D399', borderRadius: '50%' }} />
              <span style={{ font: "400 10px/1 'Inter'", color: 'rgba(52,211,153,.7)' }}>Grounded · never guessing</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="rs" style={{ padding: '14px 18px 8px' }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <div style={{ font: "400 12px/1.5 'Inter'", color: 'rgba(245,245,247,.45)', marginBottom: 4 }}>Ask about any payment or reward concept. Every reward figure comes from verified card terms.</div>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => run(s)} style={{ textAlign: 'left', background: '#141418', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: '11px 13px', font: "400 12.5px/1.4 'Inter'", color: 'rgba(245,245,247,.7)', cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        )}

        {messages.map((m, i) => m.role === 'user' ? (
          <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <div style={{ background: '#34D399', borderRadius: '18px 18px 4px 18px', padding: '11px 14px', maxWidth: 270 }}>
              <div style={{ font: "500 13px/1.5 'Inter'", color: '#0B0B0E' }}>{m.text}</div>
            </div>
          </div>
        ) : (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
              <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg,rgba(52,211,153,.2),rgba(52,211,153,.06))', border: '1px solid rgba(52,211,153,.25)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>
              </div>
              <span style={{ font: "600 10.5px/1 'Inter'", color: 'rgba(245,245,247,.5)' }}>RewardTrust · verified answer</span>
            </div>
            <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,.08)', borderRadius: '4px 18px 18px 18px', padding: 14 }}>
              <AiCard a={m.a} aiText={m.aiText} loading={m.loading} onWhy={onShowTrustReport} />
            </div>
          </div>
        ))}
        {busy && <div style={{ font: "400 12px/1 'Inter'", color: 'rgba(245,245,247,.4)', display: 'flex', gap: 8, alignItems: 'center' }}><span className="rt-spinner" /> Reading receipt…</div>}
      </div>

      <div style={{ padding: '10px 16px', background: 'rgba(9,9,12,.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,.07)', flexShrink: 0 }}>
        <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '8px 10px 8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onScanClick} aria-label="Scan QR" style={{ width: 28, height: 28, background: '#1C1C22', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.5)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M17 14v6M14 17h6" /></svg>
          </button>
          <button onClick={() => fileRef.current && fileRef.current.click()} aria-label="Upload receipt" style={{ width: 28, height: 28, background: '#1C1C22', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.5)" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" /></svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) run(text.trim()); }} placeholder="Ask about any payment…" aria-label="Ask about a payment"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', font: "400 13px/1 'Inter'", color: '#F5F5F7' }} />
          <button onClick={() => text.trim() && run(text.trim())} aria-label="Send" style={{ width: 30, height: 30, background: '#34D399', border: 'none', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0B0B0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
