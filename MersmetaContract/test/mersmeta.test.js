const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
} = require("@openzeppelin/test-helpers");
const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const { fromWei, toWei } = require("web3-utils");

const MersMeta = artifacts.require("MersMeta");

contract("MersMeta", (accounts) => {
  let mersmetaPassInstance = null;
  const [owner, user, bob, steve, george] = accounts;

  airDropUser = Array(user, bob);
  airDropVal = Array(1, 2);

  airDropValIncorrect = Array(1);

  const eventname = {
    Transfer: "TransferSingle",
    newTokenCreated: "NewTokenCreated",
    Paused: "Paused",
    Unpaused: "Unpaused",
    setTokenValue: "SetTokenValue",
    setUri: "SetUri",
    PaymentReceived: "PaymentReceived",
    PaymentReleased: "PaymentReleased",
  };

  const id = 0;
  const mintTokenVal = 1;
  const name = process.env.NAME;
  const symbol = process.env.SYMBOL;
  const decimalAmount = 1;
  const fullPercentage = 100 * decimalAmount;
  const baseUri = "https://www.google.com/";
  const amount = web3.utils.toWei("10.37", "ether");
  let mintPrice = toWei("0.1", "ether");

  let userShare = new BN(10 * decimalAmount);
  let bobShare = new BN(30 * decimalAmount);
  let steveShare = new BN(60 * decimalAmount);

  let payee = [user, bob, steve];
  let share = [userShare, bobShare, steveShare];

  before("Deploy new Entry Pass contract", async () => {
    await deployProxy(MersMeta, [name, symbol, payee, share], { from: owner }).then(
      (instance) => (mersmetaPassInstance = instance)
    );
  });

  describe("Initial State", async () => {
    describe("when the entrypass contract is instantiated", function () {
      it("should create a new  contract address", async () => {
        expect(mersmetaPassInstance.address);
      });

      it("has a name", async function () {
        expect(await mersmetaPassInstance.name()).to.equal(name);
      });

      it("has a symbol", async function () {
        expect(await mersmetaPassInstance.symbol()).to.equal(symbol);
      });

      it("should check the owner address", async () => {
        expect(await mersmetaPassInstance.owner()).to.equal(owner);
      });

      it("should send some ether to contract address", async () => {
        const paymentReceipt = await mersmetaPassInstance.sendTransaction({
          from: bob,
          value: amount,
        });

        await expectEvent(paymentReceipt, eventname.PaymentReceived, {
          from: bob,
          amount: amount,
        });
      });

      it("should not mint token before price set", async function () {
        await expectRevert(
          mersmetaPassInstance.mintToken(id, mintTokenVal, {
            from: user,
            value: mintPrice.toString(),
          }),
          "MersMeta: Cannot mint token as token ID is not active yet!"
        );
      });

      it("should not airdrop token before price set", async function () {
        await expectRevert(
          mersmetaPassInstance.airDrop(
            airDropUser,
            airDropValIncorrect,
            id,
            {
              from: owner
            }
          ),
          "MersMeta: Cannot airdrop token as token ID is not active yet!"
        );
      });
    });
  });

  describe("setTokenIDPrice", async () => {
    describe("when other user tries to set Token Price", async () => {
      it("should not set the token price", async function () {
        expect(await mersmetaPassInstance.paused()).to.equal(false);
        await expectRevert(
          mersmetaPassInstance.setTokenIDPrice(id, mintPrice, { from: user }),
          "Ownable: caller is not the owner"
        );
      });
    });
    describe("when owner tries to set Token Price", async () => {
      it("should set the token price", async function () {
        const setPriceRecept = await mersmetaPassInstance.setTokenIDPrice(
          id,
          mintPrice,
          {
            from: owner,
          }
        );
        await expectEvent(setPriceRecept, eventname.setTokenValue, {
          mintValue: mintPrice,
        });
      });
    });
  });

  describe("setURI", async () => {
    describe("when other user tries to set the uri", async () => {
      it("should not set the uri value", async function () {
        expect(await mersmetaPassInstance.paused()).to.equal(false);
        await expectRevert(
          mersmetaPassInstance.setURI(baseUri, { from: user }),
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("when owner tries to set the uri", async () => {
      it("should set the uri value", async function () {
        const setUriRecept = await mersmetaPassInstance.setURI(baseUri, {
          from: owner,
        });
        await expectEvent(setUriRecept, eventname.setUri, {
          seturi: baseUri,
        });
      });
    });
  });

  describe("mintToken", async () => {
    describe("when user tries to mint a token with incorrect mint price", async () => {
      it("should not mint token token", async function () {
        await expectRevert(
          mersmetaPassInstance.mintToken(id, mintTokenVal, {
            from: user,
            value: 0,
          }),
          "MersMeta: Insufficient ETH supplied."
        );
      });
    });

    describe("when user tries to mint a token when mint price is not set", async () => {
      it("should not mint token token", async function () {
        await expectRevert(
          mersmetaPassInstance.mintToken(mintTokenVal, mintTokenVal, {
            from: user,
            value: 0,
          }),
          "MersMeta: Cannot mint token as token ID is not active yet!"
        );
      });
    });

    describe("when user tries to mint a Token with correct mint price", async () => {
      it("should mint token", async function () {
        const mintTokenReceipt = await mersmetaPassInstance.mintToken(
          id,
          mintTokenVal,
          {
            from: user,
            value: mintPrice.toString(),
          }
        );
        await expectEvent(mintTokenReceipt, eventname.Transfer, {
          operator: user,
          from: constants.ZERO_ADDRESS,
          to: user,
          id: id.toString(),
          value: mintTokenVal.toString(),
        });

        await expectEvent(mintTokenReceipt, eventname.newTokenCreated, {
          id: id.toString(),
        });
      });
    });
  });

  describe("airDrop", async () => {
    describe("when other user tries to airdrop", async () => {
      it("should not airdrop token", async function () {
        await expectRevert(
          mersmetaPassInstance.airDrop(airDropUser, airDropVal, id, {
            from: user,
          }),
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("when owner tries to airdrop", async () => {
      it("should not airdrop token for incorrect parameter", async function () {
        await expectRevert(
          mersmetaPassInstance.airDrop(
            airDropUser,
            airDropValIncorrect,
            id,
            {
              from: owner,
            }
          ),
          "MersMeta: Incorrect parameter length."
        );
      });
      it("should airdrop token", async function () {
        const airdropReceipt = await mersmetaPassInstance.airDrop(
          airDropUser,
          airDropVal,
          id,
          {
            from: owner,
          }
        );
        await expectEvent(airdropReceipt, eventname.Transfer, {
          operator: owner,
          from: constants.ZERO_ADDRESS,
          to: user,
          id: id.toString(),
          value: mintTokenVal.toString(),
        });
      });
    });
  });

  describe("baseURI", async () => {
    describe("when user tries to get uri", async () => {
      it("should get the uri", async function () {
        expect(await mersmetaPassInstance.uri(id, { from: user })).to.equal(
          baseUri+id
        );
      });
    });
  });
  
  describe("withdraw", async () => {
    describe("when user tries to withdraw payment", async () => {
      it("should withdraw payment", async function () {
        const balancesteve = await web3.eth.getBalance(steve);
        await mersmetaPassInstance.withdraw(steve, {
          from: bob,
        });

        const expectedBalSteve = new BN(balancesteve).add(
          new BN(amount).div(new BN(fullPercentage)).mul(new BN(steveShare))
        );

        const afterSplitSteveBal = await web3.eth.getBalance(steve);

        assert.isAtMost(
          parseInt(fromWei(afterSplitSteveBal)),
          parseInt(fromWei(expectedBalSteve)),
          "Balance error in steve account"
        );
      });

      it("should not withdraw payment for zero address", async function () {
        await expectRevert(
          mersmetaPassInstance.withdraw(constants.ZERO_ADDRESS, {
            from: user,
          }),
          "MersMeta: Cannot be transferred to zero address."
        );
      });

      it("should not withdraw if no payment is due", async function () {
        await expectRevert(
          mersmetaPassInstance.withdraw(steve, {
            from: user,
          }),
          "PaymentSplitter: account is not due payment"
        );
      });

      it("should not withdraw if acccount has no share", async function () {
        await expectRevert(
          mersmetaPassInstance.withdraw(george, {
            from: user,
          }),
          "PaymentSplitter: account has no shares"
        );
      });
    });
  });

  describe("balanceOfContract", async () => {
    describe("when user tries to get contract balance", async () => {
      it("should get the balance", async function () {
        expect(fromWei(await mersmetaPassInstance.balanceOfContract({ from: user }))).to.equal(
         fromWei(await web3.eth.getBalance(mersmetaPassInstance.address) )
        );
      });
    });
  });

  describe("pause", async () => {
    describe("when other user tries to  pause a contract", async () => {
      it("should not pause the contract", async function () {
        await expectRevert(
          mersmetaPassInstance.pause({
            from: user,
          }),
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("when owner tries to pause a contract", async () => {
      it("should pause the contract", async function () {
        const pauseContract = await mersmetaPassInstance.pause({
          from: owner,
        });
        await expectEvent(pauseContract, eventname.Paused, {
          account: owner,
        });
      });
    });

    describe("when contract is pause", async () => {
      it("should not set Token price", async function () {
        expect(await mersmetaPassInstance.paused()).to.equal(true);
        await expectRevert(
          mersmetaPassInstance.setTokenIDPrice(id, mintPrice, { from: owner }),
          "Pausable: paused"
        );
      });

      it("should not set token uri", async function () {
        expect(await mersmetaPassInstance.paused()).to.equal(true);
        await expectRevert(
          mersmetaPassInstance.setURI(baseUri, { from: owner }),
          "Pausable: paused"
        );
      });

      it("should not mint token", async function () {
        expect(await mersmetaPassInstance.paused()).to.equal(true);
        await expectRevert(
          mersmetaPassInstance.mintToken(id, mintTokenVal, {
            from: user,
            value: 0,
          }),
          "Pausable: paused"
        );
      });

      it("should not airdrop token", async function () {
        expect(await mersmetaPassInstance.paused()).to.equal(true);
        await expectRevert(
          mersmetaPassInstance.airDrop(airDropUser, airDropVal, id, {
            from: owner,
          }),
          "Pausable: paused"
        );
      });

      it("should not withdraw balance", async function () {
        expect(await mersmetaPassInstance.paused()).to.equal(true);
        await expectRevert(
          mersmetaPassInstance.withdraw(steve, {
            from: user,
          }),
          "Pausable: paused"
        );
      });
    });
  });

  describe("unpause", async () => {
    describe("when other user tries to  unpause a contract", async () => {
      it("should not unpause the contract", async function () {
        await expectRevert(
          mersmetaPassInstance.unpause({
            from: user,
          }),
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("When owner tries to  unpause a contract", async () => {
      it("should unpause the contract", async function () {
        const unpauseContract = await mersmetaPassInstance.unpause({
          from: owner,
        });
        await expectEvent(unpauseContract, eventname.Unpaused, {
          account: owner,
        });
      });
    });
  });
});
