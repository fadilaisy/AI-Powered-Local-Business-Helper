import React, { useEffect, useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import PromptForm from './components/PromptForm';
import GeneratedCopy from './components/GeneratedCopy';
import MyCampaigns from './components/MyCampaigns';
import VerifyCampaign from './components/VerifyCampaign';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import BotChainLogo from './components/BotChainLogo';
import { getContract } from './lib/contract';
import { CONFIG } from './lib/config';
import History from './components/History';
import {
  addToHistory,
  getCurrentCampaign,
  loadHistory,
  markAnchored,
  upsertInHistory
} from './lib/history';

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
  const [lastPlatformLabel, setLastPlatformLabel] = useState('Instagram');
  const [lastPrompt, setLastPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [generationSource, setGenerationSource] = useState('ai');
  const [degradedReason, setDegradedReason] = useState(null);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  const [history, setHistory] = useState(() => loadHistory());

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
    // Seed the history from the single-campaign key on first load so users who
    // generated before history existed keep their work.
    const stored = getCurrentCampaign();
    if (!stored) return;
    setGeneratedText(stored.text);
    setContentHash(stored.contentHash);
    setLastCategory(stored.category || 'general');
    setLastPlatform(stored.platform || 'instagram');
    setLastPlatformLabel(stored.platformLabel || null);
    setLastPrompt(stored.prompt || '');
    setTxHash(stored.txHash || null);
    setGenerationSource(stored.source || 'fallback');
    setDegradedReason(stored.degradedReason || null);
    setHistory(addToHistory({ ...stored, createdAt: stored.createdAt }));
  }, []);

  useEffect(() => {
    // Persist the current campaign, then fold it into the history so a reload
    // restores the latest result while older rounds stay reachable.
    if (!generatedText || !contentHash) return;
    try {
      localStorage.setItem('promovault.generated', JSON.stringify({
        text: generatedText,
        contentHash,
        category: lastCategory,
        platform: lastPlatform,
        platformLabel: lastPlatformLabel,
        source: generationSource,
        degradedReason,
        characterCount: generatedText.length,
        prompt: lastPrompt,
        txHash
      }));
      setHistory(upsertInHistory({
        text: generatedText,
        contentHash,
        category: lastCategory,
        platform: lastPlatform,
        platformLabel: lastPlatformLabel,
        source: generationSource,
        degradedReason,
        characterCount: generatedText.length,
        prompt: lastPrompt,
        txHash
      }));
    } catch {
      /* storage unavailable - generation still succeeded */
    }
  }, [generatedText, contentHash, lastCategory, lastPlatform, lastPlatformLabel, lastPrompt, generationSource, degradedReason, txHash]);

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

  const handleGenerate = async ({ prompt, category, platform }) => {
    setIsGenerating(true);
    setGeneratedText(null);
    setContentHash(null);
    setTxHash(null);
    try {
      const businessCategory = category.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      const controller = new AbortController();
      // Comfortably above the server's 12s provider timeout so the client
      // observes the server's own fallback rather than aborting first.
      const timeout = setTimeout(() => controller.abort(), 20000);
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
        setLastCategory(data.businessCategory || businessCategory);
        setLastPlatform(data.platform || platform);
        setLastPlatformLabel(data.platformLabel || null);
        setLastPrompt(prompt);
        setGenerationSource(data.source || 'fallback');
        setDegradedReason(data.degradedReason || null);
        setHistory(addToHistory({
          text: data.text,
          contentHash: data.contentHash,
          category: data.businessCategory || businessCategory,
          platform: data.platform || platform,
          platformLabel: data.platformLabel,
          prompt,
          source: data.source || 'fallback',
          degradedReason: data.degradedReason || null,
          characterCount: data.characterCount
        }));
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

  // Load a past round back into the workspace so it can be re-read, re-anchored
  // or verified without regenerating.
  const handleRestore = (entry) => {
    setGeneratedText(entry.text);
    setContentHash(entry.contentHash);
    setLastCategory(entry.category || 'general');
    setLastPlatform(entry.platform || 'instagram');
    setLastPlatformLabel(entry.platformLabel || null);
    setLastPrompt(entry.prompt || '');
    setGenerationSource(entry.source || 'fallback');
    setDegradedReason(entry.degradedReason || null);
    setTxHash(entry.txHash || null);
    setActiveTab('Generate');
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
      setHistory(markAnchored(contentHash, transaction.hash));
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
            <span className="promo-brand-mark"><BotChainLogo className="h-5 w-5" /></span>
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
            <a
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line px-3 text-[12px] font-bold transition hover:-translate-y-0.5"
              href={CONFIG.contractExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`View verified contract on ${CONFIG.chainName} explorer`}
            >
              Contract ↗
            </a>
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
                    degradedReason={degradedReason}
                  />
                )}
                <History
                  entries={history}
                  activeHash={contentHash}
                  onRestore={handleRestore}
                  onRemoved={setHistory}
                />
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
