import { BridgeFactory } from "./../typechain-types/contracts/BridgeFactory";
import { network, ethers } from "hardhat";
import { expect } from "chai";

let bridgeFactory: BridgeFactory;
let snapshotId: any;
let initialSnapshotId: any;

describe("BridgeFactory", () => {
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;

  before(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    bridgeFactory = await ethers.deployContract("BridgeFactory");
    await bridgeFactory.waitForDeployment();

    initialSnapshotId = await network.provider.send('evm_snapshot');
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
    // ...
  });

  describe("Events", () => {
    // ...
  });

  describe("Transactions", () => {
    // ...
  });
});
