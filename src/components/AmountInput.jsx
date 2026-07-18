import React from 'react';
import { MerchantLogo } from './Brand';

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function two(n) { return n < 20 ? ONES[n] : (TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')); }
function inWords(num) {
  num = Math.floor(num || 0);
  if (num === 0) return 'Zero rupees';
  if (num > 9999999) return '';
  let w = '';
  const cr = Math.floor(num / 10000000); num %= 10000000;
  const l = Math.floor(num / 100000); num %= 100000;
  const th = Math.floor(num / 1000); num %= 1000;
  const h = Math.floor(num / 100); num %= 100;
  if (cr) w += two(cr) + ' crore ';
  if (l) w += two(l) + ' lakh ';
  if (th) w += two(th) + ' thousand ';
  if (h) w += ONES[h] + ' hundred ';
  if (num) w += two(num) + ' ';
  return w.trim().replace(/^\w/, (c) => c.toUpperCase()) + ' rupees';
}

export default function AmountInput({ merchant, amount, onChangeAmount, onContinue, onBack }) {
  const val = String(amount ?? '');
  const set = (next) => {
    if (next === '') { onChangeAmount(0); return; }
    const n = parseFloat(next);
    if (!isNaN(n)) onChangeAmount(n);
  };
  const press = (k) => {
    if (k === 'back') { set(val.length > 1 ? val.slice(0, -1) : ''); return; }
    if (k === '.') { if (!val.includes('.')) set((val || '0') + '.'); return; }
    const next = (val === '0' || val === '' ? '' : val) + k;
    if (next.replace('.', '').length <= 8) set(next);
  };
  const a = merchant?.accentColor || '#94A3B8';
  const grouped = amount ? Number(amount).toLocaleString('en-IN') : '0';
  const keyStyle = { height: 58, background: '#141418', borderRadius: 14, border: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
  const num = (n) => <button key={n} type="button" onClick={() => press(n)} style={keyStyle}><span style={{ font: "400 24px/1 'Outfit'", color: '#F5F5F7' }}>{n}</span></button>;

  return (
    <div>
      {/* Nav bar */}
      <div style={{ padding: '6px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} aria-label="Back" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <MerchantLogo merchant={merchant} size={36} radius={10} />
          <div>
            <div style={{ font: "600 15px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.01em' }}>{merchant?.name || 'Merchant'}</div>
            <div style={{ font: "400 10.5px/1 'Inter'", color: 'rgba(245,245,247,.38)' }}>{merchant?.mcc ? `MCC ${merchant.mcc} · ${merchant.category || ''}` : 'MCC unknown'}</div>
          </div>
        </div>
      </div>

      {/* Amount display */}
      <div style={{ padding: '28px 22px 20px', textAlign: 'center' }}>
        <div style={{ font: "300 11px/1 'Inter'", letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,245,247,.35)', marginBottom: 14 }}>Enter Amount</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
          <span style={{ font: "300 36px/1 'Outfit'", color: 'rgba(245,245,247,.4)' }}>₹</span>
          <span style={{ font: "600 56px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.03em', fontFeatureSettings: "'tnum'" }}>{grouped}</span>
        </div>
        <div style={{ font: "400 12px/1 'Inter'", color: 'rgba(245,245,247,.25)', marginTop: 10, minHeight: 14 }}>{inWords(amount)}</div>
      </div>

      {/* Quick amounts */}
      <div style={{ padding: '0 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[500, 1000, 2000, 5000].map((v) => {
            const on = Number(amount) === v;
            return (
              <button key={v} type="button" onClick={() => set(String(v))} style={{ background: on ? 'rgba(52,211,153,.1)' : '#141418', border: `1.5px solid ${on ? 'rgba(52,211,153,.3)' : 'rgba(255,255,255,.08)'}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
                <span style={{ font: "600 12px/1 'Outfit'", color: on ? '#34D399' : 'rgba(245,245,247,.55)' }}>₹{v.toLocaleString('en-IN')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Numpad */}
      <div style={{ padding: '0 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map(num)}
          <button type="button" onClick={() => press('back')} aria-label="Delete" style={{ ...keyStyle, background: '#1C1C22' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,247,.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
          </button>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '14px 22px 24px' }}>
        <button type="button" onClick={onContinue} disabled={!amount} style={{ width: '100%', height: 52, background: amount ? '#34D399' : '#1a1a1f', border: 'none', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: amount ? 'pointer' : 'default' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={amount ? '#0B0B0E' : 'rgba(245,245,247,.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span style={{ font: "600 15px/1 'Inter'", color: amount ? '#0B0B0E' : 'rgba(245,245,247,.4)' }}>Check Rewards</span>
        </button>
      </div>
    </div>
  );
}
