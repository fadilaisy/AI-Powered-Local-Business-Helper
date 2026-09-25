import React, { useState } from 'react';
import { CONFIG } from '../lib/config';
import {
  clearHistory,
  removeFromHistory,
  sortHistory
} from '../lib/history';

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7v5l3 2M4 12a8 8 0 1 0 2.3-5.6M4 5v3h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14M10 7V5h4v2M8 7l1 12h6l1-12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function formatWhen(iso) {
  const parsed = Date.parse(iso || '');
  if (!parsed) return 'Earlier';
  return new Date(parsed).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function History({ entries, onRestore, onRemoved, activeHash }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const ordered = sortHistory(entries);
  const explorerBase = CONFIG.blockExplorerUrls[0];

  if (ordered.length === 0) {
    return (
      <section className="workspace-card p-6 text-center sm:p-8">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-[14px] border-2 border-line bg-surface-soft text-muted">
          <span className="h-6 w-6"><HistoryIcon /></span>
        </span>
        <h3 className="workspace-heading !text-[20px]">No past rounds yet</h3>
        <p className="workspace-copy mx-auto mt-2 max-w-sm">
          Every campaign you generate is saved here, on this device, so you can revisit earlier copy and its fingerprint later.
        </p>
      </section>
    );
  }

  return (
    <section className="workspace-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="workspace-heading !text-[20px]">Past rounds</h3>
          <p className="mt-1 text-[12px] text-muted">
            {ordered.length} saved {ordered.length === 1 ? 'round' : 'rounds'} on this device
          </p>
        </div>
        {confirmClear ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border-2 border-danger bg-danger-soft px-3 py-1.5 text-[11px] font-extrabold text-danger-ink"
              onClick={() => {
                clearHistory();
                onRemoved([]);
                setConfirmClear(false);
              }}
            >
              Delete all
            </button>
            <button
              type="button"
              className="rounded-full border-2 border-line bg-surface px-3 py-1.5 text-[11px] font-extrabold text-muted"
              onClick={() => setConfirmClear(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-1.5 text-[11px] font-extrabold text-muted transition hover:-translate-y-0.5 hover:bg-surface-soft"
          >
            <span className="h-3.5 w-3.5"><TrashIcon /></span>
            Clear
          </button>
        )}
      </div>

      <ol className="mt-5 space-y-3">
        {ordered.map((entry) => {
          const isOpen = expanded === entry.contentHash;
          const isActive = activeHash === entry.contentHash;
          return (
            <li
              key={entry.contentHash}
              className={`rounded-[14px] border-2 p-4 transition ${
                isActive ? 'border-line bg-surface-soft' : 'border-line-soft bg-surface'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border-2 border-line bg-accent px-2.5 py-0.5 text-[10px] font-extrabold text-accent-ink">
                      {entry.platformLabel || entry.platform || 'General'}
                    </span>
                    {entry.txHash && (
                      <span className="rounded-full border-2 border-line bg-success-soft px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.06em] text-success-ink">
                        On-chain
                      </span>
                    )}
                    {entry.source === 'fallback' && (
                      <span className="rounded-full border border-line-soft px-2.5 py-0.5 text-[10px] font-bold text-muted">
                        Template
                      </span>
                    )}
                    <span className="text-[11px] text-muted">{formatWhen(entry.createdAt)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink">
                    {entry.prompt || entry.text}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : entry.contentHash)}
                    className="rounded-full border-2 border-line bg-surface px-3 py-1.5 text-[11px] font-extrabold text-muted transition hover:-translate-y-0.5 hover:bg-surface-soft"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? 'Hide' : 'View'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRestore(entry)}
                    className="rounded-full border-2 border-line bg-brand px-3 py-1.5 text-[11px] font-extrabold text-on-brand transition hover:-translate-y-0.5"
                  >
                    Reuse
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 space-y-3 border-t-2 border-line-soft pt-4">
                  <p className="whitespace-pre-wrap rounded-[10px] bg-surface-soft p-3 text-[12px] leading-relaxed text-ink">
                    {entry.text}
                  </p>
                  <p className="select-all break-all font-mono text-[10px] text-muted">{entry.contentHash}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {entry.txHash && (
                      <a
                        href={`${explorerBase}tx/${entry.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-text underline decoration-2 underline-offset-4"
                      >
                        <span className="h-3.5 w-3.5"><AnchorIcon /></span>
                        View transaction
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoved(removeFromHistory(entry.contentHash))}
                      className="ml-auto text-[11px] font-bold text-muted underline decoration-2 underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default History;
