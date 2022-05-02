// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./IArtistCollectibles.sol";

contract MustafaCeceli is Initializable, ERC1155Upgradeable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable, ERC1155SupplyUpgradeable, IArtistCollectibles {
   
    using SafeMathUpgradeable for uint256;

    // Zero Address
    address constant ZERO_ADDRESS = address(0);

    // Name of the token
    string public name;

    // Symbol of the token
    string public symbol;

    // Token Uri mapping  correspond to token id
    mapping(uint => string) public tokenURI;

    // Mint Price 
    uint256 public mintPrice;

    // Token Id Counter
    uint256 private tokenIdCounter;

    // Token Amount which is set to 1 as this contract is for custom avatars  
    uint256 private tokenAmount;

    // Verum World Contract Address
    address private verumWorldContractAddress;

    function initialize(
        string memory tokenName, 
        string memory tokenSymbol,
        address verumWorldAddress,
        uint256 collectiblesPrice
    ) initializer external {
        require(verumWorldAddress != ZERO_ADDRESS, "MustafaCeceli: Cannot initialize with Zero Address..");
        __ERC1155_init("");
        __Ownable_init();
        __Pausable_init();
        __ERC1155Supply_init();
        name = tokenName;
        symbol = tokenSymbol;
        tokenAmount = 1;
        verumWorldContractAddress = verumWorldAddress;
        mintPrice = collectiblesPrice;
    }

    /// @dev This is the uri function. It is used by the users to get the metadata uri based on token id.
    /// @param id The collectionID of the artist
    function uri(uint256 id) public view override(ERC1155Upgradeable,IArtistCollectibles) whenNotPaused returns (string memory) {
        return tokenURI[id];
    }

    /// @dev This is the mint function. It is used by the verum world contract only from there you have to burn that token then this mint will automatic trigger from verum world contract.
    /// @param account The account address to which token should be mint.
    /// @param avatarURI The uri associated with the token.
    /// @param data Avatar data for any extra use

    function mint(address account, string memory avatarURI, bytes calldata data) external payable override onlyContract whenNotPaused nonReentrant {
        tokenURI[tokenIdCounter] = avatarURI;
        _mint(account, tokenIdCounter, tokenAmount, "");
        tokenIdCounter++;
        emit NewAvatarCreated(tokenIdCounter);
    }

    /// @dev This is the withdrawToAddress function. It is used by the owner to withdraw the particular amount to any address.
    /// @param account The account address in which ether should be sent.
    function withdrawToAddress(address account) external onlyOwner whenNotPaused nonReentrant {
        require(account != ZERO_ADDRESS, "MustafaCeceli: Cannot withdraw to Zero Address.");
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "MustafaCeceli: Contract balance should be greater than zero.");
        payable(account).transfer(contractBalance);
    }

    /// @dev This is the getContractBalance function. It is used to get the current balance of the contract.
    function getContractBalance() external view returns(uint256){
        return address(this).balance;
    }

    /// @dev This is the getMintPrice function. It is used to get the current mint price of this contract token.
    function getMintPrice() external view override returns(uint256) {
        return mintPrice;
    }

    /// @dev This is the setMintPrice function. It is used to set/update the current mint price of this contract token.
    /// @param collectiblesPrice The price of that token.
    function setMintPrice(uint256 collectiblesPrice) external override onlyOwner whenNotPaused{
        require(collectiblesPrice != mintPrice , "MustafaCeceli: New mint price cannot be same as old mint price.");
        mintPrice = collectiblesPrice;
        emit NewMintPriceSet(collectiblesPrice);
    }

    /// @dev This is the pause function. It is used pause the contract.
    function pause() external override onlyOwner {
        _pause();
    }

    /// @dev This is the unpause function. It is used to unpause the contract.
    function unpause() external override onlyOwner {
        _unpause();
    }

    /// @dev This is onlyContract modifier used in mint function where only verum world contract can call mint function. 
    modifier onlyContract() {
        require(verumWorldContractAddress == _msgSender() , "MustafaCeceli: Caller is not the verum world contract...");
        _;
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        whenNotPaused
        override(ERC1155Upgradeable, ERC1155SupplyUpgradeable)
    {
        // This contract tokens are non-transferable only new mint token can be transfered
        require(from == address(0) , "MustafaCeceli: Mustafa Ceceli Token is non transferable.");
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}