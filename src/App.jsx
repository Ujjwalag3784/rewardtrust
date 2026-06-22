import React, { useState, useMemo } from 'react';

// Data imports
import merchantsData from './data/merchants.json';
import paymentMethodsData from './data/payment-methods.json';
import conditionsData from './data/conditions.json';
import ratesData from './data/reward-rates.json';

// Utility imports
import calculateReward from './utils/calculateReward';
import rankResults from './utils/rankResults';
import formatCurrency from './utils/formatCurrency';

// Component imports
import MerchantSearch from './components/MerchantSearch';
import AmountInput from './components/AmountInput';
import ResultsRanking from './components/ResultsRanking';

export default function App() {
  // App navigation state
  // Screens: 'landing', 'amount', 'payment_methods', 'results', 'trust_report'
  const [currentScreen, setCurrentScreen] = useState('landing');
  
  // Bottom Tab Navigation: 'explore', 'history', 'trust', 'profile'
  const [activeTab, setActiveTab] = useState('explore');

  // User input states
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [spendAmount, setSpendAmount] = useState(450);
  const [selectedCardIds, setSelectedCardIds] = useState(
    paymentMethodsData.map(c => c.id) // Default to all cards selected
  );
  
  // Settings states
  const [isPrime, setIsPrime] = useState(true);

  // Trust report context (which calculation is being audited in Screen 5)
  const [trustReportData, setTrustReportData] = useState(null);

  // Computed results
  const rankedResults = useMemo(() => {
    if (!selectedMerchant || !spendAmount) return [];
    
    // Calculate for each selected payment method
    const computed = selectedCardIds.map(methodId => {
      const calc = calculateReward(
        spendAmount,
        selectedMerchant,
        methodId,
        ratesData,
        conditionsData,
        isPrime
      );
      return {
        methodId,
        ...calc
      };
    });

    // Rank computed rewards (highest first)
    return rankResults(computed);
  }, [selectedMerchant, spendAmount, selectedCardIds, isPrime]);

  // Handle card selection toggles (Screen 3)
  const toggleCardSelection = (cardId) => {
    setSelectedCardIds(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId) 
        : [...prev, cardId]
    );
  };

  // Nav actions
  const handleSelectMerchant = (merchant) => {
    setSelectedMerchant(merchant);
    setCurrentScreen('amount');
  };

  const handleLandingContinue = () => {
    if (selectedMerchant) {
      setCurrentScreen('amount');
    }
  };

  const handleAmountContinue = () => {
    if (spendAmount > 0) {
      setCurrentScreen('payment_methods');
    }
  };

  const handleMethodsContinue = () => {
    if (selectedCardIds.length > 0) {
      setCurrentScreen('results');
      setActiveTab('trust'); // Swapping active bottom tab to Trust as results contain verification
    } else {
      alert("Please select at least one payment method to continue.");
    }
  };

  const handleShowTrustReport = (calculationResult) => {
    setTrustReportData(calculationResult);
    setCurrentScreen('trust_report');
    setActiveTab('trust');
  };

  const handleReset = () => {
    setSelectedMerchant(null);
    setSpendAmount(450);
    setSelectedCardIds(paymentMethodsData.map(c => c.id));
    setCurrentScreen('landing');
    setActiveTab('explore');
  };

  // Render main screen component
  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return (
          <MerchantSearch
            merchants={merchantsData}
            selectedMerchantId={selectedMerchant?.id}
            onSelectMerchant={handleSelectMerchant}
            onContinue={handleLandingContinue}
          />
        );
      case 'amount':
        return (
          <AmountInput
            merchant={selectedMerchant}
            amount={spendAmount}
            onChangeAmount={setSpendAmount}
            onContinue={handleAmountContinue}
            onBack={() => setCurrentScreen('landing')}
          />
        );
      case 'payment_methods':
        return renderPaymentMethodsScreen();
      case 'results':
        return (
          <ResultsRanking
            merchant={selectedMerchant}
            spendAmount={spendAmount}
            rankedResults={rankedResults}
            paymentMethods={paymentMethodsData}
            onBack={() => setCurrentScreen('amount')}
            onShowTrustReport={handleShowTrustReport}
          />
        );
      case 'trust_report':
        return renderTrustReportScreen();
      default:
        return <div className="screen-container">Screen not found</div>;
    }
  };

  // Render Screen 3 (Payment Methods selection)
  const renderPaymentMethodsScreen = () => {
    return (
      <div className="screen-container animate-fade-in">
        {/* Header bar */}
        <div className="results-header-bar">
          <button className="back-btn" onClick={() => setCurrentScreen('amount')}>←</button>
          <h2 className="header-title">Payment Methods</h2>
          <span className="bell-icon">🔔</span>
        </div>

        <div className="section-container select-methods-section animate-slide-up">
          <h2 className="section-title">Which cards do you own?</h2>
          <p className="section-subtitle">Select your active accounts to compare. Multi-selection enabled.</p>

          <div className="methods-select-list">
            {paymentMethodsData.map(method => {
              const isSelected = selectedCardIds.includes(method.id);
              return (
                <div
                  key={method.id}
                  className={`method-select-card ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleCardSelection(method.id)}
                  style={{ '--border-color': method.borderColor }}
                >
                  <span className="method-badge-icon" style={{ background: method.bgGradient, borderColor: method.borderColor }}>
                    {method.badge}
                  </span>
                  <div className="method-details-col">
                    <span className="method-select-name">{method.name}</span>
                    <span className="method-select-type">{method.type}</span>
                  </div>
                  <div className="checkbox-outer">
                    {isSelected && <span className="checkbox-inner">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="action-button-container">
            <button
              className={`btn-primary ${selectedCardIds.length === 0 ? 'disabled' : ''}`}
              disabled={selectedCardIds.length === 0}
              onClick={handleMethodsContinue}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Screen 5 (Trust Report full breakdown)
  const renderTrustReportScreen = () => {
    const report = trustReportData || rankedResults[0];
    if (!report) return <div className="screen-container">No report available</div>;
    
    const method = paymentMethodsData.find(m => m.id === report.methodId);
    
    // Score based dynamic labels
    const score = report.confidenceScore;
    let trustLabel = "LOW CONFIDENCE";
    let trustColorClass = "text-red";
    if (score >= 90) {
      trustLabel = "HIGH CONFIDENCE";
      trustColorClass = "text-emerald";
    } else if (score >= 75) {
      trustLabel = "MEDIUM CONFIDENCE";
      trustColorClass = "text-yellow";
    }

    // Dynamic width variables for breakdown bars
    const tcWidth = score >= 90 ? '40%' : score >= 75 ? '35%' : '20%';
    const txWidth = score >= 90 ? '30%' : score >= 75 ? '25%' : '10%';
    const faqWidth = score >= 90 ? '20%' : score >= 75 ? '15%' : '5%';
    const commWidth = score >= 90 ? '10%' : score >= 75 ? '10%' : '5%';

    // Math calculation for circular gauge stroke-dasharray
    // Radius of circle is 40, circumference is 2 * PI * 40 ≈ 251
    const strokeDashoffset = 251.2 - (251.2 * score) / 100;

    return (
      <div className="screen-container trust-report-screen">
        {/* Header bar */}
        <div className="results-header-bar">
          <button className="back-btn" onClick={() => setCurrentScreen('results')}>←</button>
          <h2 className="header-title">Trust Report</h2>
          <span className="bell-icon">🔔</span>
        </div>

        <div className="trust-meta-subbar">
          <div className="subbar-unit">
            <span className="subbar-lbl">FOR RECOMMENDATION</span>
            <span className="subbar-val">{method?.name} · {formatCurrency(spendAmount)}</span>
          </div>
          <div className="subbar-unit text-right">
            <span className="subbar-lbl">REPORT ID</span>
            <span className="subbar-val">#RT-2025-06{report.rateEntryId ? `-${report.rateEntryId.split('_')[1]}` : ''}</span>
          </div>
        </div>

        <div className="trust-body animate-slide-up">
          {/* Trust Verdict Gauge Row */}
          <div className="trust-verdict-card">
            <div className="verdict-text-block">
              <div className="verdict-lbl">TRUST VERDICT</div>
              <h1 className={`verdict-title ${trustColorClass}`}>{trustLabel}</h1>
              <p className="verdict-desc">Institutionally verified · {score}th percentile reliability</p>
            </div>
            
            {/* Circular Gauge */}
            <div className="gauge-wrapper">
              <svg width="100" height="100" className="circular-gauge">
                <circle cx="50" cy="50" r="40" className="gauge-bg" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={`gauge-bar ${trustColorClass}-stroke`}
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="gauge-score-value">{score}<span>/100</span></div>
            </div>
          </div>

          {/* Confidence Breakdown Segment Bar */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <span className="breakdown-lbl">CONFIDENCE BREAKDOWN</span>
              <span className="breakdown-pts text-emerald">{score} pts</span>
            </div>
            
            <div className="segmented-bar">
              <div className="segment bg-emerald" style={{ width: tcWidth }}></div>
              <div className="segment bg-blue" style={{ width: txWidth }}></div>
              <div className="segment bg-purple" style={{ width: faqWidth }}></div>
              <div className="segment bg-yellow" style={{ width: commWidth }}></div>
            </div>

            <div className="legend-grid">
              <div className="legend-item"><span className="legend-dot bg-emerald"></span> T&C Sources <span className="legend-val">40</span></div>
              <div className="legend-item"><span className="legend-dot bg-blue"></span> Tx Data <span className="legend-val">30</span></div>
              <div className="legend-item"><span className="legend-dot bg-purple"></span> FAQs <span className="legend-val">20</span></div>
              <div className="legend-item"><span className="legend-dot bg-yellow"></span> Community <span className="legend-val">{score - 90 > 0 ? score - 90 : 8}</span></div>
            </div>
          </div>

          {/* Verification Chain Timeline */}
          <div className="timeline-card">
            <h4 className="timeline-section-title">VERIFICATION CHAIN</h4>
            <div className="timeline-list">
              {report.verificationChain && report.verificationChain.map((step, idx) => (
                <div key={idx} className="timeline-step">
                  <div className="timeline-marker-col">
                    <div className={`timeline-dot ${step.status === 'verified' ? 'verified' : step.status === 'low_weight' ? 'warning' : 'danger'}`}></div>
                    {idx < report.verificationChain.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-content-col">
                    <div className="step-header">
                      <span className="step-badge">{step.status.toUpperCase().replace('_', ' ')}</span>
                      <span className="step-title">{step.step}</span>
                    </div>
                    <p className="step-details">{step.details}</p>
                    <span className="step-time">{step.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source Quality List */}
          <div className="source-quality-card">
            <h4 className="timeline-section-title">SOURCE QUALITY</h4>
            <div className="sources-list">
              <div className="source-row">
                <span className="source-indicator green">🛡️</span>
                <span className="source-link-text">{merchant?.name?.toLowerCase()}.in/rewards/terms</span>
                <span className="source-tier-badge primary">PRIMARY</span>
              </div>
              <div className="source-row">
                <span className="source-indicator blue">📄</span>
                <span className="source-link-text">{method?.name} Official FAQ ↗</span>
                <span className="source-tier-badge secondary">SECONDARY</span>
              </div>
              <div className="source-row">
                <span className="source-indicator purple">👥</span>
                <span className="source-link-text">Community Reports ({score + 44})</span>
                <span className="source-tier-badge tertiary">TERTIARY</span>
              </div>
            </div>
          </div>

          {/* Data Freshness Block */}
          <div className="freshness-card">
            <div className="freshness-row">
              <div>
                <span className="freshness-lbl">LAST FULL VERIFICATION</span>
                <h3 className="freshness-date">June 12, 2025</h3>
              </div>
              <span className="freshness-status-badge">● CURRENT</span>
            </div>
            
            <div className="validity-progress-bar-container">
              <div className="validity-lbl-row">
                <span>VALIDITY WINDOW</span>
                <span>21 of 30 days remaining</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div className="next-sched-row">
              <span>🕒 Next scheduled verification: July 3, 2025</span>
            </div>
          </div>

          {/* Educational Calculation Section */}
          <div className="methodology-card">
            <h4 className="methodology-title">How RewardTrust Calculates Rewards</h4>
            <ul className="methodology-points">
              <li>
                <span className="bullet-num">1</span>
                <div>
                  <strong>Data sourced from official pages:</strong> We poll credit card benefit schedules and merchant partnership terms continuously.
                </div>
              </li>
              <li>
                <span className="bullet-num">2</span>
                <div>
                  <strong>Conditions reviewed manually:</strong> Hidden riders, caps, and category exclusions are manually cataloged by our research team.
                </div>
              </li>
              <li>
                <span className="bullet-num">3</span>
                <div>
                  <strong>Confidence assigned by verification:</strong> Scores reflect data age, source authenticity, and transaction-backed validation.
                </div>
              </li>
              <li>
                <span className="bullet-num">4</span>
                <div>
                  <strong>Verify high-value decisions:</strong> While we verify aggressively, terms can change without notice. Always crosscheck large spends.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Render mock tab contents when Explore is not active
  const renderTabContent = () => {
    if (activeTab === 'history') {
      return (
        <div className="screen-container animate-fade-in">
          <div className="results-header-bar justify-center">
            <h2 className="header-title">Audit History</h2>
          </div>
          <div className="section-container padding-20">
            <p className="section-subtitle">Your past reward calculations and their verified ledger scores.</p>
            
            <div className="history-list">
              <div className="history-item">
                <div className="history-item-top">
                  <span className="hist-merc">📦 Amazon India</span>
                  <span className="hist-amt">₹12,500</span>
                </div>
                <div className="history-item-bottom">
                  <span>Calculated: ₹625.00 via Amazon Pay ICICI</span>
                  <span className="hist-score-badge green">98/100</span>
                </div>
              </div>
              <div className="history-item">
                <div className="history-item-top">
                  <span className="hist-merc">🧡 Swiggy Food</span>
                  <span className="hist-amt">₹840</span>
                </div>
                <div className="history-item-bottom">
                  <span>Calculated: ₹84.00 via HDFC Swiggy</span>
                  <span className="hist-score-badge green">95/100</span>
                </div>
              </div>
              <div className="history-item">
                <div className="history-item-top">
                  <span className="hist-merc">❤️ Zomato</span>
                  <span className="hist-amt">₹350</span>
                </div>
                <div className="history-item-bottom">
                  <span>Calculated: ₹17.50 via SBI Cashback</span>
                  <span className="hist-score-badge yellow">82/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'profile') {
      return (
        <div className="screen-container animate-fade-in">
          <div className="results-header-bar justify-center">
            <h2 className="header-title">User Settings</h2>
          </div>
          <div className="section-container padding-20 profile-settings">
            <div className="profile-hero">
              <div className="profile-avatar">🛡️</div>
              <h3 className="profile-name">Fintech Operator</h3>
              <p className="profile-email">operator@rewardtrust.com</p>
            </div>

            <div className="settings-card">
              <h4 className="settings-card-title">MEMBERSHIP CRITERIA</h4>
              <div className="setting-toggle-row">
                <div>
                  <div className="setting-label">Amazon Prime Membership</div>
                  <div className="setting-desc">Enables 5% cashback rate on Amazon card.</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isPrime}
                    onChange={(e) => setIsPrime(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-card margin-top-20">
              <h4 className="settings-card-title">MVP UTILITIES</h4>
              <button className="btn-secondary" onClick={handleReset}>
                Reset Selection Flow
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default or fallback: Render state-machine screen (Explore/Trust tabs coordinate here)
    return renderScreen();
  };

  return (
    <div className="app-shell-backdrop">
      <div className="mobile-frame-wrapper">
        {/* Top Status Indicators (iOS Mock) */}
        <div className="ios-status-bar">
          <span className="ios-time">9:41</span>
          <div className="ios-icons">
            <span className="ios-network">📶</span>
            <span className="ios-wifi">📶</span>
            <span className="ios-battery">🔋</span>
          </div>
        </div>

        {/* Global Brand Navigation (Only shown on select states, matching Figma header style) */}
        {currentScreen === 'landing' && activeTab === 'explore' && (
          <div className="app-brand-header">
            <h1 className="brand-logo" onClick={handleReset}>RewardTrust</h1>
            <div className="brand-actions">
              <span className="badge-location">Bengaluru, IN</span>
              <span className="bell-icon" onClick={() => alert("No new notifications.")}>🔔</span>
            </div>
          </div>
        )}

        {/* Dynamic Screen View */}
        <div className="main-content-viewport">
          {renderTabContent()}
        </div>

        {/* App Bottom Tab Navigation */}
        <div className="app-bottom-tab-bar">
          <div
            className={`tab-item ${activeTab === 'explore' && currentScreen !== 'results' && currentScreen !== 'trust_report' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('explore');
              if (currentScreen === 'results' || currentScreen === 'trust_report') {
                setCurrentScreen('landing'); // Reset back to explore flow
              }
            }}
          >
            <span className="tab-icon">🧭</span>
            <span className="tab-label">Explore</span>
          </div>
          <div
            className={`tab-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="tab-icon">🕒</span>
            <span className="tab-label">History</span>
          </div>
          <div
            className={`tab-item ${activeTab === 'trust' || currentScreen === 'results' || currentScreen === 'trust_report' ? 'active' : ''}`}
            onClick={() => {
              // If there are calculated results, let the user tap trust to jump back to results
              if (selectedMerchant && spendAmount) {
                setCurrentScreen('results');
                setActiveTab('trust');
              } else {
                alert("Please select a merchant and amount first to view verification reports.");
              }
            }}
          >
            <span className="tab-icon">🛡️</span>
            <span className="tab-label">Trust</span>
          </div>
          <div
            className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-label">Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
