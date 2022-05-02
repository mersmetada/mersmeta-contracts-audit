const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
} = require("@openzeppelin/test-helpers");
const { deployProxy, upgradeProxy } = require("@openzeppelin/truffle-upgrades");
const { fromWei, toWei } = require("web3-utils");

const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const MustafaCeceli = artifacts.require("MustafaCeceli");
const VerumWorld = artifacts.require("VerumWorld");

contract("MustafaCeceli", (accounts) => {
  const EventNames = {
    Paused: "Paused",
    Unpaused: "Unpaused",
    BaseURIUpdated: "BaseURIUpdated",
    AddedToBlackList: "AddedToBlackList",
    RemovedFromBlackList: "RemovedFromBlackList",
    NewAvatarCreated: "NewAvatarCreated",
    NewBatchCreated: "NewBatchCreated",
    Transfer: "Transfer",
    TransferSingle: "TransferSingle",
    MersmetaAddressSaved: "MersmetaAddressSaved"
  };

  const [owner, user, bob, steve, blackListUser, george, nonWhiteListUser] =
    accounts;

  let whitelistAddress = [owner, user, bob, steve, george];

  const leafNodes = whitelistAddress.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPair: true });
  const merkleHashBob = merkleTree.getHexProof(keccak256(whitelistAddress[2]));
  const name = "MustafaCeceli";
  const symbol = "MCC";
  const constantTokenID = 0;
  const baseURI1 =
    "https://ipfs.io/ipfs/QmT5LTjW2oenEF3tSDQreSGtMfwxTw6SQbf3tSER1BLx2Z/";
  const baseURI2 = "http://google.co.in/";
  const _collectionID = "abc";
  const mintPrice = toWei("1", "ether");
  const newMintPrice = toWei("0.1", "ether");
  const nullBytes = "0x";
  let total = 0;
  let avatarTotal = 0;
  let mustafaCeceliInstance = null;

  async function initContract() {

    VerumWorldInstance = await deployProxy(VerumWorld, [
      name,
      symbol
    ]);
    mustafaCeceliInstance = await deployProxy(MustafaCeceli, [
      name,
      symbol,
      VerumWorldInstance.address,
      mintPrice
    ]);
  }

  before("Deploy new Utility Token Contract", async () => {
    await initContract();
  });

  describe("Initial State", () => {
    describe("when the utility contract is instantiated", function () {
      it("has a name", async function () {
        expect(await mustafaCeceliInstance.name()).to.equal(name);
      });

      it("has a symbol", async function () {
        expect(await mustafaCeceliInstance.symbol()).to.equal(symbol);
      });

      it("should create a new  contract address", async () => {
        expect(mustafaCeceliInstance.address);
      });

      it("should add new artist, airdrop and burnAndMint", async () => {
        await VerumWorldInstance.addNewArtistCollection(bob, mustafaCeceliInstance.address, _collectionID, baseURI1, {
          from: owner,
        });
        const newArtistReceipt = await VerumWorldInstance.artistCollections(
          _collectionID
        );
        expect(newArtistReceipt.collectionID).to.equal(_collectionID);
        expect(
          (await VerumWorldInstance.totalSupply(constantTokenID)).toNumber()
        ).to.equal(total);

        await VerumWorldInstance.airDrop(
          _collectionID,
          [bob, george],
          [1, 1],
          {
            from: bob,
          }
        );
        total = total + 2;
        expect((await VerumWorldInstance.totalSupply(constantTokenID)).toNumber()).to.equal(
          total
        );
        let tokenReceipt = await VerumWorldInstance.burnAndMint(
          _collectionID,
          baseURI2,
          nullBytes,
          {
            from: bob,
            value: mintPrice,
          }
        );
        avatarTotal++;
        total--;
        expect((await mustafaCeceliInstance.totalSupply(constantTokenID)).toNumber()).to.equal(avatarTotal);
        expect((await VerumWorldInstance.balanceOf(bob, constantTokenID)).toNumber()).to.equal(0);
        expect((await mustafaCeceliInstance.balanceOf(bob, constantTokenID)).toNumber()).to.equal(1);
      });
    });
  });

  describe("uri", async () => {
    it("should get uri", async () => {
      expect(await mustafaCeceliInstance.uri(constantTokenID)).to.equal(baseURI2);
    });
  });

  describe("withdrawToAddress", () => {
    describe("When other user tries to withdraw to address", () => {
      it("should not withdraw balance to address", async () => {
        await expectRevert(
          mustafaCeceliInstance.withdrawToAddress(user, { from: george }),
          "Ownable: caller is not the owner"
        );
        expect(await mustafaCeceliInstance.paused()).to.equal(false);
      });
    });

    describe("When owner tries to withdraw to address", () => {
      it("should withdraw balance to address", async () => {
        let contractAddress = await mustafaCeceliInstance.address;
        let initialContractBalance = fromWei(
          await web3.eth.getBalance(contractAddress),
          "ether"
        );
        expect(await mustafaCeceliInstance.paused()).to.equal(false);
        const withdrawRecept = await mustafaCeceliInstance.withdrawToAddress(
          steve,
          {
            from: owner,
          }
        );

        let balanceAfterWithdraw = fromWei(
          await web3.eth.getBalance(contractAddress),
          "ether"
        );

        if (initialContractBalance > 0) {
          expect(balanceAfterWithdraw).to.equal("0");
        }
      });

      it("should not withdraw balance if contract has 0 balance", async () => {
        await expectRevert(
          mustafaCeceliInstance.withdrawToAddress(user, { from: owner }),
          "MustafaCeceli: Contract balance should be greater than zero."
        );
      });
    });
  });

  describe("getContractBalance", async () => {
    it("should get the current balance of contract", async () => {
      let contractBalance = fromWei(
        await web3.eth.getBalance(mustafaCeceliInstance.address),
        "ether"
      );

      expect(fromWei(await mustafaCeceliInstance.getContractBalance(), "ether")).to.equal(contractBalance);
    });
  });

  describe("getMintPrice", async () => {
    it("should get mint price of this contract token", async () => {
      expect(fromWei(await mustafaCeceliInstance.getMintPrice()), "ether").to.equal(fromWei(new BN(mintPrice), "ether"));
    });
  });

  describe("setMintPrice", async () => {
    describe("When other user tries to set mint price", async () => {
      it("should not set mint price", async () => {
        await expectRevert(
          mustafaCeceliInstance.setMintPrice(mintPrice, { from: george }),
          "Ownable: caller is not the owner"
        );
        expect(await mustafaCeceliInstance.paused()).to.equal(false);
      });
    });

    describe("When owner tries to set mint price", async () => {
      it("should not set mint price same as old mint price", async () => {
        await expectRevert(
          mustafaCeceliInstance.setMintPrice(mintPrice, { from: owner }),
          "MustafaCeceli: New mint price cannot be same as old mint price."
        );
        expect(await mustafaCeceliInstance.paused()).to.equal(false);
      });

      it("should set mint price", async () => {
        await mustafaCeceliInstance.setMintPrice(newMintPrice, { from: owner });
        expect(fromWei(await mustafaCeceliInstance.getMintPrice()), "ether").to.equal(fromWei(new BN(newMintPrice), "ether"));
        expect(await mustafaCeceliInstance.paused()).to.equal(false);
      });

    });
  });

  describe("pause", () => {
    describe("when other user tries to pause contract", function () {
      it("should not pause contract", async () => {
        expect(await mustafaCeceliInstance.paused()).to.equal(false);
        await expectRevert(
          mustafaCeceliInstance.pause({
            from: user,
          }),
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("when owner tries to pause contract", function () {
      it("should pause contract", async () => {
        expect(await mustafaCeceliInstance.paused()).to.equal(false);
        const pauseReceipt = await mustafaCeceliInstance.pause({
          from: owner,
        });
        await expectEvent(pauseReceipt, EventNames.Paused, {
          account: owner,
        });
        expect(await mustafaCeceliInstance.paused()).to.equal(true);
      });
    });

    describe("When contract is pause", async () => {
      it("should not withdraw balance", async function () {
        expect(await mustafaCeceliInstance.paused()).to.equal(true);
        await expectRevert(
          mustafaCeceliInstance.withdrawToAddress(steve, {
            from: owner,
          }),
          "Pausable: paused"
        );
      });
      it("should not set mint price", async function () {
        expect(await mustafaCeceliInstance.paused()).to.equal(true);
        await expectRevert(
          mustafaCeceliInstance.setMintPrice(newMintPrice, {
            from: owner,
          }),
          "Pausable: paused"
        );
      });
    });
  });

  describe("unpause", () => {
    describe("when other user tries to unpause contract", function () {
      it("should not unpause contract", async () => {
        expect(await mustafaCeceliInstance.paused()).to.equal(true);
        await expectRevert(
          mustafaCeceliInstance.unpause({
            from: user,
          }),
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("when owner tries to unpause contract", function () {
      it("should unpause contract", async () => {
        expect(await mustafaCeceliInstance.paused()).to.equal(true);
        const unpauseReceipt = await mustafaCeceliInstance.unpause({
          from: owner,
        });
        await expectEvent(unpauseReceipt, EventNames.Unpaused, {
          account: owner,
        });
        expect(await mustafaCeceliInstance.paused()).to.equal(false);
      });
    });
  });

  after(() => {
    mustafaCeceliInstance = null;
  });
});
