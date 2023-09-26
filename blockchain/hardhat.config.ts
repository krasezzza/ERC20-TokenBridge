import { HardhatUserConfig, task, subtask } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config';

const lazyImport = async (module: any) => {
  return await import(module);
};

task("deploy-local", "Deploys both contracts on a localhost network")
  .setAction(async ({ }, hre) => {

    const { main } = await lazyImport("./scripts/deploy-local");

    await main().then((args: any) => {
      hre.run("print", {
        type: 'success',
        text: `Bridge Address: ${args.bridgeAddress}\nToken Address: ${args.tokenAddress}\nToken Owner: ${args.tokenOwner}`
      });

      process.exitCode = 0;
    }).catch((error: any) => {
      hre.run("print", {
        type: 'error',
        text: error.message
      });

      process.exitCode = 1;
    });
  });

task("deploy-bridge", "Deploys TokenBridge contract on the given network")
  .setAction(async ({ }, hre) => {

    const { main } = await lazyImport("./scripts/deploy-bridge");

    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

    await main(privateKey).then((args: any) => {
      hre.run("print", {
        type: 'success',
        text: `Bridge Address: ${args.bridgeAddress}`
      });

      process.exitCode = 0;
    }).catch((error: any) => {
      hre.run("print", {
        type: 'error',
        text: error.message
      });

      process.exitCode = 1;
    });
  });

task("deploy-token", "Deploys WERC20 contract on the given network")
  .addParam("bridgeAddress", "Bridge address to be set as an owner")
  .addParam("initialAmount", "Initial amount of the token to be minted")
  .addParam("tokenName", "Token name to be set")
  .addParam("tokenSymbol", "Token symbol to be set")
  .setAction(async (taskArgs, hre) => {

    const { main } = await lazyImport("./scripts/deploy-token");

    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const bridgeAddress = taskArgs.bridgeAddress;
    const initialAmount = taskArgs.initialAmount;
    const tokenName = taskArgs.tokenName;
    const tokenSymbol = taskArgs.tokenSymbol;

    await main(
      privateKey,
      bridgeAddress,
      initialAmount,
      tokenName,
      tokenSymbol
    ).then((args: any) => {
      hre.run("print", {
        type: 'success',
        text: `Token Address: ${args.tokenAddress}\nToken Owner: ${args.tokenOwner}`
      });

      process.exitCode = 0;
    }).catch((error: any) => {
      hre.run("print", {
        type: 'error',
        text: error.message
      });

      process.exitCode = 1;
    });
  });

subtask("print", "Prints a message")
  .addParam("type", "Type of the message")
  .addParam("text", "The given message text")
  .setAction(async (taskArgs) => {

    if (taskArgs.type === 'error') {
      console.error(taskArgs.text);
      console.log(""); // readable console logging
    } else {
      console.log(taskArgs.text);
      console.log(""); // readable console logging
    }
  });

const hardhatConfig: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: `http://localhost:8545`,
      accounts: [
        `${process.env.LOCALNODE_PRIVATE_KEY}`,
      ],
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [
        `${process.env.DEPLOYER_PRIVATE_KEY}`,
      ],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [
        `${process.env.DEPLOYER_PRIVATE_KEY}`,
      ],
    },
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
  },
};

export default hardhatConfig;
