export const ACTIVE_NETWORK = import.meta.env.VITE_BOT_NETWORK || 'TESTNET';
const network = ACTIVE_NETWORK.toUpperCase() === 'MAINNET' ? 'MAINNET' : 'TESTNET';

const NETWORK_CONFIG = {
  TESTNET: {
    chainId: '0x3C8', // 968
    chainName: 'BOT Chain Testnet',
    rpcUrls: ['https://rpc.bohr.life'],
    blockExplorerUrls: ['https://scan.bohr.life/'],
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    contractAddress: '0xdc8B6e56E92C4a5ff327F9d21425b76bdb8Bb800'
  },
  MAINNET: {
    chainId: '0x2A5', // 677
    chainName: 'BOT Chain Mainnet',
    rpcUrls: ['https://rpc.botchain.ai'],
    blockExplorerUrls: ['https://scan.botchain.ai/'],
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    contractAddress: import.meta.env.VITE_MAINNET_CONTRACT_ADDRESS || ''
  }
};

export const CONFIG = {
  ...NETWORK_CONFIG[network],
  NETWORK: network,
  API_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://ai-powered-local-business-helper.vercel.app')
};
