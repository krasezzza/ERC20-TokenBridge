import { setTimeout } from "timers/promises";
import { ethers, run } from "hardhat";

export async function main(_privateKey: string) {
  console.log(""); // readable console logging

  const wallet = new ethers.Wallet(_privateKey, ethers.provider);
  console.log("Deploying with account:", wallet.address);
  console.log(""); // readable console logging

  const tokenBridgeFactory = await ethers.getContractFactory("TokenBridge");
  const tokenBridge = await tokenBridgeFactory.connect(wallet).deploy();
  await tokenBridge.waitForDeployment();
  const tokenBridgeAddress = tokenBridge.target;
  console.log("TokenBridge was deployed to:", tokenBridgeAddress);
  console.log(""); // readable console logging

  // Wait for 10 blocks
  let currentBlock = await ethers.provider.getBlockNumber();
  while (currentBlock + 10 > (await ethers.provider.getBlockNumber())) {
    await setTimeout(30000);
    console.log("Waiting for the 10th block confirmation...");
  }
  console.log(""); // readable console logging

  try {
    await run("verify:verify", {
      address: tokenBridgeAddress,
      constructorArguments: []
    });
  } catch (err: any) {
    console.log(err.message);
    console.log(""); // readable console logging
  }

  return {
    bridgeAddress: tokenBridgeAddress
  };
}
