import React, { useState } from 'react';

const ShieldLogo = ({ s = 34 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2 4 6.5V12c0 5.5 3.5 10.6 8 12 4.5-1.4 8-6.5 8-12V6.5L12 2Z" stroke="#34D399" strokeWidth="1.4" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export default function LoginScreen({ onLogin }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const phoneValid = /^[6-9]\d{9}$/.test(phone);

  const green = '#34D399';
  const label = { font: "500 10px/1 'Inter'", letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,245,247,.38)', marginBottom: 9 };
  const cta = { width: '100%', height: 52, background: green, border: 'none', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' };

  return (
    <div style={{ padding: '0 28px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 36, paddingBottom: 24 }}>
        <div style={{ width: 68, height: 68, background: 'linear-gradient(145deg,rgba(52,211,153,.18),rgba(52,211,153,.04))', border: '1px solid rgba(52,211,153,.28)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <ShieldLogo />
        </div>
        <div style={{ font: "700 32px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '-.04em', marginBottom: 7 }}>RewardTrust</div>
        <div style={{ font: "300 14px/1 'Inter'", color: 'rgba(245,245,247,.45)', marginBottom: 44 }}>Know before you pay.</div>

        {step === 'phone' ? (
          <>
            <div style={{ width: '100%', marginBottom: 12 }}>
              <div style={label}>Mobile Number</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,.1)', borderRadius: 13, padding: '0 12px', height: 52, display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>🇮🇳</span>
                  <span style={{ font: "600 14px/1 'Outfit'", color: '#F5F5F7' }}>+91</span>
                </div>
                <div style={{ background: '#141418', border: `1.5px solid rgba(52,211,153,${phone ? '.38' : '.15'})`, borderRadius: 13, padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', flex: 1, boxShadow: phone ? '0 0 0 3px rgba(52,211,153,.07)' : 'none' }}>
                  <input
                    inputMode="numeric" maxLength={10} value={phone} autoFocus
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210" aria-label="Mobile number"
                    style={{ font: "500 17px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '.06em', background: 'transparent', border: 'none', outline: 'none', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <button style={{ ...cta, marginBottom: 20, opacity: phoneValid ? 1 : 0.5, cursor: phoneValid ? 'pointer' : 'default' }} disabled={!phoneValid} onClick={() => setStep('otp')}>
              <span style={{ font: "600 15px/1 'Inter'", color: '#0B0B0E' }}>Send OTP</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0B0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
              <span style={{ font: "400 11px/1 'Inter'", color: 'rgba(245,245,247,.28)' }}>demo — enter any 4-digit code next</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginBottom: 14 }}>
              <Trust icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 22S4 18 4 12V5l8-3 8 3v7c0 6-8 10-8 10Z" stroke="#34D399" strokeWidth="1.5" strokeLinejoin="round" /></svg>} text="RBI compliant" />
              <Trust icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="rgba(245,245,247,.38)" strokeWidth="1.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="rgba(245,245,247,.38)" strokeWidth="1.5" strokeLinecap="round" /></svg>} text="Encrypted" />
              <Trust icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="rgba(245,245,247,.38)" strokeWidth="1.5" strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke="rgba(245,245,247,.38)" strokeWidth="1.5" /></svg>} text="50K+ users" />
            </div>
            <div style={{ font: "400 10.5px/1.6 'Inter'", color: 'rgba(245,245,247,.22)', textAlign: 'center', maxWidth: 280 }}>By continuing you agree to our Terms of Service and Privacy Policy</div>
          </>
        ) : (
          <>
            <div style={{ width: '100%', marginBottom: 12 }}>
              <div style={label}>Verification Code</div>
              <div style={{ background: '#141418', border: '1.5px solid rgba(52,211,153,.38)', borderRadius: 13, padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', boxShadow: '0 0 0 3px rgba(52,211,153,.07)' }}>
                <input
                  inputMode="numeric" maxLength={6} value={otp} autoFocus
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-digit code" aria-label="OTP"
                  style={{ font: "500 17px/1 'Outfit'", color: '#F5F5F7', letterSpacing: '.3em', background: 'transparent', border: 'none', outline: 'none', width: '100%' }}
                />
              </div>
              <div style={{ font: "400 11px/1.5 'Inter'", color: 'rgba(245,245,247,.4)', marginTop: 10 }}>Sent to +91 {phone}</div>
            </div>
            <button style={{ ...cta, marginBottom: 16, opacity: otp.length >= 4 ? 1 : 0.5, cursor: otp.length >= 4 ? 'pointer' : 'default' }} disabled={otp.length < 4} onClick={() => onLogin(phone)}>
              <span style={{ font: "600 15px/1 'Inter'", color: '#0B0B0E' }}>Verify &amp; continue</span>
            </button>
            <button onClick={() => setStep('phone')} style={{ background: 'none', border: 'none', color: green, font: "500 12px/1 'Inter'", cursor: 'pointer' }}>← change number</button>
          </>
        )}
      </div>
    </div>
  );
}

function Trust({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {icon}
      <span style={{ font: "400 10.5px/1 'Inter'", color: 'rgba(245,245,247,.38)' }}>{text}</span>
    </div>
  );
}
