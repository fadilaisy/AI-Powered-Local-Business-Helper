export const CONFIG = {
  TESTNET: {
    chainId: '0x3C8', // 968
    chainName: 'BOT Chain Testnet',
    rpcUrls: ['https://rpc.bohr.life'],
    blockExplorerUrls: ['https://scan.bohr.life/'],
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 }
  },
  MAINNET: {
    chainId: '0x2A5', // 677
    chainName: 'BOT Chain Mainnet',
    rpcUrls: ['https://rpc.botchain.ai'],
    blockExplorerUrls: ['https://scan.botchain.ai/'],
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 }
  },
  // Verified deployed PromoVault contract on BOT Chain Testnet (chainId 968)
  CONTRACT_ADDRESS: '0xdc8B6e56E92C4a5ff327F9d21425b76bdb8Bb800',
  
  // Live backend URL on Vercel. Points to the live serverless backend so local and remote testing both work out-of-the-box.
  API_URL: import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? '' : 'https://ai-powered-local-business-helper.vercel.app'),

  NETWORK: 'TESTNET'
};
