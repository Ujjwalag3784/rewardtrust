import React, { useState, useEffect, useRef } from 'react';
import programsData from '../data/card-programs.json';
import merchantsData from '../data/merchants.json';
import formatCurrency from '../utils/formatCurrency';
import { parseQuery, diagnose } from '../utils/assistant';
import { evaluateWallet, evaluateCard } from '../utils/lookup';
import extractReceipt from '../utils/receiptOcr';

const SUGGESTIONS = [
  "Paying ₹1,250 at Starbucks on HDFC Swiggy",
  "₹2000 at Amazon — which of my cards is best?",
  "Why didn't I get cashback at Amazon on HDFC Swiggy?",
  "₹800 at Zomato",
];

const ORDER = { low: 0, medium: 1, high: 2 };
const LABEL = ['LOW', 'MEDIUM', 'HIGH'];
function minBand(inputConf, ruleBand) {
  return LABEL[Math.min(ORDER[inputConf] ?? 0, ORDER[ruleBand] ?? 0)];
}
function rewardValue(r) {
  if (r.rewardType === 'points') return `≈ ${formatCurrency(r.rewardValueInr)} · ${r.rewardPoints} pts`;
  if (r.rewardType === 'amazon_pay_balance') return `${formatCurrency(r.rewardValueInr)} Amazon Pay`;
  return formatCurrency(r.rewardValueInr);
}

export default function AssistantScreen({ walletIds, cards, isPrime, onShowTrustReport, onScanClick, onBack, initialQuery }) {
  const [text, setText] = useState(initialQuery || '');
  const [answer, setAnswer] = useState(null);
  const [ocrNote, setOcrNote] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const method = (id) => cards.find((c) => c.id === id);

  const run = (q) => {
    const parsed = parseQuery(q, merchantsData);
    if (parsed.intent === 'diagnose') {
      if (!parsed.merchant || parsed.cardIds.length === 0) {
        setAnswer({ kind: 'clarify', parsed, msg: `To diagnose, I need ${!parsed.merchant ? 'the merchant' : ''}${!parsed.merchant && parsed.cardIds.length === 0 ? ' and ' : ''}${parsed.cardIds.length === 0 ? 'which card you used' : ''}.` });
        return;
      }
      const cardId = parsed.cardIds[0];
      const amount = parsed.amountInr || 1000;
      const r = evaluateCard(cardId, parsed.merchant, amount, { isPrime });
      const items = diagnose(r, amount, programsData[cardId]);
      setAnswer({ kind: 'diagnose', parsed, cardId, result: r, items });
      return;
    }
    // lookup
    if (!parsed.merchant) {
      setAnswer({ kind: 'clarify', parsed, msg: 'Which merchant are you paying? Try a name like "Amazon", "Zomato", or paste a UPI QR.' });
      return;
    }
    if (!parsed.amountInr) {
      setAnswer({ kind: 'need_amount', parsed });
      return;
    }
    const results = evaluateWallet(walletIds, parsed.merchant, parsed.amountInr, { isPrime });
    setAnswer({ kind: 'lookup', parsed, amount: parsed.amountInr, results });
  };

  useEffect(() => { if (initialQuery) run(initialQuery); /* eslint-disable-next-line */ }, []);

  const onUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    setOcrNote('Reading receipt…');
    const fields = await extractReceipt(file);
    setBusy(false);
    if (!fields.ok) { setOcrNote(`⚠️ ${fields.error || 'Could not read the receipt.'}`); return; }
    const q = `${fields.merchantName || ''} ${fields.amount ? '₹' + fields.amount : ''}`.trim();
    setText(q);
    setOcrNote(`Extracted from receipt (confidence: ${fields.confidence}) — merchant "${fields.merchantName || '?'}", amount ${fields.amount ? formatCurrency(fields.amount) : '?'}${fields.cardHint ? `, ${fields.cardHint}` : ''}. Please confirm, then tap Ask.`);
    if (q) run(q);
  };

  const submit = () => { if (text.trim()) run(text.trim()); };

  return (
    <div className="screen-container animate-fade-in">
      <div className="results-header-bar">
        <button className="back-btn" aria-label="Back" onClick={onBack}>←</button>
        <h2 className="header-title">Ask RewardTrust</h2>
        <span className="bell-icon" aria-hidden="true">🤖</span>
      </div>

      <div className="section-container animate-slide-up">
        <p className="section-subtitle assistant-intro">
          Tell me a payment in plain words. I only answer from <strong>verified card terms</strong> — if I can't confirm something, I'll say so.
        </p>

        <div className="assistant-input-wrap">
          <textarea
            className="qr-input assistant-input"
            rows={2}
            placeholder="e.g. Paying ₹1,250 at Starbucks on HDFC Swiggy"
            aria-label="Ask about a payment"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="assistant-actions">
            <button className={`btn-primary ${!text.trim() ? 'disabled' : ''}`} disabled={!text.trim()} onClick={submit}>Ask</button>
            <button className="btn-secondary" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy}>📄 Receipt</button>
            <button className="btn-secondary" onClick={onScanClick}>📷 QR</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
          </div>
        </div>

        {(busy || ocrNote) && <div className="assistant-note">{busy && <span className="rt-spinner" />} {ocrNote || 'Reading receipt…'}</div>}

        <div className="qr-sample-row assistant-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="btn-preset qr-sample-btn" onClick={() => { setText(s); run(s); }}>{s}</button>
          ))}
        </div>

        {answer && <AnswerView answer={answer} method={method} onShowTrustReport={onShowTrustReport} onScanClick={onScanClick} />}
      </div>
    </div>
  );

  function AnswerView({ answer, method, onShowTrustReport }) {
    if (answer.kind === 'clarify') {
      return <div className="assistant-answer"><div className="qr-error-box"><span>🤔 {answer.msg}</span></div></div>;
    }
    if (answer.kind === 'need_amount') {
      return (
        <div className="assistant-answer">
          <div className="assistant-note">Got the merchant (<strong>{answer.parsed.merchant.name}</strong>). How much are you paying? Add an amount, e.g. "₹1000".</div>
        </div>
      );
    }
    if (answer.kind === 'lookup') {
      const { parsed, results } = answer;
      const will = results.filter((r) => r.verdict === 'eligible' || r.verdict === 'partial').sort((a, b) => b.rewardValueInr - a.rewardValueInr);
      const wont = results.filter((r) => r.verdict === 'ineligible');
      const cant = results.filter((r) => r.verdict === 'unknown');
      return (
        <div className="assistant-answer">
          <div className="assistant-headline">
            {parsed.merchant.name} · {formatCurrency(answer.amount)}
            <span className="mcc-chip">{parsed.merchant.mcc ? `MCC ${parsed.merchant.mcc}` : 'MCC unknown'}</span>
          </div>
          {will[0] && <div className="best-pick-banner"><span className="best-pick-lbl">👑 BEST</span><span className="best-pick-card">{will[0].cardName} · <strong>{rewardValue(will[0])}</strong></span></div>}
          {[['✓ WILL EARN', will, 'text-emerald'], ['✕ WON\'T EARN', wont, 'text-red'], ['? CAN\'T CONFIRM', cant, 'text-muted']].map(([lbl, list, cls]) =>
            list.length > 0 ? (
              <section className="res-group" key={lbl}>
                <h4 className={`section-label ${cls}`}>{lbl} ({list.length})</h4>
                {list.map((r) => (
                  <div key={r.methodId} className={`res-row verdict-${r.verdict}`}>
                    <div className="res-row-main">
                      <span className="method-badge-icon sm" style={{ background: method(r.methodId)?.bgGradient, borderColor: method(r.methodId)?.borderColor }}>{method(r.methodId)?.badge}</span>
                      <div className="res-row-text">
                        <span className="res-card-name">{r.cardName}</span>
                        <span className="res-reason">{r.reason}</span>
                      </div>
                      <div className="res-row-value">
                        <span className={`res-value-amt ${r.verdict === 'eligible' || r.verdict === 'partial' ? '' : 'text-muted'}`}>{(r.verdict === 'eligible' || r.verdict === 'partial') ? rewardValue(r) : (r.verdict === 'unknown' ? '—' : '₹0')}</span>
                        <span className="res-conf">conf {minBand(parsed.inputConfidence, r.confidence?.band)}</span>
                      </div>
                    </div>
                    <div className="res-row-actions"><button className="linkish res-why" onClick={() => onShowTrustReport(r)}>Why? / source ↗</button></div>
                  </div>
                ))}
              </section>
            ) : null
          )}
          {parsed.inputConfidence !== 'high' && (
            <div className="assistant-note">I matched "{parsed.merchant.name}" with {parsed.inputConfidence} confidence, so displayed confidence is capped accordingly.</div>
          )}
        </div>
      );
    }
    if (answer.kind === 'diagnose') {
      const { parsed, result, items } = answer;
      return (
        <div className="assistant-answer">
          <div className="assistant-headline">
            Why {parsed.merchant.name} on {result.cardName}?
            <span className="mcc-chip">{result.mcc ? `MCC ${result.mcc}` : 'MCC unknown'}</span>
          </div>
          <div className={`verdict-reason-box verdict-${result.verdict}`}>
            <span className="verdict-reason-icon">{result.verdict === 'eligible' ? '✓' : result.verdict === 'partial' ? '◐' : result.verdict === 'ineligible' ? '✕' : '?'}</span>
            <span className="verdict-reason-text">{result.reason}</span>
          </div>
          <ul className="diag-list">
            {items.map((it) => (
              <li key={it.code} className={`diag-item ${it.applies ? 'applies' : ''}`}>
                <span className="diag-icon">{it.applies ? '⚠️' : '✓'}</span>
                <div><span className="diag-label">{it.label}</span><span className="diag-detail">{it.detail}</span></div>
              </li>
            ))}
          </ul>
          <button className="linkish res-why" onClick={() => onShowTrustReport(result)}>See the verified source ↗</button>
        </div>
      );
    }
    return null;
  }
}
