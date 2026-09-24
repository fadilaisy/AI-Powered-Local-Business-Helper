import React, { useEffect, useState } from 'react';
import { CONFIG } from '../lib/config';

function MyCampaigns({ contract, address }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCampaigns() {
      if (!contract || !address) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const ids = await contract.getMyCampaignIds();
        const loaded = [];
        for (const id of ids) {
          const camp = await contract.getCampaign(id);
          loaded.push({
            id: id.toString(),
            owner: camp[0],
            contentHash: camp[1],
            category: camp[2],
            platform: camp[3],
            timestamp: new Date(Number(camp[4]) * 1000).toLocaleString()
          });
        }
        setCampaigns(loaded.reverse());
      } catch (err) {
        setError('Could not read campaigns from BOT Chain. Check the RPC connection and try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, [contract, address]);

  const explorerUrl = CONFIG.blockExplorerUrls[0];

  if (!address) {
    return (
      <div className="apple-glass rounded-3xl p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto text-white/50 text-xl">
          🔒
        </div>
        <h3 className="text-base font-semibold text-white">Wallet Not Connected</h3>
        <p className="text-xs text-white/40 max-w-sm mx-auto">
          Connect your MetaMask wallet above to view your immutable marketing campaigns registered on BOT Chain.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((n) => (
          <div key={n} className="apple-glass rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded-full w-24"></div>
            <div className="h-10 bg-white/5 rounded-xl"></div>
            <div className="h-3 bg-white/10 rounded-full w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="apple-glass rounded-3xl p-12 text-center space-y-3">
        <h3 className="text-base font-semibold text-red-300">Vault unavailable</h3>
        <p className="text-xs text-white/50 max-w-sm mx-auto">{error}</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="apple-glass rounded-3xl p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-2xl">
          ✨
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">No Campaigns Anchored Yet</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto mt-1">
            Generate your first campaign copy under the "Generate" tab and anchor it to create proof-of-originality.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          Anchored Campaigns ({campaigns.length})
        </h2>
        <span className="text-[11px] text-white/40">
          Immutable On-Chain Records
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="apple-glass rounded-3xl p-5 sm:p-6 space-y-4 hover:border-white/[0.15] transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-bot/15 text-bot border border-bot/20">
                  {camp.platform || 'General'}
                </span>
                <span className="text-xs text-white/40 font-medium">
                  {camp.category}
                </span>
              </div>
              <span className="text-[11px] font-mono text-white/30">
                #{camp.id}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-white/40 tracking-wider block mb-1">
                Content Hash
              </span>
              <div className="bg-black/40 border border-white/[0.06] rounded-xl p-2.5 font-mono text-xs text-neutral-300 break-all select-all">
                {camp.contentHash}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/40 pt-2 border-t border-white/[0.05]">
              <span>{camp.timestamp}</span>
              <a
                href={`${explorerUrl}address/${contract?.target || CONFIG.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bot hover:text-[#00e8ba] font-medium transition inline-flex items-center gap-1"
              >
                <span>Contract</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyCampaigns;
