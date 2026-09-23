import React, { useState } from 'react';
import { CONFIG } from '../lib/config';

function GeneratedCopy({ generatedText, contentHash, onAnchor, isAnchoring, txHash }) {
  const [copied, setCopied] = useState(false);
  const [hashCopied, setHashCopied] = useState(false);

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyHash = () => {
    if (contentHash) {
      navigator.clipboard.writeText(contentHash);
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 2000);
    }
  };

  const explorerUrl = CONFIG[CONFIG.NETWORK].blockExplorerUrls[0];

  return (
    <div className="apple-glass rounded-3xl p-6 sm:p-8 space-y-6 transition-all duration-300">
      
      {/* Header with Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-bot"></span>
          <h3 className="text-sm font-semibold tracking-tight text-white/90">
            Generated Campaign Asset
          </h3>
        </div>
        
        <button
          onClick={handleCopyText}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white/80 transition-all active:scale-[0.97]"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-[#34C759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[#34C759]">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
              </svg>
              <span>Copy Text</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Content Box */}
      <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-5">
        <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed font-normal">
          {generatedText}
        </p>
      </div>

      {/* Proof-of-Originality Hash Badge */}
      {contentHash && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                Cryptographic Fingerprint (SHA-256)
              </span>
            </div>
            <div className="font-mono text-xs text-bot/90 break-all select-all">
              {contentHash}
            </div>
          </div>
          <button
            onClick={handleCopyHash}
            className="self-end sm:self-center px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-white/70 transition active:scale-[0.97]"
          >
            {hashCopied ? 'Copied' : 'Copy Hash'}
          </button>
        </div>
      )}

      {/* Action Section */}
      <div className="pt-2">
        {!txHash ? (
          <div className="space-y-3">
            <button
              onClick={onAnchor}
              disabled={isAnchoring}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-bot hover:bg-[#00e8ba] text-black text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] shadow-lg shadow-bot/20 disabled:opacity-50"
            >
              {isAnchoring ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Confirming on BOT Chain...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Anchor on BOT Chain (Proof of Originality)</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-white/40">
              Anchoring stamps this exact campaign hash on-chain with an immutable timestamp.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#34C759]/20 flex items-center justify-center text-[#34C759]">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#34C759]">
                  Successfully Anchored On-Chain
                </h4>
                <p className="text-xs text-white/60 font-mono break-all">
                  Tx: {txHash.slice(0, 14)}...{txHash.slice(-8)}
                </p>
              </div>
            </div>
            
            <a
              href={`${explorerUrl}tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-tight transition active:scale-[0.98]"
            >
              <span>View on Explorer</span>
              <span>↗</span>
            </a>
          </div>
        )}
      </div>

    </div>
  );
}

export default GeneratedCopy;
