import React, { useState } from 'react';
import { CONFIG, NETWORKS, switchNetworkConfig } from '../lib/config';

function NetworkSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const currentKey = CONFIG.NETWORK;

  const handleSelect = async (networkKey) => {
    if (networkKey === currentKey) {
      setIsOpen(false);
      return;
    }

    if (window.ethereum) {
      const target = NETWORKS[networkKey];
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: target.chainId }]
        });
      } catch (err) {
        if (err.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: target.chainId,
                chainName: target.chainName,
                rpcUrls: target.rpcUrls,
                blockExplorerUrls: target.blockExplorerUrls,
                nativeCurrency: target.nativeCurrency
              }]
            });
          } catch (addErr) {
            console.error('Failed to add chain', addErr);
          }
        }
      }
    }

    switchNetworkConfig(networkKey);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white/80 transition-all active:scale-[0.98]"
        title="Switch between BOT Chain Mainnet and Testnet"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            currentKey === 'MAINNET'
              ? 'bg-[#00D09C] shadow-[0_0_8px_rgba(0,208,156,0.6)]'
              : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
          }`}
        />
        <span className="hidden sm:inline">{CONFIG.chainName}</span>
        <span className="sm:hidden">{currentKey === 'MAINNET' ? 'Mainnet' : 'Testnet'}</span>
        <svg
          className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-1.5 z-50">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Select Network
            </div>
            {Object.keys(NETWORKS).map((key) => {
              const net = NETWORKS[key];
              const isSelected = key === currentKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(key)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        key === 'MAINNET' ? 'bg-[#00D09C]' : 'bg-amber-400'
                      }`}
                    />
                    <span>{net.chainName}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-bot font-semibold">Active</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default NetworkSelector;
