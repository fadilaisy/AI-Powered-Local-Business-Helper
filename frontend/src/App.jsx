import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
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

  const handleWalletConnect = (addr, sig, prov) => {
    setAddress(addr);
    setSigner(sig);
    setProvider(prov);
    setContract(getContract(sig));
  };

  const handleGenerate = async ({ prompt, category, platform }) => {
    setIsGenerating(true);
    setGeneratedText(null);
    setContentHash(null);
    setTxHash(null);
    try {
      const categoryKey = category.toLowerCase().replace('/', '_').replace(/ /g, '_');
      const res = await fetch(`${CONFIG.API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category: categoryKey, platform })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${res.status}`);
      }
      const data = await res.json();
      setGeneratedText(data.text);
      setContentHash(data.contentHash);
      setLastCategory(category);
      setLastPlatform(platform);
    } catch (err) {
      console.error(err);
      alert(`Failed to generate copy: ${err.message || 'Please check your connection.'}`);
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
      const tx = await contract.registerCampaign(contentHash, lastCategory, lastPlatform);
      await tx.wait();
      setTxHash(tx.hash);
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bot to-[#00A382] flex items-center justify-center shadow-lg shadow-bot/20">
              <span className="text-black font-extrabold text-sm">PV</span>
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

          <ConnectWallet onConnect={handleWalletConnect} address={address} />
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
              <VerifyCampaign contract={contract} />
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default App;
