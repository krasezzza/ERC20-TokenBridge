import { doc, addDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { Contract, BrowserProvider, formatEther } from 'ethers';
import { networkProps, formattedAmount } from '../utils';
import firestore from "../firebase";

import signaturePermit from "./SignaturePermitService";
import TokenBridge from "../abi/TokenBridge.json";
import WERC20 from "../abi/WERC20.json";

class TokenBridgeService {

  constructor(config) {
    this.provider = config.provider;
    this.currentChain = config.currentChain;

    this.signerAddress = config.signerAddress;
    this.bridgeAddress = config.bridgeAddress;
    this.tokenAddress = config.tokenAddress;

    this.bridgeContract = new Contract(this.bridgeAddress, TokenBridge.abi, config.signer);
    this.tokenContract = new Contract(this.tokenAddress, WERC20.abi, config.signer);
  }

  static async initialize(chain) {
    const provider = new BrowserProvider(window.ethereum);
    const currentChain = await provider.getNetwork();

    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    const bridgeAddress = networkProps(chain.network).bridgeAddress;
    const tokenAddress = networkProps(chain.network).tokenAddress;

    return new TokenBridgeService({ 
      provider, 
      currentChain,
      signer, 
      signerAddress, 
      bridgeAddress, 
      tokenAddress 
    });
  }

  async fetchRecords() {
    let records = [];
    const transfersCollection = collection(firestore, "transfers");

    await getDocs(transfersCollection).then((recs) => {
      recs.forEach((record) => {
        records.push({
          ...record.data(),
          id: record.id
        });
      });
    });

    return records;
  }

  async transferAmount(data) {
    let successResponse = false;

    let signerBalance = await this._getBalance(this.signerAddress);
    console.log("Signer balance before TRANSFER is:", signerBalance);
    let bridgeBalance = await this._getBalance(this.bridgeAddress);
    console.log("Bridge balance before TRANSFER is:", bridgeBalance);

    const tokenAmountFormatted = formattedAmount(data.tokenAmount);

    const signedData = await signaturePermit(
      this.signerAddress,
      this.bridgeAddress,
      tokenAmountFormatted,
      this.tokenContract,
      this.provider,
      data.deadline
    );

    if (this.currentChain.name === 'sepolia') {
      console.log("Executing on Sepolia testnet...");

      successResponse = await this._lockAmount({
        tokenAddress: this.tokenAddress,
        tokenAmount: tokenAmountFormatted,
        deadline: data.deadline,
        r: signedData.r,
        s: signedData.s,
        v: signedData.v
      });
    }

    if (this.currentChain.name === 'goerli') {
      console.log("Executing on Goerli testnet...");

      successResponse = await this._burnAmount({
        tokenAddress: this.tokenAddress,
        tokenAmount: tokenAmountFormatted,
        deadline: data.deadline,
        r: signedData.r,
        s: signedData.s,
        v: signedData.v
      });
    }

    signerBalance = await this._getBalance(this.signerAddress);
    console.log("Signer balance after TRANSFER is:", signerBalance);
    bridgeBalance = await this._getBalance(this.bridgeAddress);
    console.log("Bridge balance after TRANSFER is:", bridgeBalance);

    if (successResponse) {
      const ref = collection(firestore, "transfers");
      return await addDoc(ref, data);
    }

    throw new Error("The given amount could not be transferred!");
  }

  async claimAmount(data) {
    let successResponse = false;

    let signerBalance = await this._getBalance(this.signerAddress);
    console.log("Signer balance before CLAIM is:", signerBalance);
    let bridgeBalance = await this._getBalance(this.bridgeAddress);
    console.log("Bridge balance before CLAIM is:", bridgeBalance);

    const tokenAmountFormatted = formattedAmount(data.tokenAmount);

    if (this.currentChain.name === 'sepolia') {
      console.log("Executing on Sepolia testnet...");

      successResponse = await this._unlockAmount({
        tokenAddress: this.tokenAddress,
        tokenAmount: tokenAmountFormatted
      });
    }

    if (this.currentChain.name === 'goerli') {
      console.log("Executing on Goerli testnet...");

      successResponse = await this._mintAmount({
        tokenAddress: this.tokenAddress,
        tokenAmount: tokenAmountFormatted
      });
    }

    signerBalance = await this._getBalance(this.signerAddress);
    console.log("Signer balance after CLAIM is:", signerBalance);
    bridgeBalance = await this._getBalance(this.bridgeAddress);
    console.log("Bridge balance after CLAIM is:", bridgeBalance);

    if (successResponse) {
      const ref = doc(firestore, "transfers", data.id);
      return await updateDoc(ref, data);
    }

    throw new Error("The given amount could not be claimed!");
  }

  async _lockAmount(params) {
    try {
      const lockAmountTx = await this.bridgeContract.lockAmount(
        params.tokenAddress,
        params.tokenAmount,
        params.deadline,
        params.r,
        params.s,
        params.v
      );
      const lockAmountReceipt = await lockAmountTx.wait();

      return lockAmountReceipt.status === 1;
    } catch (err) {
      throw new Error(err.message.split('(')[0]);
    }
  }

  async _burnAmount(params) {
    try {
      const burnAmountTx = await this.bridgeContract.burnAmount(
        params.tokenAddress,
        params.tokenAmount,
        params.deadline,
        params.r,
        params.s,
        params.v
      );
      const burnAmountReceipt = await burnAmountTx.wait();

      return burnAmountReceipt.status === 1;
    } catch (err) {
      throw new Error(err.message.split('(')[0]);
    }
  }

  async _unlockAmount(params) {
    try {
      const unlockAmountTx = await this.bridgeContract.unlockAmount(
        params.tokenAddress,
        params.tokenAmount
      );
      const unlockAmountReceipt = await unlockAmountTx.wait();

      return unlockAmountReceipt.status === 1;
    } catch (err) {
      throw new Error(err.message.split('(')[0]);
    }
  }

  async _mintAmount(params) {
    try {
      const mintAmountTx = await this.bridgeContract.mintAmount(
        params.tokenAddress,
        params.tokenAmount
      );
      const mintAmountReceipt = await mintAmountTx.wait();

      return mintAmountReceipt.status === 1;
    } catch (err) {
      throw new Error(err.message.split('(')[0]);
    }
  }

  async _getBalance(address) {
    const balance = await this.tokenContract.balanceOf(address);
    return formatEther(balance);
  }
}

export default TokenBridgeService;
