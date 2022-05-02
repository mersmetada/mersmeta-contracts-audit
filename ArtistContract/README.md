# MustafaCeceli Contract
Upgradeable contract for Artist Contract
The artist will have the Artist contract, specific to each artist. Users can burn the artist token to customize the avatar and once the customization gets over they can mint the token. When the user finishes the customization then the call from VerumWorld contract to Artist Contract will occur to check the sufficient funds.
The VerumWorld contract requests Artist contract and gets the current mint price. If the funds are available mint can be performed else it will be blocked. The withdraw function can be called when the transfer needs to happen in a particular address.

## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

## Table of Contents ##
1. [Setup](#setup)
2. [Commands](#commands)
3. [Contract Compile](#contract-compile)
4. [Contract Methods](#contract-methods)
5. [Truffle Config file](#truffle-config-file)
6. [Deploy On Local Network](#deploy-on-local-network)
7. [Deploy On Testnet Network](#deploy-on-testnet-network)
8. [Deploy On Rinkeby Network](#deploy-on-rinkeby-network)
9. [Test Case Coverage](#test-case-coverage)

## Setup

1. System Setup 

You'll need node, npm and the Truffle Suite to set up the development environment. 

- [Node](https://nodejs.org/en/)
    - Version - 16.13.0
- [Truffle Suite](https://www.trufflesuite.com/)
    - Version - 5.5.3

2. Wallet Setup

You will need a Blockchain wallet (Metamask) to deploy and test these smart contracts.

- To create a wallet on metamask install the Metamask extension on your web browser.
- Click on the Metamask extension and select Create a Wallet option from there.
- Setup a password for your Metamask login (Remember this is your Metamask login password not the account password).
- Tap to reveal the Secret Recovery Phrase and keep it safe with you.
- Confirm your Secret Recovery Phrase saved with you to add your account to Metamask.
- Now you can switch between Ethereum mainnet and other Test Networks.

3. EtherScan Setup

- You will require the EtherScan API KEY to verify and publish your smart contracts over the Binance Smart Chain public networks.
- To create an account on EtherScan go to [EtherScan](https://etherscan.io/register).
- Move to API-KEYs tab and click on Add button.
- Give the name to your API-KEY and it will be created.

Update the .env file from the .env.sample and place the values for the required fields.

- Update the Secret Recovery Phrase for MNEMONIC field.
- Update the EtherScan API KEY for ETHERSCANKEY field.

4. .env Sample

```cmd
INFURA=<Place your Infura Id>
MNEMONIC=<Place your Ethereum address seed phrase here>
ETHERSCANKEY=<Place your Etherscan API key here>
NAME=<Place your Token Name here>
SYMBOL=<Place your Token Symbol here>
BASEURI=<Place your Token URI here>
VerumWorldAddress=<Add your VerumWorld Address>
```

## Commands

  ```console
  npm install
  ``` 
    
  installs dependencies
    
  Dependencies List
  - @openzeppelin/contracts
  - @openzeppelin/contracts-upgradeable
  - @openzeppelin/truffle-upgrades
  - @openzeppelin/test-helpers
  - @truffle/hdwallet-provider
  - dotenv
  - keccak256
  - merkletreejs
  - truffle-flattener
  - solidity-coverage
  - truffle
  - truffle-plugin-verify

## Contract Compile

  ```console
    truffle compile --all
  ```

  compile the contracts

  Contracts List
  - MustafaCeceli.sol
  - IMustafaCeceli.sol
  - Migrations.sol

## Contract Methods

  - mint - Mint a new avatar
  - getMintPrice - Get the mint for the avatar creation
  - setMintPrice - Set the mint for the avatar creation

## Truffle Config File

This file would use your Mnemonic key and EtherScan API KEY to deploy the smart contracts on local network as well Ethereum and Test Network. 
These values will be picked up either from .env file explained above or the environment variables of the host system.

```js
require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = process.env.MNEMONIC;
const INFURA = process.env.INFURA;
const KEY = process.env.ETHERSCANKEY;

module.exports = {
  networks: {
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },

    ropsten: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `wss://ropsten.infura.io/ws/v3/${INFURA}`
        ),
      network_id: 3,
      timeoutBlocks: 200,
      skipDryRun: true,
    },

    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `wss://rinkeby.infura.io/ws/v3/${INFURA}`
        ),
      network_id: 4,
      timeoutBlocks: 200,
      skipDryRun: true,
    },

    kovan: {
      provider: () =>
        new HDWalletProvider(mnemonic, `wss://kovan.infura.io/ws/v3/${INFURA}`),
      network_id: 42,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.2",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },

  mocha: {
    enableTimeouts: false,
    before_timeout: 300000,
  },

  plugins: ["solidity-coverage", "truffle-plugin-verify"],

  api_keys: {
    etherscan: KEY,
  },
};


```

## Deploy On Local Network

Network Name - test

- To run smart contract on test first start

    `ganache-cli`

    in another terminal

- To migrate the contracts 

    `truffle migrate --reset --network test`

    - This will use the migrations/2_deploy_contract.js file and deploy the MersMeta contract.

        This file would use your NAME, SYMBOL, PAYEES, and SHARES fields from .env file and pass to the smart contract.

- To test the contracts 

    `truffle test --network test`

    - This will use the test/mersmetapass.test.js file and test the MersMeta contract.

## Deploy On Testnet Network

Network Name - testnet

- To migrate the contracts 

    `truffle migrate --network testnet`

    - This will use the migrations/2_deploy_contract.js file and deploy the MersMeta contract.

        This file would use your NAME, SYMBOL, PAYEES, and SHARES fields from .env file and pass to the smart contract.

## Deploy On Rinkeby Network 

Network Name - rinkeby

- To migrate the contracts 

    `truffle migrate --reset --network rinkeby`

    - This will use the migrations/2_deploy_contract.js file and deploy the MersMeta contract.

        This file would use your NAME, SYMBOL, PAYEES, and SHARES fields from .env file and pass to the smart contract.
        Make sure you enter the correct addresses you which to give the respective roles.
        Before deploying the contract to Mainnet make sure you have tested everything on local and corrected, as deployment on Mainnet will involve real coins and gas fees.

## Test Case Coverage

To run the unit test case coverage on the smart contract we have used solidity-coverage npm package. The command to run the test coverage is:

- `truffle run coverage` 


File                         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------------------|----------|----------|----------|----------|----------------|
 contracts/                  |    94.52 |    80.23 |      100 |    94.77 |                |
  AbstractERC1155Factory.sol |      100 |      100 |      100 |      100 |                |
  BlackListUpgradeable.sol   |      100 |      100 |      100 |      100 |                |
  IArtistCollectibles.sol    |      100 |      100 |      100 |      100 |                |
  IVerumWorld.sol            |      100 |      100 |      100 |      100 |                |
  MustafaCeceli.sol          |      100 |    66.67 |      100 |      100 |                |
  VerumWorld.sol             |    92.38 |    81.94 |      100 |    92.59 |... 117,251,252 |
-----------------------------|----------|----------|----------|----------|----------------|
All files                    |    94.52 |    80.23 |      100 |    94.77 |                |
-----------------------------|----------|----------|----------|----------|----------------|