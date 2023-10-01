import { formatEther, Contract, BrowserProvider } from 'ethers';
import { networkProps } from '../utils';
import WERC20 from "../abi/WERC20.json";

class ValidationService {

  constructor() {
    this._provider = new BrowserProvider(window.ethereum);
  }

  async _getTokenContract() {
    const signer = await this._provider.getSigner();
    const network = await this._provider.getNetwork();
    const tokenAddress = networkProps(network.name).tokenAddress;

    return new Contract(tokenAddress, WERC20.abi, signer);
  }

  async _getCurrentChainBalance(address) {
    const tokenContract = await this._getTokenContract();
    const balance = await tokenContract.balanceOf(address);

    return formatEther(balance);
  };

  async logBalanceAfterTransaction(signerAddress = null, bridgeAddress = null) {
    if (signerAddress) {
      const signerBalance = await this._getCurrentChainBalance(signerAddress);
      console.log(`SIGNER balance after transaction: ${Number(signerBalance)}`);
    }

    if (bridgeAddress) {
      const bridgeBalance = await this._getCurrentChainBalance(bridgeAddress);
      console.log(`BRIDGE balance after transaction: ${Number(bridgeBalance)}`);
    }

    console.log("<==================================>");
  }

  async validateLockTransaction(tokenAmount, signerAddress, bridgeAddress) {
    console.log("<==================================>");
    console.log(`LOCK tokens (${Number(tokenAmount)}) on SEPOLIA...`);

    const signerBalance = await this._getCurrentChainBalance(signerAddress);
    if (Number(tokenAmount) > Number(signerBalance)) {
      throw new Error("The given amount exceeds the wallet balance!");
    }
    
    const bridgeBalance = await this._getCurrentChainBalance(bridgeAddress);
    console.log(`BRIDGE balance before transaction: ${Number(bridgeBalance)}`);
  }

  async validateBurnTransaction(tokenAmount, signerAddress) {
    console.log("<==================================>");
    console.log(`BURN tokens (${Number(tokenAmount)}) on GOERLI...`);

    const signerBalance = await this._getCurrentChainBalance(signerAddress);
    console.log(`SIGNER balance before transaction: ${Number(signerBalance)}`);

    if (Number(tokenAmount) > Number(signerBalance)) {
      throw new Error("The given amount exceeds the wallet balance!");
    }
  }

  async validateUnlockTransaction(tokenAmount, signerAddress, bridgeAddress) {
    console.log("<==================================>");
    console.log(`UNLOCK tokens (${Number(tokenAmount)}) on SEPOLIA...`);

    const bridgeBalance = await this._getCurrentChainBalance(bridgeAddress);
    console.log(`BRIDGE balance before transaction: ${Number(bridgeBalance)}`);

    if (Number(tokenAmount) > Number(bridgeBalance)) {
      throw new Error("The given amount exceeds the bridge balance!");
    }
  }

  async validateMintTransaction(tokenAmount, signerAddress) {
    console.log("<==================================>");
    console.log(`MINT tokens (${Number(tokenAmount)}) on GOERLI...`);

    const signerBalance = await this._getCurrentChainBalance(signerAddress);
    console.log(`SIGNER balance before transaction: ${Number(signerBalance)}`);
  }
}

export default ValidationService;
