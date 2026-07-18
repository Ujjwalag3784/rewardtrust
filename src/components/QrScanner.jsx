import React, { useEffect, useRef, useState } from 'react';
import parseUpiQr from '../utils/parseUpiQr';
import resolveMerchant from '../utils/resolveMerchant';

const SAMPLES = [
  { label: 'Amazon', value: 'upi://pay?pa=amazon@apl&pn=Amazon&mc=5262&am=2000&cu=INR' },
  { label: 'Swiggy', value: 'upi://pay?pa=swiggy.stores@axb&pn=Swiggy&mc=5814&am=500&cu=INR' },
  { label: 'Zepto', value: 'upi://pay?pa=zeptonow@ybl&pn=Zepto&am=350&cu=INR' },
];
const READER = 'rt-qr-reader';
const WHITE = 'rgba(255,255,255,.85)';

export default function QrScanner({ merchants, mccCatalog, onAnalyzed, onBack }) {
  const [detected, setDetected] = useState(null);
  const [manual, setManual] = useState(false);
  const [input, setInput] = useState('');
  const [camErr, setCamErr] = useState(null);
  const scannerRef = useRef(null);

  const resolve = (text) => {
    const p = parseUpiQr(text);
    if (!p.valid) { setCamErr(p.error); return false; }
    const r = resolveMerchant(p, merchants, mccCatalog);
    setDetected({ merchant: r.merchant, res: r.resolution });
    return true;
  };

  useEffect(() => {
    if (manual || detected) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;
        const sc = new Html5Qrcode(READER, { verbose: false });
        scannerRef.current = sc;
        await sc.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 220, height: 220 } },
          (text) => { if (!cancelled) resolve(text); }, () => {});
      } catch (e) {
        if (!cancelled) setCamErr('Camera unavailable — use a sample or paste a link below.');
      }
    })();
    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) { s.stop().then(() => s.clear()).catch(() => {}); scannerRef.current = null; }
    };
  }, [manual, detected]);

  const bracket = (pos) => {
    const base = { position: 'absolute', width: 28, height: 28, border: 'none' };
    const g = '#34D399';
    if (pos === 'tl') return { ...base, top: 0, left: 0, borderTop: `3px solid ${g}`, borderLeft: `3px solid ${g}`, borderRadius: '4px 0 0 0' };
    if (pos === 'tr') return { ...base, top: 0, right: 0, borderTop: `3px solid ${g}`, borderRight: `3px solid ${g}`, borderRadius: '0 4px 0 0' };
    if (pos === 'bl') return { ...base, bottom: 0, left: 0, borderBottom: `3px solid ${g}`, borderLeft: `3px solid ${g}`, borderRadius: '0 0 0 4px' };
    return { ...base, bottom: 0, right: 0, borderBottom: `3px solid ${g}`, borderRight: `3px solid ${g}`, borderRadius: '0 0 4px 0' };
  };

  return (
    <div style={{ flex: 1, background: '#050508', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Status bar (white) */}
      <div style={{ height: 54, padding: '16px 30px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 5 }}>
        <span style={{ font: "600 15px/1 'Outfit'", color: '#fff' }}>9:41</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="7" width="3" height="5" rx=".5" fill="#fff" opacity=".85" /><rect x="5" y="4.5" width="3" height="7.5" rx=".5" fill="#fff" opacity=".85" /><rect x="10" y="2" width="3" height="10" rx=".5" fill="#fff" opacity=".85" /><rect x="15" y="0" width="3" height="12" rx=".5" fill="#fff" opacity=".4" /></svg>
          <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="2.5" stroke="rgba(255,255,255,.35)" strokeWidth="1" fill="none" /><rect x="23.5" y="3.5" width="2" height="5" rx="1" fill="rgba(255,255,255,.35)" /><rect x="2" y="2" width="17" height="8" rx="1.5" fill="rgba(255,255,255,.85)" /></svg>
        </div>
      </div>

      {/* Top nav */}
      <div style={{ padding: '6px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 5 }}>
        <button onClick={onBack} aria-label="Back" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <span style={{ font: "600 15px/1 'Outfit'", color: '#fff' }}>Scan QR Code</span>
        <button onClick={() => setManual((v) => !v)} aria-label="Enter manually" style={{ width: 36, height: 36, background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2H3v7M21 2l-7 7M3 9l7 7M3 22h7M10 22V15M21 22v-7M21 15h-7" /></svg>
        </button>
      </div>

      {/* Viewfinder */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingBottom: 40 }}>
        {!manual && <div id={READER} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,8,.5)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, width: 240, height: 240 }}>
          <div style={bracket('tl')} /><div style={bracket('tr')} /><div style={bracket('bl')} /><div style={bracket('br')} />
          <div style={{ position: 'absolute', left: 8, right: 8, height: 2, background: 'linear-gradient(90deg,transparent,#34D399,transparent)', animation: 'scanline 2s ease-in-out infinite', borderRadius: 2, boxShadow: '0 0 8px rgba(52,211,153,.6)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2, marginTop: 24, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(11,11,14,.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 24, padding: '8px 18px' }}>
            <div style={{ width: 7, height: 7, background: '#34D399', borderRadius: '50%', animation: 'pulse-ring 1.4s ease-out infinite' }} />
            <span style={{ font: "500 12.5px/1 'Inter'", color: '#F5F5F7' }}>{manual ? 'Manual entry' : 'Scanning UPI QR…'}</span>
          </div>
          {camErr && <div style={{ font: "400 11px/1.4 'Inter'", color: '#F87171', marginTop: 10, maxWidth: 240 }}>{camErr}</div>}
          {manual && (
            <div style={{ marginTop: 14, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {SAMPLES.map((s) => (
                <button key={s.label} onClick={() => resolve(s.value)} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '6px 12px', color: '#fff', font: "500 11px/1 'Inter'", cursor: 'pointer' }}>{s.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detected merchant bottom sheet */}
      <div style={{ background: 'linear-gradient(180deg,rgba(11,11,14,0) 0%,#0B0B0E 60%)', padding: '20px 22px 10px', position: 'relative', zIndex: 5 }}>
        {detected ? (
          <div style={{ background: '#141418', border: '1.5px solid rgba(52,211,153,.3)', borderRadius: 18, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(52,211,153,.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
              </div>
              <div>
                <div style={{ font: "500 10px/1 'Inter'", letterSpacing: '.1em', textTransform: 'uppercase', color: '#34D399', marginBottom: 4 }}>UPI Merchant Detected</div>
                <div style={{ font: "600 15px/1 'Outfit'", color: '#F5F5F7' }}>{detected.merchant.name}</div>
              </div>
              <div style={{ marginLeft: 'auto', background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 7, padding: '4px 9px' }}>
                <span style={{ font: "600 10px/1 'Inter'", letterSpacing: '.07em', color: '#34D399' }}>{detected.res.mcc ? `MCC ${detected.res.mcc}` : 'MCC ?'}</span>
              </div>
            </div>
            <button onClick={() => onAnalyzed(detected.merchant, detected.res.isDynamic ? detected.res.amount : null)} style={{ width: '100%', height: 44, background: '#34D399', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0B0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
              <span style={{ font: "600 14px/1 'Inter'", color: '#0B0B0E' }}>Check My Rewards</span>
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ font: "400 12px/1 'Inter'", color: 'rgba(245,245,247,.35)' }}>Or </span>
            <button onClick={() => setManual((v) => !v)} style={{ background: 'none', border: 'none', font: "500 12px/1 'Inter'", color: 'rgba(245,245,247,.6)', cursor: 'pointer', padding: 0 }}>{manual ? 'use camera ›' : 'enter merchant manually ›'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
