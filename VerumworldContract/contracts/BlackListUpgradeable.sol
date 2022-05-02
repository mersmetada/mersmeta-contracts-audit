// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Blacklist contract for Verum World Contract
/// @author The Systango Team

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BlackListUpgradeable is Initializable {

    // Mapping between the address and boolean for blacklisting
    mapping (address => bool) public blackList;

    // Event to trigger the addition of address to blacklist mapping
    event AddedToBlackList(address _user);

    // Event to trigger the removal of address from blacklist mapping
    event RemovedFromBlackList(address _user);
    
    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    function __BlackList_init() internal onlyInitializing {
        __BlackList_init_unchained();
    }

    function __BlackList_init_unchained() internal onlyInitializing {
    }

    // This function would add an address to the blacklist mapping
    /// @param _user The account to be added to blacklist

    function _addToBlackList(address _user) internal virtual returns (bool) {
        blackList[_user] = true;
        emit AddedToBlackList(_user);
        return true;
    }

    // This function would remove an address from the blacklist mapping
    /// @param _user The account to be removed from blacklist

    function _removeFromBlackList(address _user) internal virtual returns (bool) {
        delete blackList[_user];
        emit RemovedFromBlackList(_user);
        return true;
    }

    // This function would check an address from the blacklist mapping
    /// @param _user The account to be checked from blacklist mapping

    function _isBlackListUser(address _user) internal virtual returns (bool){
        return blackList[_user];
    }

    // Modifier to check address from the blacklist mapping
    /// @param _user The account to be checked from blacklist mapping

    modifier whenNotBlackListedUser(address _user) {
        require(!_isBlackListUser(_user), "BlackListUpgradeable: This address is in blacklist");
        _;
    }

}
