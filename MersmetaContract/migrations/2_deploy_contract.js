const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const MersMeta = artifacts.require("MersMeta");
const payees = process.env.PAYEES.split(", ");
var sharesNumber = process.env.SHARES.split(", ");
const shares = sharesNumber.map(str => {
  return Number(str);
});
const NAME = process.env.NAME;
const SYMBOL = process.env.SYMBOL;

module.exports = async function (deployer) {
  const instance = await deployProxy(
    MersMeta,
    [NAME, SYMBOL, payees, shares],
    {
      deployer,
    }
  );
};
