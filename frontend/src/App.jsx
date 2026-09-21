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
  const [lastCategory, setLastCategory] = useState('general');
  const [lastPlatform, setLastPlatform] = useState('');
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
      const categoryKey = category.toLowerCase().replace('/', '_').replace(' ', '_');
      const res = await fetch(`${CONFIG.API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category: categoryKey, platform })
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setGeneratedText(data.text);
      setContentHash(data.contentHash);
      setLastCategory(category);
      setLastPlatform(platform);
    } catch (err) {
      console.error(err);
      alert('Failed to generate copy');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnchor = async () => {
    if (!contract || !contentHash) return;
    setIsAnchoring(true);
    setTxHash(null);
    try {
      const tx = await contract.registerCampaign(contentHash, lastCategory, lastPlatform);
      await tx.wait();
      setTxHash(tx.hash);
    } catch (err) {
      console.error(err);
      alert('Failed to anchor on chain');
    } finally {
      setIsAnchoring(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <header className="w-full max-w-4xl p-4 flex justify-between items-center mt-4">
        <h1 className="text-2xl font-bold text-bot">PromoVault</h1>
        <ConnectWallet onConnect={handleWalletConnect} address={address} />
      </header>

      <main className="w-full max-w-4xl flex-grow px-4 py-8">
        <div className="flex space-x-4 border-b border-gray-700 mb-6">
          {['Generate', 'My Campaigns', 'Verify'].map(tab => (
            <button
              key={tab}
              className={`pb-2 px-1 ${activeTab === tab ? 'text-bot border-b-2 border-bot font-semibold' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Generate' && (
          <div className="space-y-6">
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
          <MyCampaigns contract={contract} address={address} />
        )}

        {activeTab === 'Verify' && (
          <VerifyCampaign contract={contract} />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
