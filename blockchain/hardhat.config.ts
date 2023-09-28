import { HardhatUserConfig, task, subtask, types } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config';

const lazyImport = async (module: any) => {
  return await import(module);
};

task("deploy-local", "Deploys both contracts on a localhost network")
  .setAction(async ({ }, hre) => {
    console.log(`Start deploy process on Hardhat chain...`);

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

task("deploy-sepolia", "Deploys both contracts on the Sepolia network")
  .setAction(async ({}, hre) => {
    console.log(`Start deploy process on Sepolia chain...`);

    const { main } = await lazyImport("./scripts/deploy-sepolia");

    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

    await main(privateKey).then((args: any) => {
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

task("deploy-goerli", "Deploys both contracts on the Goerli network")
  .setAction(async ({}, hre) => {
    console.log(`Start deploy process on Goerli chain...`);

    const { main } = await lazyImport("./scripts/deploy-goerli");

    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

    await main(privateKey).then((args: any) => {
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
