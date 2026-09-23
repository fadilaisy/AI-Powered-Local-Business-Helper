import React from 'react';

function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] mt-20 py-10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/40">
        
        {/* Brand & Purpose */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-bot/20 border border-bot/30 flex items-center justify-center text-bot font-bold text-xs">
            P
          </div>
          <div>
            <span className="font-semibold text-white/80">PromoVault</span>
            <span className="mx-2">·</span>
            <span>Proof of Originality for Local Business AI Marketing</span>
          </div>
        </div>

        {/* Mandatory Hackathon BOT Chain Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-bot transition-colors flex items-center gap-1"
          >
            <span>BOT Chain</span>
            <span className="text-[10px]">↗</span>
          </a>
          <span className="text-white/20">|</span>
          <a
            href="https://scan.botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-bot transition-colors flex items-center gap-1"
          >
            <span>BOT Explorer</span>
            <span className="text-[10px]">↗</span>
          </a>
          <span className="text-white/20">|</span>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/60">
            Build Week Vol.2
          </span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
