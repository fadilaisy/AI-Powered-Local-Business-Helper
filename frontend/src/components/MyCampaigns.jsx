import React, { useEffect, useState } from 'react';
import { CONFIG } from '../lib/config';
import BotChainLogo from './BotChainLogo';

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
          const campaign = await contract.getCampaign(id);
          loaded.push({
            id: id.toString(),
            owner: campaign[0],
            contentHash: campaign[1],
            category: campaign[2],
            platform: campaign[3],
            timestamp: new Date(Number(campaign[4]) * 1000).toLocaleString()
          });
        }
        setCampaigns(loaded.reverse());
      } catch (readError) {
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
      <section className="workspace-card flex min-h-[470px] flex-col items-center justify-center overflow-hidden p-8 text-center sm:p-12">
        <div className="relative mb-6 grid h-24 w-24 place-items-center rounded-[20px] border-2 border-line bg-accent shadow-pop">
          <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none" aria-hidden="true"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.8" /><path d="M4 8h14.5A1.5 1.5 0 0 1 20 9.5v4H17a2 2 0 0 1 0-4h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="16.5" cy="11.5" r=".7" fill="currentColor" /></svg>
          <span className="absolute -right-3 -top-3 grid h-8 w-8 place-items-center rounded-full border-2 border-line bg-brand text-[10px] font-black text-on-brand">01</span>
        </div>
        <h2 className="workspace-heading max-w-md">Connect the wallet that owns your records.</h2>
        <p className="workspace-copy mt-3 max-w-md">Your vault is read from BOT Chain using your connected address. Nothing is uploaded here; we only read the campaigns that address has anchored.</p>
        <span className="status-pill mt-7 bg-surface-soft"><span className="h-2 w-2 rounded-full bg-accent border border-line" /> No wallet required for public verification</span>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((item) => <div key={item} className="workspace-card animate-pulse p-6"><div className="h-5 w-28 rounded-full bg-surface-soft" /><div className="mt-8 h-20 rounded-[12px] bg-surface-soft" /><div className="mt-6 h-4 w-36 rounded-full bg-surface-soft" /></div>)}
      </div>
    );
  }

  if (error) {
    return (
      <section role="alert" className="workspace-card p-8 text-center sm:p-12">
        <h2 className="text-xl font-extrabold text-danger-ink">We couldn’t read your vault.</h2>
        <p className="workspace-copy mx-auto mt-3 max-w-md">{error}</p>
      </section>
    );
  }

  if (campaigns.length === 0) {
    return (
      <section className="workspace-card flex min-h-[470px] flex-col items-center justify-center overflow-hidden p-8 text-center sm:p-12">
        <div className="mb-6 grid h-24 w-24 place-items-center rounded-[20px] border-2 border-line bg-accent shadow-pop"><BotChainLogo className="h-14 w-14" /></div>
        <h2 className="workspace-heading">Your public record starts here.</h2>
        <p className="workspace-copy mt-3 max-w-md">Create a campaign, then make its fingerprint public. It will appear in this vault after the transaction confirms.</p>
        <span className="status-pill mt-7 bg-surface-soft"><BotChainLogo className="h-4 w-4" /> Built on BOT Chain</span>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="workspace-heading">Your anchored campaigns</h2><p className="mt-1 text-[13px] text-muted">{campaigns.length} public {campaigns.length === 1 ? 'record' : 'records'} from {address.slice(0, 6)}…{address.slice(-4)}</p></div>
        <span className="status-pill w-max bg-success-soft"><span className="h-2 w-2 rounded-full bg-success border border-line" /> Live on {CONFIG.chainName}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="workspace-card p-5 transition duration-200 hover:-translate-y-1 hover:shadow-pop sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border-2 border-line bg-accent px-3 py-1 text-[11px] font-extrabold">{campaign.platform || 'General'}</span>
                <span className="text-[11px] font-bold text-muted">{campaign.category}</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-muted">#{campaign.id}</span>
            </div>
            <div className="mt-5 rounded-[12px] border-2 border-line bg-canvas p-3">
              <span className="block text-[10px] font-black uppercase tracking-[0.08em] text-muted">Exact-text fingerprint</span>
              <span className="mt-2 block select-all break-all font-mono text-[11px] leading-relaxed text-brand-text">{campaign.contentHash}</span>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-line-soft pt-4 text-[11px] text-muted"><span>{campaign.timestamp}</span><a href={`${explorerUrl}address/${contract?.target || CONFIG.contractAddress}`} target="_blank" rel="noopener noreferrer" className="font-extrabold text-ink underline decoration-2 underline-offset-4">View contract</a></div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default MyCampaigns;
