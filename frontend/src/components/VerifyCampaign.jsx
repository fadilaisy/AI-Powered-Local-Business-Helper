import React, { useMemo, useState } from 'react';
import { getReadContract } from '../lib/contract';
import { CONFIG } from '../lib/config';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return `0x${Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

function VerifyCampaign() {
  const [content, setContent] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const readContract = useMemo(() => getReadContract(), []);

  const handleVerify = async () => {
    const value = hashInput.trim() || content;
    if (!value.trim()) return;
    setIsVerifying(true);
    setResult(null);
    setError('');
    try {
      const hash = /^0x[0-9a-fA-F]{64}$/.test(hashInput.trim()) ? hashInput.trim() : await sha256(value);
      const [exists, owner, timestamp] = await readContract.verifyCampaign(hash);
      setResult({ hash, exists, owner, timestamp: exists ? new Date(Number(timestamp) * 1000).toLocaleString() : null });
    } catch (err) {
      setError('Verification failed. Check the active network and public RPC connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="apple-glass rounded-3xl p-6 sm:p-8 space-y-6 transition-all duration-300">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white mb-1.5">Verify a Public Hash</h2>
        <p className="text-xs text-white/50 leading-relaxed max-w-xl">
          Paste exact campaign text or a 32-byte hash. PromoVault reads {CONFIG.chainName} directly; a wallet is not required.
        </p>
      </div>
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-white/60" htmlFor="verification-text">Campaign text</label>
        <textarea id="verification-text" className="w-full bg-black/40 border border-white/[0.08] rounded-2xl p-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-bot/60 resize-none h-28" placeholder="Paste copy without changing whitespace..." value={content} onChange={(e) => { setContent(e.target.value); setResult(null); }} />
        <label className="block text-xs font-semibold text-white/60" htmlFor="verification-hash">Or content hash</label>
        <input id="verification-hash" className="w-full bg-black/40 border border-white/[0.08] rounded-2xl px-4 py-3 text-xs font-mono text-white placeholder-white/25 focus:outline-none focus:border-bot/60" placeholder="0x..." value={hashInput} onChange={(e) => { setHashInput(e.target.value); setResult(null); }} />
      </div>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button type="button" onClick={handleVerify} disabled={(!content.trim() && !hashInput.trim()) || isVerifying} className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white hover:bg-neutral-200 text-black text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed">
        {isVerifying ? 'Querying smart contract…' : 'Verify public record'}
      </button>
      {result && <div role="status" className={`rounded-2xl border p-5 space-y-2 ${result.exists ? 'bg-[#34C759]/10 border-[#34C759]/30' : 'bg-red-500/10 border-red-500/25'}`}>
        <h3 className={`text-sm font-semibold ${result.exists ? 'text-[#34C759]' : 'text-red-300'}`}>{result.exists ? 'Public hash timestamp found' : 'No matching record'}</h3>
        <p className="font-mono text-xs text-white/70 break-all">{result.hash}</p>
        {result.exists && <><p className="text-xs text-white/60">Submitted by {result.owner}</p><p className="text-xs text-white/60">First recorded {result.timestamp} on {CONFIG.chainName}</p></>}
      </div>}
    </div>
  );
}

export default VerifyCampaign;
