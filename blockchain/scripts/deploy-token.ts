import { setTimeout } from "timers/promises";
import { ethers, run } from "hardhat";

export async function main(
  _privateKey: string, 
  _bridgeAddress: string,
  _initialAmount: number,
  _tokenName: string,
  _tokenSymbol: string
) {
  console.log(""); // readable console logging

  const wallet = new ethers.Wallet(_privateKey, ethers.provider);
  console.log("Deploying with account:", wallet.address);
  console.log(""); // readable console logging

  const wrappedTokenFactory = await ethers.getContractFactory("WERC20");
  const wrappedToken = await wrappedTokenFactory.connect(wallet).deploy(
    _bridgeAddress, 
    _initialAmount, 
    _tokenName, 
    _tokenSymbol
  );
  await wrappedToken.waitForDeployment();
  const wrappedTokenAddress = wrappedToken.target;
  console.log("WERC20 was deployed to:", wrappedTokenAddress);
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
      address: wrappedTokenAddress,
      constructorArguments: [_bridgeAddress, _initialAmount, _tokenName, _tokenSymbol]
    });
  } catch (err: any) {
    console.log(err.message);
    console.log(""); // readable console logging
  }

  const wrappedTokenOwner = await wrappedToken.owner();

  return {
    tokenAddress: wrappedTokenAddress,
    tokenOwner: wrappedTokenOwner
  };
}
