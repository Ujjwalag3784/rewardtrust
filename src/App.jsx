import React, { useState, useMemo } from 'react';

// Data
import merchantsData from './data/merchants.json';
import paymentMethodsData from './data/payment-methods.json';
import conditionsData from './data/conditions.json';
import programsData from './data/card-programs.json';
import mccCatalog from './data/mcc-catalog.json';

// Logic
import evaluateEligibility from './utils/evaluateEligibility';
import rankResults from './utils/rankResults';
import { tierLabel, formatVerified } from './utils/labels';
import { loadAll, addPrediction, setOutcome, corroborationFor } from './utils/verificationStore';
import { useHashRoute } from './router';

// Flow components
import MerchantSearch from './components/MerchantSearch';
import AmountInput from './components/AmountInput';
import ResultsRanking from './components/ResultsRanking';
import QrScanner from './components/QrScanner';

// Screens
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import TrustReportScreen from './screens/TrustReportScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

// Turn a raw engine verdict into a compatibility result the UI components consume.
function buildResult(methodId, merchant, amount, isPrime) {
  const program = programsData[methodId];
  if (!program) return null;

  const corroboration = corroborationFor(methodId, merchant.mcc);
  const r = evaluateEligibility({
    amount,
    merchant,
    program,
    mccCatalog,
    channel: 'online',
    options: { isPrime },
    corroboration,
  });

  const conditionsList = (r.conditions || []).map((cid) => ({
    id: cid,
    ...(conditionsData[cid] || { text: cid, type: 'info', icon: 'ℹ️' }),
  }));

  return {
    methodId,
    ...r,
    rate: r.effectiveRate,
    confidenceScore: r.confidence.score,
    sourceType: tierLabel(r.source?.tier),
    lastVerified: formatVerified(r.source?.lastVerified),
    conditionsList,
    isUnavailable: r.verdict === 'ineligible' || r.verdict === 'unknown',
  };
}

// Which bottom tab is highlighted for a given route.
function tabForRoute(route) {
  if (route === 'history') return 'history';
  if (route === 'profile') return 'profile';
  if (route === 'results' || route === 'trust_report') return 'trust';
  return 'explore';
}

export default function App() {
  const [route, navigate] = useHashRoute();

  // Data state
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [spendAmount, setSpendAmount] = useState(450);
  const [selectedCardIds, setSelectedCardIds] = useState(paymentMethodsData.map((c) => c.id));
  const [isPrime, setIsPrime] = useState(true);
  const [trustReportData, setTrustReportData] = useState(null);
  const [verTick, setVerTick] = useState(0);

  const rankedResults = useMemo(() => {
    if (!selectedMerchant || !spendAmount) return [];
    const computed = selectedCardIds
      .map((methodId) => buildResult(methodId, selectedMerchant, spendAmount, isPrime))
      .filter(Boolean);
    return rankResults(computed);
  }, [selectedMerchant, spendAmount, selectedCardIds, isPrime, verTick]);

  const activeTab = tabForRoute(route);

  const toggleCardSelection = (cardId) => {
    setSelectedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleSelectMerchant = (merchant) => {
    setSelectedMerchant(merchant);
    navigate('amount');
  };

  const handleAmountContinue = () => {
    if (spendAmount > 0) navigate('methods');
  };

  const handleMethodsContinue = () => {
    if (selectedCardIds.length > 0) navigate('results');
  };

  const handleShowTrustReport = (calculationResult) => {
    setTrustReportData(calculationResult);
    navigate('trust_report');
  };

  const handleAnalyzedQr = (scannedMerchant, scannedAmount) => {
    setSelectedMerchant(scannedMerchant);
    if (scannedAmount && scannedAmount > 0) setSpendAmount(scannedAmount);
    navigate('results');
  };

  const handleTrackPrediction = (result) => {
    addPrediction({
      cardId: result.methodId,
      cardName: result.cardName || result.methodId,
      merchantId: selectedMerchant?.id,
      merchantName: selectedMerchant?.fullName || selectedMerchant?.name,
      mcc: result.mcc,
      amount: spendAmount,
      predictedVerdict: result.verdict,
      predictedRate: result.effectiveRate,
      predictedReward: result.rewardAmount,
      source: result.source?.url,
    });
    setVerTick((t) => t + 1);
    navigate('history');
  };

  const handleSetOutcome = (id, outcome) => {
    setOutcome(id, outcome);
    setVerTick((t) => t + 1);
  };

  const handleReset = () => {
    setSelectedMerchant(null);
    setSpendAmount(450);
    setSelectedCardIds(paymentMethodsData.map((c) => c.id));
    navigate('landing');
  };

  const renderRoute = () => {
    switch (route) {
      case 'landing':
        return (
          <MerchantSearch
            merchants={merchantsData}
            selectedMerchantId={selectedMerchant?.id}
            onSelectMerchant={handleSelectMerchant}
            onContinue={() => selectedMerchant && navigate('amount')}
            onScanClick={() => navigate('scan')}
          />
        );
      case 'scan':
        return (
          <QrScanner
            merchants={merchantsData}
            mccCatalog={mccCatalog}
            onAnalyzed={handleAnalyzedQr}
            onBack={() => navigate('landing')}
          />
        );
      case 'amount':
        return (
          <AmountInput
            merchant={selectedMerchant}
            amount={spendAmount}
            onChangeAmount={setSpendAmount}
            onContinue={handleAmountContinue}
            onBack={() => navigate('landing')}
          />
        );
      case 'methods':
        return (
          <PaymentMethodsScreen
            methods={paymentMethodsData}
            selectedCardIds={selectedCardIds}
            onToggle={toggleCardSelection}
            onContinue={handleMethodsContinue}
            onBack={() => navigate('amount')}
          />
        );
      case 'results':
        if (rankedResults.length === 0) {
          return (
            <div className="screen-container">
              <div className="section-container padding-20">
                <p className="section-subtitle">Pick a merchant and amount first to see reward eligibility.</p>
                <div className="action-button-container">
                  <button className="btn-primary" onClick={() => navigate('landing')}>Start a lookup</button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <ResultsRanking
            merchant={selectedMerchant}
            spendAmount={spendAmount}
            rankedResults={rankedResults}
            paymentMethods={paymentMethodsData}
            onBack={() => navigate('amount')}
            onShowTrustReport={handleShowTrustReport}
            onTrackPrediction={handleTrackPrediction}
          />
        );
      case 'trust_report': {
        const report = trustReportData || rankedResults[0];
        const method = report ? paymentMethodsData.find((m) => m.id === report.methodId) : null;
        return (
          <TrustReportScreen report={report} method={method} spendAmount={spendAmount} onBack={() => navigate('results')} />
        );
      }
      case 'history':
        return <HistoryScreen records={loadAll()} onSetOutcome={handleSetOutcome} />;
      case 'profile':
        return <ProfileScreen isPrime={isPrime} onTogglePrime={setIsPrime} onReset={handleReset} />;
      default:
        return <div className="screen-container">Screen not found</div>;
    }
  };

  const tabs = [
    { id: 'explore', icon: '🧭', label: 'Explore', go: () => navigate('landing') },
    { id: 'history', icon: '🕒', label: 'History', go: () => navigate('history') },
    {
      id: 'trust',
      icon: '🛡️',
      label: 'Trust',
      go: () => (selectedMerchant && spendAmount ? navigate('results') : navigate('landing')),
    },
    { id: 'profile', icon: '👤', label: 'Profile', go: () => navigate('profile') },
  ];

  return (
    <div className="app-shell-backdrop">
      <div className="mobile-frame-wrapper">
        {route === 'landing' && (
          <div className="app-brand-header">
            <button className="brand-logo" onClick={handleReset}>RewardTrust</button>
            <div className="brand-actions">
              <span className="badge-location">Bengaluru, IN</span>
              <button className="bell-icon" aria-label="Notifications" onClick={() => alert('No new notifications.')}>🔔</button>
            </div>
          </div>
        )}

        <main className="main-content-viewport">{renderRoute()}</main>

        <nav className="app-bottom-tab-bar" aria-label="Primary">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab-item ${activeTab === t.id ? 'active' : ''}`}
              aria-current={activeTab === t.id ? 'page' : undefined}
              onClick={t.go}
            >
              <span className="tab-icon" aria-hidden="true">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
