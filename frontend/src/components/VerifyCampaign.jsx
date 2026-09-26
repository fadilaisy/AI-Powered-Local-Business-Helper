import React, { useMemo, useState } from 'react';
import { getReadContract } from '../lib/contract';
import { CONFIG } from '../lib/config';
import BotChainLogo from './BotChainLogo';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return `0x${Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

function VerifyIcon({ found }) {
  return found ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" /><path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  );
}

function VerifyCampaign() {
  const [content, setContent] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const readContract = useMemo(() => getReadContract(), []);

  const handleVerify = async () => {
    const fingerprint = hashInput.trim();
    const pasted = content.trim();
    if (!fingerprint && !pasted) return;
    setIsVerifying(true);
    setResult(null);
    setError('');
    try {
      // Accept a fingerprint in either field. Previously a hash pasted into the
      // "exact text" box was hashed again, so it never matched the record.
      const candidate = fingerprint || pasted;
      const isFingerprint = /^0x[0-9a-fA-F]{64}$/.test(candidate);
      const hash = isFingerprint ? candidate : await sha256(candidate);
      const [exists, owner, timestamp] = await readContract.verifyCampaign(hash);
      setResult({
        hash,
        exists,
        owner,
        usedFingerprint: isFingerprint,
        timestamp: exists ? new Date(Number(timestamp) * 1000).toLocaleString() : null
      });
    } catch {
      setError('Verification failed. Check the active network and public RPC connection, then try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="workspace-card overflow-hidden">
      <div className="flex items-start justify-between gap-5 border-b-2 border-line bg-accent px-5 py-5 sm:px-6">
        <div>
          <h2 className="workspace-heading !text-ink">Check a public fingerprint</h2>
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">Paste the exact copy or its 32-byte fingerprint. PromoVault reads {CONFIG.chainName} directly, so no wallet or account is required.</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border-2 border-line bg-surface shadow-pop"><BotChainLogo className="h-7 w-7" /></span>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="control-label" htmlFor="verification-text">Exact campaign text</label>
            <textarea id="verification-text" className="control-input min-h-36 resize-none leading-relaxed" placeholder="Paste the copy without changing its whitespace…" value={content} onChange={(event) => { setContent(event.target.value); setResult(null); }} />
          </div>
          <div>
            <label className="control-label" htmlFor="verification-hash">Or paste a fingerprint</label>
            <input id="verification-hash" className="control-input font-mono text-[12px]" placeholder="0x…" value={hashInput} onChange={(event) => { setHashInput(event.target.value); setResult(null); }} />
            <p className="mt-3 text-[12px] leading-relaxed text-muted">Use this when you already have the exact SHA-256 value. Any change to the text creates a different fingerprint.</p>
          </div>
        </div>

        {error && <p role="alert" className="rounded-[12px] border-2 border-danger bg-danger-soft px-4 py-3 text-[13px] leading-relaxed text-danger-ink">{error}</p>}

        <button type="button" onClick={handleVerify} disabled={(!content.trim() && !hashInput.trim()) || isVerifying} className="primary-submit">
          {isVerifying ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-transparent" /> : <span className="h-5 w-5"><VerifyIcon /></span>}
          {isVerifying ? 'Reading the public record…' : 'Check this fingerprint'}
        </button>

        {result && (
          <div role="status" className={`rounded-[15px] border-2 border-line p-5 ${result.exists ? 'bg-success-soft' : 'bg-danger-soft'}`}>
            <div className="flex items-start gap-3">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-line text-on-brand ${result.exists ? 'bg-success' : 'bg-danger'}`}><span className="h-5 w-5"><VerifyIcon found={result.exists} /></span></span>
              <div>
                <h3 className="text-[16px] font-extrabold">{result.exists ? 'Public record found.' : 'No matching public record.'}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{result.exists ? 'This exact fingerprint was first submitted by the address below.' : 'No campaign with this exact fingerprint has been recorded on the configured network.'}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 border-t border-line-soft pt-4 text-[12px] text-muted">
              <p className="select-all break-all font-mono">{result.hash}</p>
              <p className="text-[11px] text-faint">
                {result.usedFingerprint
                  ? 'Checked directly from the pasted fingerprint.'
                  : 'Computed from the pasted text as SHA-256.'}
              </p>
              {result.exists && <><p>Submitted by <strong className="font-mono text-ink">{result.owner}</strong></p><p>First recorded <strong className="text-ink">{result.timestamp}</strong> on {CONFIG.chainName}</p></>}
            </div>
          </div>
        )}

        <p className="border-t border-line-soft pt-4 text-[11px] leading-relaxed text-muted">A public record proves that a hash was first submitted by an address at a recorded time. It does not prove authorship, business identity, or that AI generated the text.</p>
      </div>
    </section>
  );
}

export default VerifyCampaign;
