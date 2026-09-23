import React, { useState } from 'react';

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function VerifyCampaign({ contract }) {
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [calculatedHash, setCalculatedHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!content.trim() || !contract) return;
    setIsVerifying(true);
    setResult(null);
    try {
      const hash = await sha256(content.trim());
      setCalculatedHash(hash);
      const [exists, owner, timestamp] = await contract.verifyCampaign(hash);
      if (exists) {
        setResult({
          exists: true,
          owner,
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString()
        });
      } else {
        setResult({ exists: false });
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert('Verification failed. Ensure your wallet is connected to the right BOT Chain network.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="apple-glass rounded-3xl p-6 sm:p-8 space-y-6 transition-all duration-300">
      
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white mb-1.5">
          Verify Proof of Originality
        </h2>
        <p className="text-xs text-white/50 leading-relaxed max-w-xl">
          Paste any marketing copy or campaign text below. PromoVault computes its cryptographic SHA-256 hash and verifies against the BOT Chain registry in real-time.
        </p>
      </div>

      <div className="rounded-2xl bg-black/40 border border-white/[0.08] focus-within:border-bot/60 focus-within:ring-2 focus-within:ring-bot/10 transition-all duration-200">
        <textarea
          className="w-full bg-transparent p-4 text-sm text-white placeholder-white/25 focus:outline-none resize-none h-32 leading-relaxed"
          placeholder="Paste copy here to verify authentic creation..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setResult(null);
          }}
        />
      </div>

      <button
        onClick={handleVerify}
        disabled={!content.trim() || !contract || isVerifying}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white hover:bg-neutral-200 text-black text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isVerifying ? (
          <>
            <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Querying Smart Contract...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verify Authenticity on BOT Chain</span>
          </>
        )}
      </button>

      {/* Verification Result Card */}
      {result && (
        <div className="pt-2 animate-fadeIn">
          {result.exists ? (
            <div className="rounded-2xl bg-[#34C759]/10 border border-[#34C759]/30 p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#34C759] text-black flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#34C759]">
                    Verified Authentic Content
                  </h3>
                  <p className="text-[11px] text-white/50">
                    Stamped on-chain before any modification or copycat.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#34C759]/15 grid gap-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-white/40">Registered By:</span>
                  <span className="font-mono text-white/90 break-all text-[11px]">
                    {result.owner}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-white/40">Timestamp:</span>
                  <span className="text-white/90">
                    {result.timestamp}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-white/40">SHA-256 Hash:</span>
                  <span className="font-mono text-bot break-all text-[11px]">
                    {calculatedHash}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/25 p-5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm shrink-0">
                ✕
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-red-400">
                  Unregistered / Altered Content
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  No matching record exists for this exact text on BOT Chain. Even a single character change alters the SHA-256 fingerprint completely.
                </p>
                {calculatedHash && (
                  <div className="pt-1 font-mono text-[10px] text-white/30 break-all">
                    Computed: {calculatedHash}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default VerifyCampaign;
