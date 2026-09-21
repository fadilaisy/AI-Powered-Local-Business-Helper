import React, { useEffect, useState } from 'react';
import { CONFIG } from '../lib/config';

function MyCampaigns({ contract, address }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      if (!contract || !address) {
        setLoading(false);
        return;
      }
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, [contract, address]);

  const explorerUrl = CONFIG[CONFIG.NETWORK].blockExplorerUrls[0];

  if (!address) {
    return <div className="text-center text-gray-400 py-10">Please connect your wallet to view campaigns.</div>;
  }

  if (loading) {
    return <div className="text-center text-bot py-10">Loading campaigns...</div>;
  }

  if (campaigns.length === 0) {
    return <div className="text-center text-gray-400 py-10">No campaigns yet. Generate your first one!</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {campaigns.map(camp => (
        <div key={camp.id} className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs font-semibold px-2 py-1 bg-bot/20 text-bot rounded-md">{camp.platform}</span>
              <span className="text-xs text-gray-400 ml-2">{camp.category}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mb-4">{camp.timestamp}</div>
          <div className="text-sm font-mono text-gray-300 break-all mb-4 bg-gray-900 p-2 rounded">
            Hash: {camp.contentHash.slice(0, 16)}...
          </div>
          <a
            href={`${explorerUrl}address/${contract.target}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-bot hover:underline"
          >
            Verify Contract ↗
          </a>
        </div>
      ))}
    </div>
  );
}

export default MyCampaigns;
