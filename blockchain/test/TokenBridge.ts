import { TokenBridge } from "../typechain-types/contracts/TokenBridge.sol/TokenBridge";
import { network, ethers } from "hardhat";
import { expect } from "chai";

let tokenBridge: TokenBridge;
let snapshotId: any;
let initialSnapshotId: any;

describe("TokenBridge", () => {
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;

  before(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    tokenBridge = await ethers.deployContract("TokenBridge");
    await tokenBridge.waitForDeployment();

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
