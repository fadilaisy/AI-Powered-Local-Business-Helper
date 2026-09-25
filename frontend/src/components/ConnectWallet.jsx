import React, { useEffect, useState } from 'react';
import { CONFIG } from '../lib/config';
import { getBrowserProvider, verifyActiveContract } from '../lib/contract';

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 8h14.5A1.5 1.5 0 0 1 20 9.5v4H17a2 2 0 0 1 0-4h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16.5" cy="11.5" r=".7" fill="currentColor" />
    </svg>
  );
}

function ConnectWallet({ onConnect, onDisconnect, address }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!window.ethereum?.on) return undefined;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) onDisconnect();
      else connect();
    };
    const handleChainChanged = (chainIdHex) => {
      const chainIdNum = typeof chainIdHex === 'string' ? Number.parseInt(chainIdHex, 16) : Number(chainIdHex);
      if (chainIdNum === 677 && CONFIG.NETWORK !== 'MAINNET') {
        localStorage.setItem('promovault_network', 'MAINNET');
        window.location.reload();
      } else if (chainIdNum === 968 && CONFIG.NETWORK !== 'TESTNET') {
        localStorage.setItem('promovault_network', 'TESTNET');
        window.location.reload();
      } else {
        onDisconnect();
      }
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [onDisconnect]);

  const connect = async () => {
    if (!window.ethereum) {
      setError('An EVM wallet such as MetaMask is required to anchor campaigns.');
      return;
    }
    setConnecting(true);
    setError('');
    try {
      const provider = getBrowserProvider();
      const networkId = await provider.getNetwork();
      if (networkId.chainId !== Number.parseInt(CONFIG.chainId, 16)) {
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CONFIG.chainId }] });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: CONFIG.chainId, chainName: CONFIG.chainName, rpcUrls: CONFIG.rpcUrls, blockExplorerUrls: CONFIG.blockExplorerUrls, nativeCurrency: CONFIG.nativeCurrency }] });
          } else {
            throw switchError;
          }
        }
      }
      const connectedProvider = getBrowserProvider();
      if (!(await verifyActiveContract(connectedProvider))) throw new Error(`No PromoVault contract is deployed at the configured ${CONFIG.NETWORK} address`);
      const signer = await connectedProvider.getSigner();
      const addr = await signer.getAddress();
      onConnect(addr, signer, connectedProvider);
    } catch (connectError) {
      setError(connectError.code === 4001 ? 'Wallet connection was cancelled.' : connectError.message || 'Unable to connect the wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    try { await navigator.clipboard.writeText(address); setError(''); } catch { setError('Could not copy the wallet address.'); }
  };

  return (
    <div className="relative flex items-center gap-2">
      {address ? (
        <button type="button" onClick={copyAddress} title="Click to copy wallet address" className="group inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#11110f] bg-white px-3.5 py-2 text-left transition hover:-translate-y-0.5 hover:bg-[#f1f0eb] hover:shadow-[3px_3px_0_#11110f]">
          <span className="h-4 w-4 text-[#3157d5]"><WalletIcon /></span>
          <span className="font-mono text-[11px] font-bold">{address.slice(0, 6)}…{address.slice(-4)}</span>
          <span className="border-l border-[#c6c3ba] pl-2 text-[10px] font-black uppercase tracking-[0.06em] text-[#6d6a62]">{CONFIG.NETWORK}</span>
        </button>
      ) : (
        <button type="button" onClick={connect} disabled={connecting} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#11110f] bg-[#3157d5] px-4 py-2 text-[12px] font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#2447c4] hover:shadow-[3px_3px_0_#11110f] disabled:cursor-not-allowed disabled:opacity-60">
          <span className="h-4 w-4"><WalletIcon /></span>
          {connecting ? 'Connecting…' : 'Connect wallet'}
        </button>
      )}
      {error && <span role="alert" className="sr-only">{error}</span>}
      {error && (
        <div role="alert" className="fixed right-4 top-[88px] z-[60] max-w-sm rounded-[12px] border-2 border-[#11110f] bg-[#fff0ee] p-3 text-xs text-[#8e2e28] shadow-[5px_5px_0_#11110f]">
          {error}<button type="button" className="ml-2 underline" onClick={() => setError('')}>Dismiss</button>
        </div>
      )}
    </div>
  );
}

export default ConnectWallet;
