import React from 'react';
import { BrowserProvider } from 'ethers';
import { CONFIG } from '../lib/config';

function ConnectWallet({ onConnect, address }) {
  const connect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    
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
      console.error(error);
    }
  };

  return (
    <div>
      {address ? (
        <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
          <div className="w-2 h-2 rounded-full bg-bot"></div>
          <span className="text-sm">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
      ) : (
        <button
          onClick={connect}
          className="bg-bot text-black font-semibold px-4 py-2 rounded-xl hover:bg-[#00b894] transition"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default ConnectWallet;
