import React, { useState } from 'react';
import { CONFIG } from '../lib/config';

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AnchorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7v10M7 10H4v3a8 8 0 0 0 16 0v-3h-3M8 7h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GeneratedCopy({ generatedText, contentHash, onAnchor, isAnchoring, txHash, source }) {
  const [copied, setCopied] = useState(false);
  const [hashCopied, setHashCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const explorerUrl = CONFIG.blockExplorerUrls[0];

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopyError('');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Clipboard access failed. Select the text and copy it manually.');
    }
  };

  const handleCopyHash = async () => {
    if (!contentHash) return;
    try {
      await navigator.clipboard.writeText(contentHash);
      setCopyError('');
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 2000);
    } catch {
      setCopyError('Clipboard access failed. Select the hash and copy it manually.');
    }
  };

  return (
    <section className="workspace-card overflow-hidden" style={{ animation: 'workspace-in 420ms cubic-bezier(.16, 1, .3, 1) both' }}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#11110f] bg-[#ffdc35] px-5 py-4 sm:px-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border border-[#11110f] bg-[#169b63]" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Campaign ready</span>
          </div>
          <h2 className="text-[19px] font-extrabold tracking-[-0.04em]">Here’s the copy you can use.</h2>
        </div>
        <button type="button" onClick={handleCopyText} className="secondary-button bg-white">
          <span className="h-4 w-4">{copied ? <CheckIcon /> : <CopyIcon />}</span>
          {copied ? 'Copied' : 'Copy all'}
        </button>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {source === 'fallback' && (
          <div className="rounded-[12px] border-2 border-[#11110f] bg-[#ffe2dc] px-4 py-3 text-[13px] leading-relaxed text-[#6b261e]">
            <strong>Template fallback active.</strong> The AI provider is unavailable or not configured, so this copy came from the built-in template rather than an LLM.
          </div>
        )}
        {copyError && <p role="alert" className="rounded-[10px] border border-[#c43d35] bg-[#fff0ee] px-3 py-2 text-[12px] text-[#8e2e28]">{copyError}</p>}

        <div className="rounded-[15px] border-2 border-[#11110f] bg-[#fbfaf6] p-5 sm:p-6">
          <p className="whitespace-pre-wrap text-[16px] leading-[1.75] tracking-[-0.015em] text-[#191916]">{generatedText}</p>
        </div>

        {contentHash && (
          <div className="rounded-[15px] border-2 border-[#11110f] bg-[#3157d5] p-4 text-white sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/80">Exact-text fingerprint · SHA-256</p>
                <p className="mt-2 select-all break-all font-mono text-[12px] leading-relaxed text-white">{contentHash}</p>
              </div>
              <button type="button" onClick={handleCopyHash} className="shrink-0 rounded-full border-2 border-[#11110f] bg-white px-4 py-2 text-[12px] font-extrabold text-[#11110f] transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#11110f]">
                {hashCopied ? 'Hash copied' : 'Copy fingerprint'}
              </button>
            </div>
          </div>
        )}

        {!txHash ? (
          <div className="space-y-3">
            <button type="button" onClick={onAnchor} disabled={isAnchoring} className="primary-submit">
              <span className="h-5 w-5">{isAnchoring ? <span className="block h-full w-full animate-spin rounded-full border-2 border-[#11110f] border-t-transparent" /> : <AnchorIcon />}</span>
              {isAnchoring ? 'Confirming on BOT Chain…' : 'Make this fingerprint public'}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-[#6d6a62]">Optional. Connects your wallet and records this exact hash, category, and platform on BOT Chain.</p>
          </div>
        ) : (
          <div className="rounded-[15px] border-2 border-[#11110f] bg-[#dff8eb] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#11110f] bg-[#169b63] text-white">
                <span className="h-5 w-5"><CheckIcon /></span>
              </span>
              <div>
                <h3 className="text-[14px] font-extrabold">Public record confirmed</h3>
                <p className="mt-1 break-all font-mono text-[11px] text-[#426353]">Transaction: {txHash}</p>
              </div>
            </div>
            <a href={`${explorerUrl}tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="secondary-button mt-4 shrink-0 sm:mt-0">View transaction</a>
          </div>
        )}
      </div>
    </section>
  );
}

export default GeneratedCopy;
