import React, { useState } from 'react';

// Demo login: mobile number + mock OTP (no backend). Any 4-digit OTP works.
export default function LoginScreen({ onLogin }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const phoneValid = /^[6-9]\d{9}$/.test(phone);

  return (
    <div className="screen-container animate-fade-in">
      <div className="landing-hero" style={{ paddingTop: 48 }}>
        <span className="badge-trust">🛡️ Trust Layer for Rewards</span>
        <h1 className="hero-title">Welcome to RewardTrust</h1>
        <p className="hero-subtitle">Sign in to build your card wallet and verify rewards before you pay.</p>
      </div>

      <div className="section-container animate-slide-up">
        {step === 'phone' ? (
          <>
            <h2 className="section-title">Enter your mobile number</h2>
            <p className="section-subtitle">We'll send a one-time code. (Demo: no real SMS is sent.)</p>
            <div className="login-phone-row">
              <span className="login-cc">+91</span>
              <input
                className="search-input login-input"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                aria-label="Mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="action-button-container">
              <button className={`btn-primary ${!phoneValid ? 'disabled' : ''}`} disabled={!phoneValid} onClick={() => setStep('otp')}>
                Send OTP
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="section-title">Enter the OTP</h2>
            <p className="section-subtitle">Sent to +91 {phone}. <strong>Demo:</strong> enter any 4 digits.</p>
            <input
              className="search-input login-input"
              inputMode="numeric"
              maxLength={6}
              placeholder="4-digit code"
              aria-label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <div className="action-button-container">
              <button className={`btn-primary ${otp.length < 4 ? 'disabled' : ''}`} disabled={otp.length < 4} onClick={() => onLogin(phone)}>
                Verify & continue
              </button>
            </div>
            <button className="hist-reset-link" onClick={() => setStep('phone')}>← change number</button>
          </>
        )}
      </div>
    </div>
  );
}
