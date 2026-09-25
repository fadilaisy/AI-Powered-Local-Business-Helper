import React from 'react';
import BotChainLogo from './BotChainLogo';
import { CONFIG } from '../lib/config';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] border-2 border-line bg-accent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M12 2l1.55 6.45L20 10l-6.45 1.55L12 18l-1.55-6.45L4 10l6.45-1.55L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="text-[14px] font-extrabold tracking-[-0.03em]">PromoVault</p>
            <p className="text-[12px] text-muted">AI copy with an exact-text public record.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[12px] font-bold">
          <a className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-line bg-surface px-4 transition hover:-translate-y-0.5 hover:bg-surface-soft hover:shadow-pop" href="https://botchain.ai" target="_blank" rel="noopener noreferrer">
            <BotChainLogo className="h-5 w-5" />
            Built on BOT Chain
          </a>
          <a className="rounded-full border-2 border-line bg-surface px-4 py-2.5 transition hover:-translate-y-0.5 hover:bg-surface-soft hover:shadow-pop" href={CONFIG.contractExplorerUrl} target="_blank" rel="noopener noreferrer" title={`View verified contract on ${CONFIG.chainName} explorer`}>
            View Contract
          </a>
          <span className="rounded-full border border-line-soft px-3 py-2 text-muted">Build Week Vol. 2</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
