import React, { useState, useMemo, useEffect } from 'react';

// Data
import merchantsData from './data/merchants.json';
import paymentMethodsData from './data/payment-methods.json';
import mccCatalog from './data/mcc-catalog.json';

// Logic
import { evaluateWallet } from './utils/lookup';
import { loadAll, addPrediction, setOutcome } from './utils/verificationStore';
import { getPhone, setPhone as persistPhone, getWallet, setWallet, isOnboarded, signOut } from './utils/walletStore';
import { useHashRoute } from './router';

// Components
import MerchantSearch from './components/MerchantSearch';
import AmountInput from './components/AmountInput';
import QrScanner from './components/QrScanner';
import WalletStrip from './components/WalletStrip';
import ResultsScreen from './components/ResultsScreen';
import HomeScreen from './screens/HomeScreen';
import Icon from './components/Icon';
import { StatusBar, TabBar } from './components/Chrome';

// Screens
import LoginScreen from './screens/LoginScreen';
import CardWalletScreen from './screens/CardWalletScreen';
import TrustReportScreen from './screens/TrustReportScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import AssistantScreen from './screens/AssistantScreen';

function tabForRoute(route) {
  if (route === 'history') return 'history';
  if (route === 'profile') return 'profile';
  if (route === 'results' || route === 'trust_report') return 'trust';
  if (route === 'assistant') return 'assistant';
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
  const [assistantQuery, setAssistantQuery] = useState('');

  useEffect(() => {
    if (!isOnboarded() && route !== 'login' && route !== 'wallet') navigate('login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  const walletCards = paymentMethodsData.filter((c) => walletIds.includes(c.id));

  const results = useMemo(() => {
    if (!selectedMerchant || !spendAmount) return [];
    return evaluateWallet(walletIds, selectedMerchant, spendAmount, { isPrime });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMerchant, spendAmount, walletIds, isPrime, verTick]);

  const activeTab = tabForRoute(route);

  const handleLogin = (num) => {
    persistPhone(num); setPhone(num);
    const w = getWallet(); setDraftWallet(w); setWalletMode('onboard');
    navigate(w.length > 0 ? 'landing' : 'wallet');
  };
  const toggleDraft = (id) => setDraftWallet((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const saveWallet = () => { setWallet(draftWallet); setWalletIds(draftWallet); navigate('landing'); };
  const openManageWallet = () => { setDraftWallet(walletIds); setWalletMode('manage'); navigate('wallet'); };

  const handleSelectMerchant = (m) => { setSelectedMerchant(m); navigate('amount'); };
  const handleAmountContinue = () => { if (spendAmount > 0) navigate('results'); };
  const handleShowTrustReport = (r) => { setTrustReportData(r); navigate('trust_report'); };
  const handleAnalyzedQr = (m, amt) => { setSelectedMerchant(m); if (amt > 0) setSpendAmount(amt); navigate('results'); };
  const openAssistant = (q) => { setAssistantQuery(q || ''); navigate('assistant'); };

  const handleTrackPrediction = (r) => {
    addPrediction({
      cardId: r.methodId, cardName: r.cardName || r.methodId,
      merchantId: selectedMerchant?.id, merchantName: selectedMerchant?.fullName || selectedMerchant?.name,
      mcc: r.mcc, amount: spendAmount, predictedVerdict: r.verdict,
      predictedRate: r.effectiveRate, predictedReward: r.rewardValueInr, source: r.source?.url,
    });
    setVerTick((t) => t + 1); navigate('history');
  };
  const handleSetOutcome = (id, outcome) => { setOutcome(id, outcome); setVerTick((t) => t + 1); };
  const handleDiagnose = (rec) => openAssistant(`Why didn't I get cashback at ${rec.merchantName} on ${rec.cardName}?`);
  const handleSignOut = () => { signOut(); setPhone(''); setWalletIds([]); setDraftWallet([]); setSelectedMerchant(null); navigate('login'); };

  const renderRoute = () => {
    switch (route) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'wallet':
        return <CardWalletScreen cards={paymentMethodsData} selected={draftWallet} onToggle={toggleDraft} onSave={saveWallet} onBack={() => navigate(walletMode === 'manage' ? 'profile' : 'login')} mode={walletMode} />;
      case 'landing':
        return (
          <HomeScreen
            walletCards={walletCards}
            merchants={merchantsData}
            records={loadAll()}
            onAsk={() => openAssistant('')}
            onScan={() => navigate('scan')}
            onReceipt={() => openAssistant('')}
            onManage={openManageWallet}
            onSelectMerchant={handleSelectMerchant}
          />
        );
      case 'scan':
        return <QrScanner merchants={merchantsData} mccCatalog={mccCatalog} onAnalyzed={handleAnalyzedQr} onBack={() => navigate('landing')} />;
      case 'assistant':
        return <AssistantScreen walletIds={walletIds} cards={paymentMethodsData} isPrime={isPrime} onShowTrustReport={handleShowTrustReport} onScanClick={() => navigate('scan')} onBack={() => navigate('landing')} initialQuery={assistantQuery} />;
      case 'amount':
        return <AmountInput merchant={selectedMerchant} amount={spendAmount} onChangeAmount={setSpendAmount} onContinue={handleAmountContinue} onBack={() => navigate('landing')} />;
      case 'results':
        if (results.length === 0) {
          return (<div className="screen-container"><div className="section-container padding-20"><p className="section-subtitle">Pick a merchant and amount first.</p><div className="action-button-container"><button className="btn-primary" onClick={() => navigate('landing')}>Start a lookup</button></div></div></div>);
        }
        return <ResultsScreen merchant={selectedMerchant} spendAmount={spendAmount} results={results} paymentMethods={paymentMethodsData} onBack={() => navigate('amount')} onShowTrustReport={handleShowTrustReport} onTrackPrediction={handleTrackPrediction} />;
      case 'trust_report': {
        const report = trustReportData || results[0];
        const method = report ? paymentMethodsData.find((m) => m.id === report.methodId) : null;
        return <TrustReportScreen report={report} method={method} spendAmount={spendAmount} onBack={() => navigate('results')} />;
      }
      case 'history':
        return <HistoryScreen records={loadAll()} onSetOutcome={handleSetOutcome} onDiagnose={handleDiagnose} />;
      case 'profile':
        return <ProfileScreen isPrime={isPrime} onTogglePrime={setIsPrime} onReset={handleSignOut} phone={phone} walletCount={walletIds.length} onManageCards={openManageWallet} />;
      default:
        return <div className="screen-container">Screen not found</div>;
    }
  };

  const showTab = !['login', 'wallet', 'scan'].includes(route);
  const fullBody = route === 'assistant' || route === 'scan';
  const showStatus = route !== 'scan';

  return (
    <div className="app-shell-backdrop">
      <div className="rp">
        <div className="rdi" />
        {showStatus && <StatusBar />}
        {fullBody ? renderRoute() : <div className="rs">{renderRoute()}</div>}
        {showTab && <TabBar active={activeTab} onTab={(id) => (
          id === 'explore' ? navigate('landing')
            : id === 'assistant' ? openAssistant('')
            : id === 'history' ? navigate('history')
            : navigate('profile')
        )} />}
        <div className="rhi"><div className="rhi-bar" /></div>
      </div>
    </div>
  );
}

