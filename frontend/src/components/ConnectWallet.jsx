import React, { useEffect, useState } from 'react';
import { CONFIG } from '../lib/config';
import { getBrowserProvider, verifyActiveContract } from '../lib/contract';

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
    } catch (err) {
      setError(err.code === 4001 ? 'Wallet connection was cancelled.' : err.message || 'Unable to connect the wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    try { await navigator.clipboard.writeText(address); setError(''); } catch { setError('Could not copy the wallet address.'); }
  };

  return (
    <div className="flex items-center gap-2">
      {address ? <button type="button" onClick={copyAddress} title="Click to copy wallet address" className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all active:scale-[0.98]"><span className="text-[10px] text-bot">●</span><span className="font-mono text-xs text-white/90">{address.slice(0, 6)}...{address.slice(-4)}</span><span className="text-[10px] text-white/50 uppercase tracking-widest border-l border-white/10 pl-2">{CONFIG.NETWORK}</span></button> : <button type="button" onClick={connect} disabled={connecting} className="relative inline-flex items-center justify-center px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition disabled:opacity-50">{connecting ? 'Connecting…' : 'Connect Wallet'}</button>}
      {error && <span role="alert" className="sr-only">{error}</span>}
      {error && <div role="alert" className="fixed top-16 right-4 z-[60] max-w-sm rounded-xl border border-red-400/30 bg-red-950/90 p-3 text-xs text-red-100 shadow-xl">{error}<button type="button" className="ml-2 underline" onClick={() => setError('')}>Dismiss</button></div>}
    </div>
  );
}

export default ConnectWallet;
