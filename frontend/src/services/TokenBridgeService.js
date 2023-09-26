import { doc, addDoc, updateDoc, getDocs, collection, query, where, orderBy } from "firebase/firestore";
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
    const dbQuery = query(
      transfersCollection,
      where("toNetwork", "==", this.currentChain.name)
    );

    await getDocs(dbQuery).then((recs) => {
      recs.forEach((record) => {
        records.push({
          ...record.data(),
          id: record.id
        });
      });
    });

    return records;
  }

  async fetchClaimedRecords() {
    let records = [];

    const transfersCollection = collection(firestore, "transfers");
    const dbQuery = query(
      transfersCollection,
      where("claimed", "==", true),
      where("fromWallet", "==", this.signerAddress),
      where("toWallet", "==", this.signerAddress),
      orderBy("timestamp", "desc")
    );

    await getDocs(dbQuery).then((recs) => {
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
      let signerBalance = await this._getBalance(this.signerAddress);
      console.log("SENDER balance before TRANSFER:", signerBalance);
      let bridgeBalance = await this._getBalance(this.bridgeAddress);
      console.log("BRIDGE balance before TRANSFER:", bridgeBalance);

      console.log(`LockAmount(${data.tokenAmount} ${data.tokenSymbol}) on SEPOLIA...`);

      successResponse = await this._lockAmount({
        tokenAddress: this.tokenAddress,
        tokenAmount: tokenAmountFormatted,
        deadline: data.deadline,
        r: signedData.r,
        s: signedData.s,
        v: signedData.v
      });

      signerBalance = await this._getBalance(this.signerAddress);
      console.log("SENDER balance after TRANSFER:", signerBalance);
      bridgeBalance = await this._getBalance(this.bridgeAddress);
      console.log("BRIDGE balance after TRANSFER:", bridgeBalance);
    }

    if (this.currentChain.name === 'goerli') {
      console.log(`BurnAmount(${data.tokenAmount} ${data.tokenSymbol}) on GOERLI...`);

      successResponse = await this._burnAmount({
        tokenAddress: this.tokenAddress,
        tokenAmount: tokenAmountFormatted,
        deadline: data.deadline,
        r: signedData.r,
        s: signedData.s,
        v: signedData.v
      });
    }

    if (successResponse) {
      const ref = collection(firestore, "transfers");
      return await addDoc(ref, data);
    }

    throw new Error("The given amount could not be transferred!");
  }

  async claimAmount(data) {
    let successResponse = false;

    const tokenAmountFormatted = formattedAmount(data.tokenAmount);

    if (this.currentChain.name === 'sepolia') {
      let signerBalance = await this._getBalance(this.signerAddress);
      console.log("SENDER balance before CLAIM:", signerBalance);
      let bridgeBalance = await this._getBalance(this.bridgeAddress);
      console.log("BRIDGE balance before CLAIM:", bridgeBalance);

      console.log(`UnlockAmount(${data.tokenAmount} ${data.tokenSymbol}) on SEPOLIA...`);

      successResponse = await this._unlockAmount({
        tokenAddress: this.tokenAddress,
        tokenAmount: tokenAmountFormatted
      });

      signerBalance = await this._getBalance(this.signerAddress);
      console.log("SENDER balance after CLAIM:", signerBalance);
      bridgeBalance = await this._getBalance(this.bridgeAddress);
      console.log("BRIDGE balance after CLAIM:", bridgeBalance);
    }

    if (this.currentChain.name === 'goerli') {
      console.log(`MintAmount(${data.tokenAmount} ${data.tokenSymbol}) on GOERLI...`);

      successResponse = await this._mintAmount({
        tokenAddress: this.tokenAddress,
        tokenAmount: tokenAmountFormatted
      });
    }

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
