// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";

import "./BlackListUpgradeable.sol";
import "./IVerumWorld.sol";

abstract contract AbstractERC1155Factory is ERC1155SupplyUpgradeable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable, BlackListUpgradeable, IVerumWorld {

    string name_;
    string symbol_;

    function pause() external override onlyOwner {
        _pause();
    }

    function unpause() external override onlyOwner {
        _unpause();
    }   

    function name() external view returns (string memory) {
        return name_;
    }

    function symbol() external view returns (string memory) {
        return symbol_;
    }          

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }  
}