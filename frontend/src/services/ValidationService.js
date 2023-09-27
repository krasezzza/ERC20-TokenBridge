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

  async logBalanceAfterTransaction(tokenSymbol, signerAddress, bridgeAddress = null) {
    const signerBalance = await this._getCurrentChainBalance(signerAddress);
    console.log(`SIGNER balance after transaction: ${signerBalance} ${tokenSymbol}`);

    if (bridgeAddress) {
      const bridgeBalance = await this._getCurrentChainBalance(bridgeAddress);
      console.log(`BRIDGE balance after transaction: ${bridgeBalance} ${tokenSymbol}`);
    }
  }

  async validateLockTransaction(tokenAmount, tokenSymbol, signerAddress, bridgeAddress) {
    console.log(`LockAmount (${tokenAmount} ${tokenSymbol}) on SEPOLIA...`);

    const signerBalance = await this._getCurrentChainBalance(signerAddress);
    console.log(`SIGNER balance before transaction: ${signerBalance} ${tokenSymbol}`);

    if (tokenAmount > signerBalance) {
      throw new Error("The given amount exceeds the wallet balance!");
    }
    
    const bridgeBalance = await this._getCurrentChainBalance(bridgeAddress);
    console.log(`BRIDGE balance before transaction: ${bridgeBalance} ${tokenSymbol}`);
  }

  async validateBurnTransaction(tokenAmount, tokenSymbol, signerAddress) {
    console.log(`BurnAmount (${tokenAmount} ${tokenSymbol}) on GOERLI...`);

    const signerBalance = await this._getCurrentChainBalance(signerAddress);
    console.log(`SIGNER balance before transaction: ${signerBalance} ${tokenSymbol}`);

    if (tokenAmount > signerBalance) {
      throw new Error("The given amount exceeds the wallet balance!");
    }
  }

  async validateUnlockTransaction(tokenAmount, tokenSymbol, signerAddress, bridgeAddress) {
    console.log(`UnlockAmount (${tokenAmount} ${tokenSymbol}) on SEPOLIA...`);

    const signerBalance = await this._getCurrentChainBalance(signerAddress);
    console.log(`SIGNER balance before transaction: ${signerBalance} ${tokenSymbol}`);

    const bridgeBalance = await this._getCurrentChainBalance(bridgeAddress);
    console.log(`BRIDGE balance before transaction: ${bridgeBalance} ${tokenSymbol}`);

    if (tokenAmount > bridgeBalance) {
      throw new Error("The given amount exceeds the bridge balance!");
    }
  }

  async validateMintTransaction(tokenAmount, tokenSymbol, signerAddress) {
    console.log(`MintAmount (${tokenAmount} ${tokenSymbol}) on GOERLI...`);

    const signerBalance = await this._getCurrentChainBalance(signerAddress);
    console.log(`SIGNER balance before transaction: ${signerBalance} ${tokenSymbol}`);
  }
}

export default ValidationService;
