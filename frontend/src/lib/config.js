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
  // ---- EDIT AFTER DEPLOYMENT (Point 2 & 3) ----
  // 1) Paste the address Remix gives you after deploying PromoVault.sol.
  //    Use the address from the SAME network you set in NETWORK below.
  CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
  // 2) After deploying the backend (Point 5), replace localhost with the live URL,
  //    e.g. 'https://promovault-api.up.railway.app'. Leave as-is while testing locally.
  API_URL: 'http://localhost:3001',
  // 3) Must MATCH the network you deployed the CONTRACT_ADDRESS to.
  //    'TESTNET' while testing, 'MAINNET' for the final judged submission.
  NETWORK: 'TESTNET'
};
