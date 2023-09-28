import { setTimeout } from "timers/promises";
import { ethers, run } from "hardhat";

export async function main(_privateKey: string) {
  console.log(""); // readable console logging

  const wallet = new ethers.Wallet(_privateKey, ethers.provider);
  console.log("Deploying with account:", wallet.address);
  console.log(""); // readable console logging

  const bridgeContractFactory = await ethers.getContractFactory("TokenBridge");
  const bridgeContract = await bridgeContractFactory.connect(wallet).deploy();
  await bridgeContract.waitForDeployment();
  const bridgeContractAddress = bridgeContract.target;
  console.log("Bridge contract was deployed to:", bridgeContractAddress);
  console.log(""); // readable console logging

  const tokenContractFactory = await ethers.getContractFactory("WERC20");
  const tokenContract = await tokenContractFactory.connect(wallet).deploy(
    bridgeContractAddress, 
    100000000000000000000n, 
    "KrasiToken", 
    "KRT"
  );
  await tokenContract.waitForDeployment();
  const tokenContractAddress = tokenContract.target;
  console.log("Token contract was deployed to:", tokenContractAddress);
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
      address: bridgeContractAddress,
      constructorArguments: []
    });
  } catch (err: any) {
    console.log(err.message);
  }
  console.log(""); // readable console logging

  try {
    await run("verify:verify", {
      address: tokenContractAddress,
      constructorArguments: [
        bridgeContractAddress, 
        100000000000000000000n, 
        "KrasiToken", 
        "KRT"
      ]
    });
  } catch (err: any) {
    console.log(err.message);
  }
  console.log(""); // readable console logging

  const tokenContractOwner = await tokenContract.owner();

  return {
    bridgeAddress: bridgeContractAddress,
    tokenAddress: tokenContractAddress,
    tokenOwner: tokenContractOwner
  };
}
