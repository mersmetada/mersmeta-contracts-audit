const { deployProxy } = require("@openzeppelin/truffle-upgrades");
const { fromWei, toWei } = require("web3-utils");

const MustafaCeceli = artifacts.require("MustafaCeceli");
const NAME = process.env.NAME;
const SYMBOL = process.env.SYMBOL;
const VERUMWORLDADDRESS = process.env.VerumWorldAddress;

//let initialMintPrice = [fromWei(BN(0.002), "ether"), fromWei(BN(0.02), "ether")];
let initialMintPrice = 100000000000000;

module.exports = async function (deployer) {
  const instance = await deployProxy(
    MustafaCeceli,
    [NAME, SYMBOL, VERUMWORLDADDRESS, initialMintPrice],
    {
      deployer,
    }
  );
};
