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

  // Wait for n blocks
  const targetBlocks = 12;
  let currentBlock = await ethers.provider.getBlockNumber();
  while (currentBlock + targetBlocks > (await ethers.provider.getBlockNumber())) {
    await setTimeout(30000);
    console.log(`Waiting for ${targetBlocks} block confirmations...`);
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
