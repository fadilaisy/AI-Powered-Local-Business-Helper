// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PromoVault {
    address public owner;

    struct Campaign {
        address business;
        bytes32 contentHash;
        string category;
        string platform;
        uint256 timestamp;
        bool exists;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256[]) public businessCampaigns;
    mapping(bytes32 => uint256) public hashToCampaign;

    event CampaignRegistered(
        uint256 indexed campaignId,
        address indexed business,
        bytes32 contentHash,
        string category,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    function registerCampaign(
        bytes32 contentHash,
        string memory category,
        string memory platform
    ) public returns (uint256) {
        require(hashToCampaign[contentHash] == 0, "Content already registered");
        require(bytes(category).length <= 80, "Category too long");
        require(bytes(platform).length <= 40, "Platform too long");
        require(businessCampaigns[msg.sender].length < 1000, "Campaign limit reached");

        campaignCount++;
        campaigns[campaignCount] = Campaign(
            msg.sender,
            contentHash,
            category,
            platform,
            block.timestamp,
            true
        );
        businessCampaigns[msg.sender].push(campaignCount);
        hashToCampaign[contentHash] = campaignCount;

        emit CampaignRegistered(
            campaignCount,
            msg.sender,
            contentHash,
            category,
            block.timestamp
        );

        return campaignCount;
    }

    function verifyCampaign(bytes32 contentHash) public view returns (
        bool exists,
        address business,
        uint256 timestamp
    ) {
        uint256 id = hashToCampaign[contentHash];
        if (id == 0) return (false, address(0), 0);
        Campaign memory c = campaigns[id];
        return (c.exists, c.business, c.timestamp);
    }

    function getCampaign(uint256 campaignId) public view returns (
        address business,
        bytes32 contentHash,
        string memory category,
        string memory platform,
        uint256 timestamp,
        bool exists
    ) {
        Campaign memory c = campaigns[campaignId];
        return (c.business, c.contentHash, c.category, c.platform, c.timestamp, c.exists);
    }

    function getMyCampaignCount() public view returns (uint256) {
        return businessCampaigns[msg.sender].length;
    }

    function getMyCampaignIds() public view returns (uint256[] memory) {
        return businessCampaigns[msg.sender];
    }
}
