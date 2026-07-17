import React, { useEffect, useRef, useState } from 'react';
import parseUpiQr from '../utils/parseUpiQr';
import resolveMerchant from '../utils/resolveMerchant';
import formatCurrency from '../utils/formatCurrency';

// Demo QR payloads (real UPI deep-link format) for desktop / no-camera testing.
const SAMPLES = [
  { label: 'Amazon (mc in QR)', value: 'upi://pay?pa=amazon@apl&pn=Amazon&mc=5262&am=2000&cu=INR' },
  { label: 'Swiggy (mc in QR)', value: 'upi://pay?pa=swiggy.stores@axb&pn=Swiggy&mc=5814&am=500&cu=INR' },
  { label: 'Zepto (no mc — VPA match)', value: 'upi://pay?pa=zeptonow@ybl&pn=Zepto&am=350&cu=INR' },
  { label: 'Person (P2P — unknown)', value: 'upi://pay?pa=rahul.kumar@oksbi&pn=Rahul Kumar&am=100&cu=INR' },
];

const CONF_META = {
  high: { label: 'HIGH', cls: 'trust-high' },
  medium: { label: 'MEDIUM', cls: 'trust-medium' },
  low: { label: 'LOW', cls: 'trust-low' },
};

const READER_ID = 'rt-qr-reader';

export default function QrScanner({ merchants, mccCatalog, onAnalyzed, onBack }) {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [resolved, setResolved] = useState(null);
  const [error, setError] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);

  const analyze = (text) => {
    const p = parseUpiQr(text);
    if (!p.valid) {
      setError(p.error);
      setParsed(null);
      setResolved(null);
      return false;
    }
    const r = resolveMerchant(p, merchants, mccCatalog);
    setError(null);
    setParsed(p);
    setResolved(r);
    return true;
  };

  const useSample = (val) => {
    setInput(val);
    analyze(val);
  };

  // Camera lifecycle: start when cameraOn flips true, always clean up on exit.
  useEffect(() => {
    if (!cameraOn) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;
        const scanner = new Html5Qrcode(READER_ID, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' }, // rear camera on phones
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (cancelled) return;
            setInput(decodedText);
            analyze(decodedText);
            setCameraOn(false); // stop scanning after first hit
          },
          () => {} // per-frame "not found" — ignore
        );
      } catch (e) {
        if (!cancelled) {
          setCameraError(
            (e && e.message) ||
              'Could not access the camera. Grant camera permission and use a secure (https) connection.'
          );
          setCameraOn(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop().then(() => s.clear()).catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [cameraOn]);

  const res = resolved?.resolution;
  const conf = res ? CONF_META[res.confidence] : null;

  return (
    <div className="screen-container animate-fade-in">
      <div className="results-header-bar">
        <button className="back-btn" aria-label="Back" onClick={onBack}>←</button>
        <h2 className="header-title">Scan Payment QR</h2>
        <span className="bell-icon" aria-hidden="true">🔔</span>
      </div>

      <div className="section-container animate-slide-up">
        <h2 className="section-title">Check rewards before you pay</h2>
        <p className="section-subtitle">
          Scan a merchant's UPI QR with your camera. We read the merchant category (MCC) straight from the QR when it's present.
        </p>

        {/* Live camera */}
        {cameraOn ? (
          <div className="qr-camera-wrap">
            <div id={READER_ID} className="qr-reader" />
            <div className="assistant-note"><span className="rt-spinner" /> Point your camera at a UPI QR code…</div>
            <button className="btn-secondary" onClick={() => setCameraOn(false)}>Stop camera</button>
          </div>
        ) : (
          <button
            className="btn-scan-qr"
            onClick={() => {
              setCameraError(null);
              setError(null);
              setCameraOn(true);
            }}
          >
            📷 Scan with camera
          </button>
        )}

        {cameraError && (
          <div className="qr-error-box">
            <span>⚠️ {cameraError}</span>
          </div>
        )}

        {/* Manual / fallback */}
        <p className="section-subtitle qr-or">or paste the QR's UPI link:</p>
        <textarea
          className="qr-input"
          rows={2}
          placeholder="upi://pay?pa=merchant@bank&pn=Merchant&mc=5814&am=500&cu=INR"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="UPI QR link"
        />

        <div className="qr-sample-row">
          {SAMPLES.map((s) => (
            <button key={s.label} className="btn-preset qr-sample-btn" onClick={() => useSample(s.value)}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="action-button-container">
          <button
            className={`btn-primary ${!input.trim() ? 'disabled' : ''}`}
            disabled={!input.trim()}
            onClick={() => analyze(input)}
          >
            Analyze QR
          </button>
        </div>

        {error && (
          <div className="qr-error-box">
            <span>⚠️ {error}</span>
          </div>
        )}

        {res && (
          <div className="qr-result-card">
            <div className="qr-result-row">
              <span className="qr-result-lbl">Payee</span>
              <span className="qr-result-val">{res.payeeName || '—'} · {res.vpa}</span>
            </div>
            <div className="qr-result-row">
              <span className="qr-result-lbl">Merchant</span>
              <span className="qr-result-val">
                {resolved.merchant.name}
                {res.registryMatch ? ' (registry match)' : ' (unrecognised)'}
              </span>
            </div>
            <div className="qr-result-row">
              <span className="qr-result-lbl">Category (MCC)</span>
              <span className="qr-result-val">
                {res.mcc ? `${res.mcc} · ${res.mccLabel || 'Unknown label'}` : 'Not determinable'}
              </span>
            </div>
            <div className="qr-result-row">
              <span className="qr-result-lbl">MCC source</span>
              <span className="qr-result-val">
                {res.mccSource === 'qr' ? 'Read from QR' : res.mccSource === 'registry' ? 'Merchant registry' : 'None'}
              </span>
            </div>
            <div className="qr-result-row">
              <span className="qr-result-lbl">QR type</span>
              <span className="qr-result-val">
                {res.isDynamic ? `Dynamic · ${formatCurrency(res.amount)}` : 'Static (no amount)'}
              </span>
            </div>
            <div className="qr-result-row">
              <span className="qr-result-lbl">Confidence</span>
              <span className={`qr-result-val badge-trust-level ${conf.cls}`}>{conf.label}</span>
            </div>

            {res.notes && res.notes.length > 0 && (
              <ul className="qr-notes">
                {res.notes.map((n, i) => (
                  <li key={i}>• {n}</li>
                ))}
              </ul>
            )}

            <div className="action-button-container">
              <button
                className="btn-primary"
                onClick={() => onAnalyzed(resolved.merchant, res.isDynamic ? res.amount : null)}
              >
                {res.mcc ? 'Show reward eligibility →' : 'See what we can (limited) →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
