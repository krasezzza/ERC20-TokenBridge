import { TokenBridge } from "../typechain-types/contracts/TokenBridge.sol/TokenBridge";
import { WERC20 } from "../typechain-types/contracts/WERC20";
import { AddressLike, BigNumberish, BytesLike, Signature } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { network, ethers } from "hardhat";
import { expect } from "chai";

let bridgeAddress: AddressLike;
let bridgeContract: TokenBridge;
let tokenAddress: AddressLike;
let tokenContract: WERC20;
let snapshotId: any;
let initialSnapshotId: any;

const transferDeadline: BigNumberish = BigInt(Date.now() + 3600);
const initialSupply: BigNumberish = BigInt(100000000000000000000n);
const testedOverSupply: BigNumberish = BigInt(200000000000000000000n);
const testedUnderSupply: BigNumberish = BigInt(50000000000000000000n);
const tokenName: string = "KrasiToken";
const tokenSymbol: string = "KRT";

let r: BytesLike;
let s: BytesLike;
let v: BigNumberish;

describe("TokenBridge with WERC20", () => {
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;

  before(async () => {
    console.log(""); // readable console logging

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const bridgeContractFactory = await ethers.getContractFactory("TokenBridge");
    bridgeContract = await bridgeContractFactory.connect(owner).deploy();
    await bridgeContract.waitForDeployment();
    bridgeAddress = bridgeContract.target;
    console.log("   Bridge was deployed to:", bridgeAddress);

    const tokenContractFactory = await ethers.getContractFactory("WERC20");
    tokenContract = await tokenContractFactory.connect(owner).deploy(
      bridgeAddress, 
      initialSupply, 
      tokenName, 
      tokenSymbol
    );
    await tokenContract.waitForDeployment();
    tokenAddress = tokenContract.target;
    console.log("   Token was deployed to:", tokenAddress);

    initialSnapshotId = await network.provider.send('evm_snapshot');

    console.log(""); // readable console logging
  });

  beforeEach(async () => {
    snapshotId = await network.provider.send('evm_snapshot');
  });

  afterEach(async () => {
    await network.provider.send("evm_revert", [snapshotId]);
  });

  after(async () => {
    await network.provider.send('evm_revert', [initialSnapshotId]);
  });

  describe("Validations", () => {
    it("Should throw when try to mint tokens from different owner", () => {
      expect(tokenContract.mintToken(addr1, 1)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should throw when try to lock more tokens than the total supply", async () => {
      const signedData = await signPermit(owner.address, testedOverSupply);
      r = signedData.r;
      s = signedData.s;
      v = signedData.v;

      expect(bridgeContract.lockAmount(
        tokenAddress,
        testedOverSupply,
        transferDeadline,
        r, s, v
      )).to.be.revertedWith(
        "TokenBridge: insufficient amount"
      );
    });

    it("Should throw when try to lock tokens and send incorrent signature parameters", async () => {
      const signedData = await signPermit(owner.address, testedUnderSupply);
      r = signedData.r;
      s = signedData.s;
      v = signedData.v + 1;

      expect(bridgeContract.lockAmount(
        tokenAddress,
        testedUnderSupply,
        transferDeadline,
        r, s, v
      )).to.be.revertedWith(
        "ERC20Permit: invalid signature"
      );
    });

    it("Should throw when try to burn more tokens than the account funds", async () => {
      const signedData = await signPermit(owner.address, testedOverSupply);
      r = signedData.r;
      s = signedData.s;
      v = signedData.v;

      expect(bridgeContract.burnAmount(
        tokenAddress,
        testedOverSupply,
        transferDeadline,
        r, s, v
      )).to.be.revertedWith(
        "TokenBridge: insufficient amount"
      );
    });

    it("Should throw when try to burn tokens and send incorrent signature parameters", async () => {
      const signedData = await signPermit(owner.address, testedUnderSupply);
      r = signedData.r;
      s = signedData.s;
      v = signedData.v + 1;

      expect(bridgeContract.burnAmount(
        tokenAddress,
        testedUnderSupply,
        transferDeadline,
        r, s, v
      )).to.be.revertedWith(
        "ERC20Permit: invalid signature"
      );
    });
  });

  describe("Events", () => {
    it("Should emit event for locking tokens successfully", async () => {
      const signedData = await signPermit(owner.address, testedUnderSupply);
      r = signedData.r;
      s = signedData.s;
      v = signedData.v;

      const lockAmountTx = await bridgeContract.lockAmount(
        tokenAddress,
        testedUnderSupply,
        transferDeadline,
        r, s, v
      );

      const currentTimestamp = await time.latest();

      expect(await lockAmountTx.wait()).to.emit(
        bridgeContract, "TransferEvent"
      ).withArgs(
        owner.address,
        owner.address,
        testedUnderSupply,
        currentTimestamp,
        "Lock"
      );
    });

    it("Should emit event for burning tokens successfully", async () => {
      const signedData = await signPermit(owner.address, testedUnderSupply);
      r = signedData.r;
      s = signedData.s;
      v = signedData.v;

      const burnAmountTx = await bridgeContract.burnAmount(
        tokenAddress,
        testedUnderSupply,
        transferDeadline,
        r, s, v
      );

      const currentTimestamp = await time.latest();

      expect(await burnAmountTx.wait()).to.emit(
        bridgeContract, "TransferEvent"
      ).withArgs(
        owner.address,
        owner.address,
        testedUnderSupply,
        currentTimestamp,
        "Burn"
      );
    });

    it("Should emit event for unlocking tokens successfully", async () => {
      const signedData = await signPermit(owner.address, testedUnderSupply);
      r = signedData.r;
      s = signedData.s;
      v = signedData.v;

      const lockAmountTx = await bridgeContract.lockAmount(
        tokenAddress,
        testedUnderSupply,
        transferDeadline,
        r, s, v
      );
      await lockAmountTx.wait();

      const unlockAmountTx = await bridgeContract.unlockAmount(
        tokenAddress,
        testedUnderSupply
      );

      const currentTimestamp = await time.latest();

      expect(await unlockAmountTx.wait()).to.emit(
        bridgeContract, "TransferEvent"
      ).withArgs(
        owner.address,
        owner.address,
        testedUnderSupply,
        currentTimestamp,
        "Unlock"
      );
    });

    it("Should emit event for minting tokens successfully", async () => {
      const mintAmountTx = await bridgeContract.mintAmount(
        tokenAddress,
        testedUnderSupply
      );

      const currentTimestamp = await time.latest();

      expect(await mintAmountTx.wait()).to.emit(
        bridgeContract, "TransferEvent"
      ).withArgs(
        owner.address,
        owner.address,
        testedUnderSupply,
        currentTimestamp,
        "Mint"
      );
    });
  });
});

const signPermit = async (owner: AddressLike, value: BigNumberish) => {
  const spender = bridgeAddress;
  const contract = tokenContract;
  const provider = ethers.provider;
  const deadline = transferDeadline;

  try {
    const nonce = await contract.nonces(owner);
    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];
    const tokenName = await contract.name();
    const network = await provider.getNetwork();
    const domain = {
      name: tokenName,
      version: "1",
      chainId: network.chainId.toString(),
      verifyingContract: contract.target
    };
    const Permit = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ];
    const message = {
      owner,
      spender,
      value: value.toString(),
      nonce: nonce.toString(),
      deadline
    };
    const data = JSON.stringify({
      types: { EIP712Domain, Permit },
      domain,
      primaryType: "Permit",
      message
    }, (_, v) => typeof v === 'bigint' ? v.toString() : v);

    const signature = await provider.send("eth_signTypedData_v4", [owner, data]);
    const signedData = Signature.from(signature);

    return {
      r: signedData.r,
      s: signedData.s,
      v: signedData.v
    };
  } catch (err: any) {

    throw new Error(`${err.message}`);
  }
};
