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

function GeneratedCopy({ generatedText, contentHash, onAnchor, isAnchoring, txHash, source, degradedReason }) {
  const [copied, setCopied] = useState(false);
  const [hashCopied, setHashCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const explorerUrl = CONFIG.blockExplorerUrls[0];

  // Tell the user *why* the template was used, so a quota or billing problem is
  // distinguishable from a provider outage or a missing API key.
  const FALLBACK_EXPLANATIONS = {
    quota_exceeded: 'The AI provider has reached its request quota for this key, so this copy came from the built-in template instead of an LLM.',
    rate_limited: 'The AI provider is rate limiting requests right now, so this copy came from the built-in template.',
    provider_unavailable: 'The AI provider is temporarily unavailable, so this copy came from the built-in template.',
    timeout: 'The AI provider did not respond in time, so this copy came from the built-in template.',
    invalid_credentials: 'The AI provider rejected the configured API key, so this copy came from the built-in template.',
    invalid_model: 'The configured AI model is not available to this key, so this copy came from the built-in template.',
    provider_not_configured: 'No AI provider is configured, so this copy came from the built-in template.',
    provider_error: 'The AI provider could not be reached, so this copy came from the built-in template.'
  };
  const fallbackMessage = FALLBACK_EXPLANATIONS[degradedReason]
    || FALLBACK_EXPLANATIONS.provider_error;

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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-line bg-accent px-5 py-4 sm:px-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border border-line bg-success" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Campaign ready</span>
          </div>
          <h2 className="text-[19px] font-extrabold tracking-[-0.04em]">Here’s the copy you can use.</h2>
        </div>
        <button type="button" onClick={handleCopyText} className="secondary-button bg-surface">
          <span className="h-4 w-4">{copied ? <CheckIcon /> : <CopyIcon />}</span>
          {copied ? 'Copied' : 'Copy all'}
        </button>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {source === 'fallback' && (
          <div className="rounded-[12px] border-2 border-line bg-warn-soft px-4 py-3 text-[13px] leading-relaxed text-warn-ink">
            <strong>Template fallback active.</strong> {fallbackMessage}
          </div>
        )}
        {copyError && <p role="alert" className="rounded-[10px] border border-danger bg-danger-soft px-3 py-2 text-[12px] text-danger-ink">{copyError}</p>}

        <div className="rounded-[15px] border-2 border-line bg-surface-soft p-5 sm:p-6">
          <p className="whitespace-pre-wrap text-[16px] leading-[1.75] tracking-[-0.015em] text-ink">{generatedText}</p>
        </div>

        {contentHash && (
          <div className="rounded-[15px] border-2 border-line bg-brand p-4 text-on-brand sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-on-brand/80">Exact-text fingerprint · SHA-256</p>
                <p className="mt-2 select-all break-all font-mono text-[12px] leading-relaxed text-on-brand">{contentHash}</p>
              </div>
              <button type="button" onClick={handleCopyHash} className="shrink-0 rounded-full border-2 border-line bg-surface px-4 py-2 text-[12px] font-extrabold text-ink transition hover:-translate-y-0.5 hover:shadow-pop">
                {hashCopied ? 'Hash copied' : 'Copy fingerprint'}
              </button>
            </div>
          </div>
        )}

        {!txHash ? (
          <div className="space-y-3">
            <button type="button" onClick={onAnchor} disabled={isAnchoring} className="primary-submit">
              <span className="h-5 w-5">{isAnchoring ? <span className="block h-full w-full animate-spin rounded-full border-2 border-line border-t-transparent" /> : <AnchorIcon />}</span>
              {isAnchoring ? 'Confirming on BOT Chain…' : 'Make this fingerprint public'}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-muted">Optional. Connects your wallet and records this exact hash, category, and platform on BOT Chain.</p>
          </div>
        ) : (
          <div className="rounded-[15px] border-2 border-line bg-success-soft p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-line bg-success text-on-brand">
                <span className="h-5 w-5"><CheckIcon /></span>
              </span>
              <div>
                <h3 className="text-[14px] font-extrabold">Public record confirmed</h3>
                <p className="mt-1 break-all font-mono text-[11px] text-success-ink">Transaction: {txHash}</p>
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
