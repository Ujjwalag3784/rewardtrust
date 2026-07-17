import React, { useState, useMemo, useEffect } from 'react';

// Data
import merchantsData from './data/merchants.json';
import paymentMethodsData from './data/payment-methods.json';
import conditionsData from './data/conditions.json';
import programsData from './data/card-programs.json';
import mccCatalog from './data/mcc-catalog.json';

// Logic
import evaluateEligibility from './utils/evaluateEligibility';
import { tierLabel, formatVerified } from './utils/labels';
import { loadAll, addPrediction, setOutcome, corroborationFor } from './utils/verificationStore';
import { getPhone, setPhone as persistPhone, getWallet, setWallet, isOnboarded, signOut } from './utils/walletStore';
import { useHashRoute } from './router';

// Components
import MerchantSearch from './components/MerchantSearch';
import AmountInput from './components/AmountInput';
import QrScanner from './components/QrScanner';
import WalletStrip from './components/WalletStrip';
import ResultsScreen from './components/ResultsScreen';

// Screens
import LoginScreen from './screens/LoginScreen';
import CardWalletScreen from './screens/CardWalletScreen';
import TrustReportScreen from './screens/TrustReportScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

// Evaluate one wallet card against a merchant + amount, shaped for the UI.
function buildResult(methodId, merchant, amount, isPrime) {
  const program = programsData[methodId];
  if (!program) return null;
  const corroboration = corroborationFor(methodId, merchant.mcc);
  const r = evaluateEligibility({
    amount, merchant, program, mccCatalog, channel: 'online', options: { isPrime }, corroboration,
  });
  const conditionsList = (r.conditions || []).map((cid) => ({
    id: cid, ...(conditionsData[cid] || { text: cid, type: 'info', icon: 'ℹ️' }),
  }));
  return {
    methodId, ...r,
    rate: r.effectiveRate,
    confidenceScore: r.confidence.score,
    sourceType: tierLabel(r.source?.tier),
    lastVerified: formatVerified(r.source?.lastVerified),
    conditionsList,
    isUnavailable: r.verdict === 'ineligible' || r.verdict === 'unknown',
  };
}

function tabForRoute(route) {
  if (route === 'history') return 'history';
  if (route === 'profile') return 'profile';
  if (route === 'results' || route === 'trust_report') return 'trust';
  return 'explore';
}

export default function App() {
  const [route, navigate] = useHashRoute();

  const [phone, setPhone] = useState(() => getPhone() || '');
  const [walletIds, setWalletIds] = useState(() => getWallet());
  const [draftWallet, setDraftWallet] = useState(() => getWallet());
  const [walletMode, setWalletMode] = useState('onboard');

  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [spendAmount, setSpendAmount] = useState(450);
  const [isPrime, setIsPrime] = useState(true);
  const [trustReportData, setTrustReportData] = useState(null);
  const [verTick, setVerTick] = useState(0);

  // Gate: if not onboarded, force login/wallet before anything else.
  useEffect(() => {
    if (!isOnboarded() && route !== 'login' && route !== 'wallet') {
      navigate('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  const walletCards = paymentMethodsData.filter((c) => walletIds.includes(c.id));

  const results = useMemo(() => {
    if (!selectedMerchant || !spendAmount) return [];
    return walletIds
      .map((id) => buildResult(id, selectedMerchant, spendAmount, isPrime))
      .filter(Boolean);
  }, [selectedMerchant, spendAmount, walletIds, isPrime, verTick]);

  const activeTab = tabForRoute(route);

  // ---- handlers ----
  const handleLogin = (num) => {
    persistPhone(num);
    setPhone(num);
    const w = getWallet();
    setDraftWallet(w);
    setWalletMode('onboard');
    navigate(w.length > 0 ? 'landing' : 'wallet');
  };

  const toggleDraft = (id) =>
    setDraftWallet((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const saveWallet = () => {
    setWallet(draftWallet);
    setWalletIds(draftWallet);
    navigate('landing');
  };

  const openManageWallet = () => {
    setDraftWallet(walletIds);
    setWalletMode('manage');
    navigate('wallet');
  };

  const handleSelectMerchant = (m) => { setSelectedMerchant(m); navigate('amount'); };
  const handleAmountContinue = () => { if (spendAmount > 0) navigate('results'); };
  const handleShowTrustReport = (r) => { setTrustReportData(r); navigate('trust_report'); };
  const handleAnalyzedQr = (m, amt) => { setSelectedMerchant(m); if (amt > 0) setSpendAmount(amt); navigate('results'); };

  const handleTrackPrediction = (r) => {
    addPrediction({
      cardId: r.methodId, cardName: r.cardName || r.methodId,
      merchantId: selectedMerchant?.id, merchantName: selectedMerchant?.fullName || selectedMerchant?.name,
      mcc: r.mcc, amount: spendAmount, predictedVerdict: r.verdict,
      predictedRate: r.effectiveRate, predictedReward: r.rewardValueInr, source: r.source?.url,
    });
    setVerTick((t) => t + 1);
    navigate('history');
  };

  const handleSetOutcome = (id, outcome) => { setOutcome(id, outcome); setVerTick((t) => t + 1); };

  const handleSignOut = () => {
    signOut();
    setPhone(''); setWalletIds([]); setDraftWallet([]); setSelectedMerchant(null);
    navigate('login');
  };

  const renderRoute = () => {
    switch (route) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'wallet':
        return (
          <CardWalletScreen
            cards={paymentMethodsData}
            selected={draftWallet}
            onToggle={toggleDraft}
            onSave={saveWallet}
            onBack={() => navigate(walletMode === 'manage' ? 'profile' : 'login')}
            mode={walletMode}
          />
        );
      case 'landing':
        return (
          <>
            {walletCards.length > 0 && <WalletStrip cards={walletCards} onManage={openManageWallet} />}
            <MerchantSearch
              merchants={merchantsData}
              selectedMerchantId={selectedMerchant?.id}
              onSelectMerchant={handleSelectMerchant}
              onContinue={() => selectedMerchant && navigate('amount')}
              onScanClick={() => navigate('scan')}
            />
          </>
        );
      case 'scan':
        return <QrScanner merchants={merchantsData} mccCatalog={mccCatalog} onAnalyzed={handleAnalyzedQr} onBack={() => navigate('landing')} />;
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
      case 'results':
        if (results.length === 0) {
          return (
            <div className="screen-container"><div className="section-container padding-20">
              <p className="section-subtitle">Pick a merchant and amount first.</p>
              <div className="action-button-container"><button className="btn-primary" onClick={() => navigate('landing')}>Start a lookup</button></div>
            </div></div>
          );
        }
        return (
          <ResultsScreen
            merchant={selectedMerchant}
            spendAmount={spendAmount}
            results={results}
            paymentMethods={paymentMethodsData}
            onBack={() => navigate('amount')}
            onShowTrustReport={handleShowTrustReport}
            onTrackPrediction={handleTrackPrediction}
          />
        );
      case 'trust_report': {
        const report = trustReportData || results[0];
        const method = report ? paymentMethodsData.find((m) => m.id === report.methodId) : null;
        return <TrustReportScreen report={report} method={method} spendAmount={spendAmount} onBack={() => navigate('results')} />;
      }
      case 'history':
        return <HistoryScreen records={loadAll()} onSetOutcome={handleSetOutcome} />;
      case 'profile':
        return (
          <ProfileScreen
            isPrime={isPrime}
            onTogglePrime={setIsPrime}
            onReset={handleSignOut}
            phone={phone}
            walletCount={walletIds.length}
            onManageCards={openManageWallet}
          />
        );
      default:
        return <div className="screen-container">Screen not found</div>;
    }
  };

  const showChrome = route !== 'login' && route !== 'wallet';
  const tabs = [
    { id: 'explore', icon: '🧭', label: 'Home', go: () => navigate('landing') },
    { id: 'history', icon: '🕒', label: 'History', go: () => navigate('history') },
    { id: 'trust', icon: '🛡️', label: 'Rewards', go: () => (selectedMerchant && spendAmount ? navigate('results') : navigate('landing')) },
    { id: 'profile', icon: '👤', label: 'Profile', go: () => navigate('profile') },
  ];

  return (
    <div className="app-shell-backdrop">
      <div className="mobile-frame-wrapper">
        {route === 'landing' && (
          <div className="app-brand-header">
            <button className="brand-logo" onClick={() => navigate('landing')}>RewardTrust</button>
            <div className="brand-actions">
              <span className="badge-location">Bengaluru, IN</span>
              <button className="bell-icon" aria-label="Notifications" onClick={() => alert('No new notifications.')}>🔔</button>
            </div>
          </div>
        )}

        <main className="main-content-viewport">{renderRoute()}</main>

        {showChrome && (
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
        )}
      </div>
    </div>
  );
}
