// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

/**
 * @dev Interface of the Entrypass token implementation.
 */

interface IMersMeta { 

    // The event emitted when new token is minted
    event NewTokenCreated(uint32 id);

    // The event emitted when token value is set
    event SetTokenValue(uint256 mintValue);

    // The event emitted when new URI is set
    event SetUri(string seturi);

    /**
     * @dev Set token ID mint price
     */
    function setTokenIDPrice(uint32 id, uint256 mintValue) external;

    /**
     * @dev Mint a new token 
     */
    function mintToken(uint32 id, uint256 amount) external payable;   

    /**
     * @dev Airdrop the Tokens to assigned address by the owner
     */
    function airDrop(address[] memory recipient, uint256[] memory amount , uint256 id) external;

    /**
     * @dev Set a new Base URI 
     */
    function setURI(string memory seturi) external;

    /**
     * @dev Get the Base URI 
     */
    function uri(uint id) external view returns (string memory); 

    /**
     * @dev Withdraw the share amount to account owner
     */
    function withdraw(address account) external;

    /**
     * @dev Pause the contract
     */
    function pause() external;

    /**
     * @dev Unpause the contract
     */
    function unpause() external;
}