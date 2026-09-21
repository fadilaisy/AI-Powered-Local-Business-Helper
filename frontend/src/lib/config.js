export const CONFIG = {
  TESTNET: {
    chainId: '0x3C8', // 968
    chainName: 'BOT Chain Testnet',
    rpcUrls: ['https://testnet-rpc.botchain.ai'],
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
  CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000', // Will be replaced after deployment
  API_URL: 'http://localhost:3001',
  NETWORK: 'TESTNET' // Change to 'MAINNET' for production
};
