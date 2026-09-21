import { Contract } from 'ethers';
import { CONFIG } from './config';

export const ABI = [
  "function registerCampaign(bytes32 contentHash, string category, string platform) external returns (uint256)",
  "function verifyCampaign(bytes32 contentHash) external view returns (bool exists, address business, uint256 timestamp)",
  "function getCampaign(uint256 campaignId) external view returns (address business, bytes32 contentHash, string category, string platform, uint256 timestamp, bool exists)",
  "function getMyCampaignCount() external view returns (uint256)",
  "function getMyCampaignIds() external view returns (uint256[])",
  "function campaignCount() external view returns (uint256)",
  "event CampaignRegistered(uint256 indexed campaignId, address indexed business, bytes32 contentHash, string category, uint256 timestamp)"
];

export function getContract(signer) {
  return new Contract(CONFIG.CONTRACT_ADDRESS, ABI, signer);
}
