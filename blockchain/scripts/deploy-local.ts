import { ethers, config } from "hardhat";

const PRIVATE_KEYS: any = config.networks.localhost.accounts;

export async function main() {
  console.log(""); // readable console logging

  const provider = new ethers.JsonRpcProvider(config.networks.localhost.url);
  const wallet = new ethers.Wallet(PRIVATE_KEYS[0], provider);
  console.log("Deploying with account:", wallet.address);
  console.log(""); // readable console logging

  const tokenBridgeFactory = await ethers.getContractFactory("TokenBridge");
  const tokenBridge = await tokenBridgeFactory.connect(wallet).deploy();
  await tokenBridge.waitForDeployment();
  const tokenBridgeAddress = tokenBridge.target;
  console.log("TokenBridge was deployed to:", tokenBridgeAddress);
  console.log(""); // readable console logging

  const wrappedTokenFactory = await ethers.getContractFactory("WERC20");
  const wrappedToken = await wrappedTokenFactory.connect(wallet).deploy(
    tokenBridgeAddress, 
    100000000000000000000n, 
    "KrasiToken", 
    "KRT"
  );
  await wrappedToken.waitForDeployment();
  const wrappedTokenAddress = wrappedToken.target;
  console.log("WERC20 was deployed to:", wrappedTokenAddress);
  console.log(""); // readable console logging

  const wrappedTokenOwner = await wrappedToken.owner();

  return {
    bridgeAddress: tokenBridgeAddress,
    tokenAddress: wrappedTokenAddress,
    tokenOwner: wrappedTokenOwner
  };
}
