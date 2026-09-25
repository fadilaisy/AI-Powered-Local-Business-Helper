import React, { useEffect, useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import PromptForm from './components/PromptForm';
import GeneratedCopy from './components/GeneratedCopy';
import MyCampaigns from './components/MyCampaigns';
import VerifyCampaign from './components/VerifyCampaign';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import { getContract } from './lib/contract';
import { CONFIG } from './lib/config';

const TABS = [
  { id: 'Generate', label: 'Create' },
  { id: 'My Campaigns', label: 'My vault' },
  { id: 'Verify', label: 'Verify' }
];

const TAB_COPY = {
  Generate: {
    title: <>Your idea. <span>Ready to publish.</span></>,
    description: 'Turn a plain-language promotion into platform-ready copy, then keep a public timestamp for the exact words you choose to publish.'
  },
  'My Campaigns': {
    title: <>Your best work, <span>made permanent.</span></>,
    description: 'Open the campaigns already anchored by your connected wallet. Each record stores a fingerprint, metadata, owner, and first submission time.'
  },
  Verify: {
    title: <>Check the record. <span>No wallet needed.</span></>,
    description: 'Paste the exact campaign text or its 32-byte fingerprint. PromoVault reads the public BOT Chain record directly and tells you what exists.'
  }
};

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l1.55 6.45L20 10l-6.45 1.55L12 18l-1.55-6.45L4 10l6.45-1.55L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlowIcon({ type }) {
  if (type === 'brief') {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (type === 'copy') {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 7V4h12v12h-3M4 8h12v12H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
  }
  if (type === 'hash') {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 3L7 21M17 3l-2 18M4 8h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l8 4v5c0 4.5-3.1 7.8-8 9-4.9-1.2-8-4.5-8-9V7l8-4zM9 12l2 2 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function App() {
  const [address, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [activeTab, setActiveTab] = useState('Generate');
  const [generatedText, setGeneratedText] = useState(null);
  const [contentHash, setContentHash] = useState(null);
  const [lastCategory, setLastCategory] = useState('General');
  const [lastPlatform, setLastPlatform] = useState('Instagram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [generationSource, setGenerationSource] = useState('ai');
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemTheme = (event) => {
      if (localStorage.getItem('promovault.theme')) return;
      const nextTheme = event.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#11110f' : '#f7f7f3');
      setTheme(nextTheme);
    };
    media.addEventListener('change', handleSystemTheme);
    return () => media.removeEventListener('change', handleSystemTheme);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('promovault.generated');
    if (!stored) return;
    try {
      const campaign = JSON.parse(stored);
      setGeneratedText(campaign.text);
      setContentHash(campaign.contentHash);
      setLastCategory(campaign.category || 'general');
      setLastPlatform(campaign.platform || 'instagram');
      setTxHash(campaign.txHash || null);
      setGenerationSource(campaign.source || 'fallback');
    } catch {
      localStorage.removeItem('promovault.generated');
    }
  }, []);

  const handleWalletConnect = (addr, sig, prov) => {
    setAddress(addr);
    setSigner(sig);
    setProvider(prov);
    setContract(getContract(sig));
  };

  const handleWalletDisconnect = () => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    setContract(null);
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const applyTheme = () => {
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;
      localStorage.setItem('promovault.theme', nextTheme);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#11110f' : '#f7f7f3');
      setTheme(nextTheme);
    };

    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  };

  const saveGeneratedCampaign = (campaign) => {
    localStorage.setItem('promovault.generated', JSON.stringify(campaign));
  };

  const handleGenerate = async ({ prompt, category, platform }) => {
    setIsGenerating(true);
    setGeneratedText(null);
    setContentHash(null);
    setTxHash(null);
    try {
      const businessCategory = category.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(`${CONFIG.API_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ prompt, businessCategory, platform })
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error?.message || error.error || `Server returned ${response.status}`);
        }
        const data = await response.json();
        setGeneratedText(data.text);
        setContentHash(data.contentHash);
        setLastCategory(businessCategory);
        setLastPlatform(data.platform || platform);
        setGenerationSource(data.source || 'fallback');
        saveGeneratedCampaign({ text: data.text, contentHash: data.contentHash, category: businessCategory, platform: data.platform || platform, source: data.source || 'fallback' });
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      const message = error.name === 'AbortError' ? 'The request took too long. Please try again.' : error.message || 'Please check your connection.';
      window.alert(`Failed to generate copy: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnchor = async () => {
    if (!contract || !contentHash) {
      window.alert('Please connect your wallet first.');
      return;
    }
    setIsAnchoring(true);
    setTxHash(null);
    try {
      const [exists] = await contract.verifyCampaign(contentHash);
      if (exists) {
        window.alert('This exact campaign hash is already registered on BOT Chain.');
        return;
      }
      const transaction = await contract.registerCampaign(contentHash, lastCategory, lastPlatform);
      await transaction.wait();
      setTxHash(transaction.hash);
      saveGeneratedCampaign({ text: generatedText, contentHash, category: lastCategory, platform: lastPlatform, source: generationSource, txHash: transaction.hash });
    } catch (error) {
      console.error(error);
      window.alert('Failed to anchor on chain. Check your BOT balance or network.');
    } finally {
      setIsAnchoring(false);
    }
  };

  const activeCopy = TAB_COPY[activeTab];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <a className="promo-brand" href="#top" aria-label="PromoVault home">
            <span className="promo-brand-mark"><SparkIcon /></span>
            <span className="promo-brand-name">PromoVault</span>
          </a>

          <nav className="primary-nav" aria-label="PromoVault sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? 'primary-nav-item is-active' : 'primary-nav-item'}
                aria-pressed={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
            <ConnectWallet onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} address={address} />
          </div>
        </div>
      </header>

      <main id="top" className="app-main">
        <section className="product-hero">
          <div className="hero-copy">
            <p className="product-promise"><span /> AI copy. Public proof.</p>
            <h1>{activeCopy.title}</h1>
            <p className="hero-description">{activeCopy.description}</p>
            <div className="hero-actions">
              <button className="primary-action" type="button" onClick={() => setActiveTab('Generate')}>
                Create a campaign <ArrowIcon />
              </button>
              <button className="text-action" type="button" onClick={() => setActiveTab('Verify')}>
                Verify a record
              </button>
            </div>
          </div>

          <div className="workspace-wrap" key={activeTab}>
            {activeTab === 'Generate' && (
              <div className="workspace generate-workspace">
                <PromptForm onGenerate={handleGenerate} isLoading={isGenerating} />
                {generatedText && (
                  <GeneratedCopy
                    generatedText={generatedText}
                    contentHash={contentHash}
                    onAnchor={handleAnchor}
                    isAnchoring={isAnchoring}
                    txHash={txHash}
                    source={generationSource}
                  />
                )}
              </div>
            )}
            {activeTab === 'My Campaigns' && <MyCampaigns contract={contract} address={address} />}
            {activeTab === 'Verify' && <VerifyCampaign />}
          </div>
        </section>

        <section className="proof-rail" aria-label="How PromoVault works">
          <div className="flow-item">
            <span className="flow-icon"><FlowIcon type="brief" /></span>
            <div><span>Describe</span><strong>Your promotion</strong></div>
          </div>
          <div className="flow-line" />
          <div className="flow-item">
            <span className="flow-icon"><FlowIcon type="copy" /></span>
            <div><span>Generate</span><strong>Platform-ready copy</strong></div>
          </div>
          <div className="flow-line" />
          <div className="flow-item">
            <span className="flow-icon"><FlowIcon type="hash" /></span>
            <div><span>Fingerprint</span><strong>The exact text</strong></div>
          </div>
          <div className="flow-line" />
          <div className="flow-item">
            <span className="flow-icon"><FlowIcon type="record" /></span>
            <div><span>Optionally</span><strong>Make it public</strong></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
