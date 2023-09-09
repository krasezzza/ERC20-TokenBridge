import { WERC20 } from "./../typechain-types/contracts/WERC20";
import { network, ethers } from "hardhat";
import { expect } from "chai";

let wERC20: WERC20;
let snapshotId: any;
let initialSnapshotId: any;

describe("WERC20", () => {
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;

  before(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    wERC20 = await ethers.deployContract("WERC20");
    await wERC20.waitForDeployment();

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
