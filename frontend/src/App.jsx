import React, { useEffect, useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import NetworkSelector from './components/NetworkSelector';
import PromptForm from './components/PromptForm';
import GeneratedCopy from './components/GeneratedCopy';
import MyCampaigns from './components/MyCampaigns';
import VerifyCampaign from './components/VerifyCampaign';
import Footer from './components/Footer';
import { getContract } from './lib/contract';
import { CONFIG } from './lib/config';

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

  useEffect(() => {
    const stored = localStorage.getItem('promovault.generated');
    if (stored) {
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
        const res = await fetch(`${CONFIG.API_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ prompt, businessCategory, platform })
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error?.message || errJson.error || `Server returned ${res.status}`);
        }
        const data = await res.json();
        setGeneratedText(data.text);
        setContentHash(data.contentHash);
        setLastCategory(businessCategory);
        setLastPlatform(data.platform || platform);
        setGenerationSource(data.source || 'fallback');
        saveGeneratedCampaign({ text: data.text, contentHash: data.contentHash, category: businessCategory, platform: data.platform || platform, source: data.source || 'fallback' });
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      const message = err.name === 'AbortError' ? 'The request took too long. Please try again.' : err.message || 'Please check your connection.';
      alert(`Failed to generate copy: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnchor = async () => {
    if (!contract || !contentHash) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsAnchoring(true);
    setTxHash(null);
    try {
      const [exists] = await contract.verifyCampaign(contentHash);
      if (exists) {
        alert('This exact campaign hash is already registered on BOT Chain.');
        return;
      }
      const tx = await contract.registerCampaign(contentHash, lastCategory, lastPlatform);
      await tx.wait();
      setTxHash(tx.hash);
      saveGeneratedCampaign({ text: generatedText, contentHash, category: lastCategory, platform: lastPlatform, source: generationSource, txHash: tx.hash });
    } catch (err) {
      console.error(err);
      alert('Failed to anchor on chain. Check your BOT balance or network.');
    } finally {
      setIsAnchoring(false);
    }
  };

  const TABS = [
    { id: 'Generate', label: 'Generate', icon: '✨' },
    { id: 'My Campaigns', label: 'My Vault', icon: '🗂️' },
    { id: 'Verify', label: 'Verify Authenticity', icon: '🛡️' }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center">
      
      {/* Apple-style Frosted Navigation Bar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-black/60 border-b border-white/[0.08] px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-bot/20 overflow-hidden border border-white/10">
              <img src="/botchain-logo.svg" alt="BOT Chain" className="w-8 h-8" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                PromoVault
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.08] text-bot border border-bot/20">
                  AI + BOT Chain
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={CONFIG.contractExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`View verified contract on ${CONFIG.chainName} explorer`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white/80 transition-all active:scale-[0.98]"
            >
              <span>Contract</span>
              <span className="text-[10px]">↗</span>
            </a>
            <NetworkSelector />
            <ConnectWallet onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} address={address} />
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="w-full max-w-4xl flex-grow px-4 pt-12 pb-20 space-y-10">
        
        {/* Apple Product-Style Hero */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-bot"></span>
            <span>Proof of Originality for Small Business Marketing</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.12]">
            Generate Campaign Copy. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
              Anchor It On-Chain.
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-lg mx-auto font-normal">
            Create high-converting copy in seconds, then anchor the SHA-256 fingerprint on BOT Chain so you hold cryptographic proof of your creative work.
          </p>

          {/* Segmented Floating Pill Switcher */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1 rounded-full bg-white/[0.05] border border-white/[0.08] backdrop-blur-xl">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all duration-150 active:scale-[0.97] ${
                      active
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tab Content Display */}
        <section className="max-w-2xl mx-auto">
          {activeTab === 'Generate' && (
            <div className="space-y-6 animate-fadeIn">
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

          {activeTab === 'My Campaigns' && (
            <div className="animate-fadeIn">
              <MyCampaigns contract={contract} address={address} />
            </div>
          )}

          {activeTab === 'Verify' && (
            <div className="animate-fadeIn">
              <VerifyCampaign />
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default App;
