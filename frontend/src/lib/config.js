export const NETWORKS = {
  MAINNET: {
    chainId: '0x2A5', // 677
    chainName: 'BOT Chain Mainnet',
    rpcUrls: ['https://rpc.botchain.ai'],
    blockExplorerUrls: ['https://scan.botchain.ai/'],
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    contractAddress: import.meta.env.VITE_MAINNET_CONTRACT_ADDRESS || '0xe25bD38d596c79Fb168d5Fd95CdEdB7af9C6adDF'
  },
  TESTNET: {
    chainId: '0x3C8', // 968
    chainName: 'BOT Chain Testnet',
    rpcUrls: ['https://rpc.bohr.life'],
    blockExplorerUrls: ['https://scan.bohr.life/'],
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    contractAddress: import.meta.env.VITE_TESTNET_CONTRACT_ADDRESS || '0xdc8B6e56E92C4a5ff327F9d21425b76bdb8Bb800'
  }
};

const getInitialNetwork = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('promovault_network');
    if (saved && NETWORKS[saved.toUpperCase()]) {
      return saved.toUpperCase();
    }
  }
  const envNet = (import.meta.env.VITE_BOT_NETWORK || 'MAINNET').toUpperCase();
  return NETWORKS[envNet] ? envNet : 'MAINNET';
};

export const ACTIVE_NETWORK = getInitialNetwork();

export const CONFIG = {
  ...NETWORKS[ACTIVE_NETWORK],
  NETWORK: ACTIVE_NETWORK,
  API_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://ai-powered-local-business-helper.vercel.app')
};

export const switchNetworkConfig = (targetNetwork) => {
  const net = targetNetwork.toUpperCase();
  if (NETWORKS[net]) {
    localStorage.setItem('promovault_network', net);
    window.location.reload();
  }
};
