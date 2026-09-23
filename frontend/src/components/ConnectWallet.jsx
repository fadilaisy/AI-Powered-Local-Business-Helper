import React from 'react';
import { BrowserProvider } from 'ethers';
import { CONFIG } from '../lib/config';

function ConnectWallet({ onConnect, address }) {
  const [connecting, setConnecting] = React.useState(false);

  const connect = async () => {
    if (!window.ethereum) {
      alert("MetaMask is required to connect to BOT Chain.");
      return;
    }
    
    setConnecting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const networkConfig = CONFIG[CONFIG.NETWORK];
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkConfig.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
        }
      }

      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      
      onConnect(addr, signer, provider);
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setConnecting(false);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {address ? (
        <button
          onClick={copyAddress}
          title="Click to copy wallet address"
          className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] backdrop-blur-xl transition-all duration-150 active:scale-[0.98]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]"></span>
          </span>
          <span className="font-mono text-xs text-white/90 tracking-tight">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium border-l border-white/10 pl-2">
            {CONFIG.NETWORK}
          </span>
        </button>
      ) : (
        <button
          onClick={connect}
          disabled={connecting}
          className="relative inline-flex items-center justify-center px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] shadow-sm disabled:opacity-50"
        >
          {connecting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5 text-black" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connecting...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="3" />
                <path d="M16 12h2" />
              </svg>
              Connect Wallet
            </span>
          )}
        </button>
      )}
    </div>
  );
}

export default ConnectWallet;
