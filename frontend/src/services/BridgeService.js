import { doc, addDoc, updateDoc, getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { networkProps, formattedAmount } from '../utils';
import { Contract, BrowserProvider } from 'ethers';
import firestore from "../firebase";

import TokenBridge from "../abi/TokenBridge.json";
import WERC20 from "../abi/WERC20.json";

class BridgeService {

  constructor(network) {
    this._network = network;
    this._provider = new BrowserProvider(window.ethereum);
  }

  async _getSigner() {
    return await this._provider.getSigner();
  }

  async _getSignerAddress() {
    const signer = await this._getSigner();

    return signer.address;
  }

  async _getBridgeContract() {
    const signer = await this._getSigner();
    const bridgeAddress = networkProps(this._network).bridgeAddress;

    return new Contract(bridgeAddress, TokenBridge.abi, signer);
  }

  async _getTokenContract() {
    const signer = await this._getSigner();
    const tokenAddress = networkProps(this._network).tokenAddress;

    return new Contract(tokenAddress, WERC20.abi, signer);
  }

  async _lockAmount(params) {
    try {
      const bridgeContract = await this._getBridgeContract();
      const lockAmountTx = await bridgeContract.lockAmount(
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
      const bridgeContract = await this._getBridgeContract();
      const burnAmountTx = await bridgeContract.burnAmount(
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
      const bridgeContract = await this._getBridgeContract();
      const unlockAmountTx = await bridgeContract.unlockAmount(
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
      const bridgeContract = await this._getBridgeContract();
      const mintAmountTx = await bridgeContract.mintAmount(
        params.tokenAddress,
        params.tokenAmount
      );
      const mintAmountReceipt = await mintAmountTx.wait();

      return mintAmountReceipt.status === 1;
    } catch (err) {

      throw new Error(err.message.split('(')[0]);
    }
  }

  async fetchTransferRecords() {
    let records = [];

    const transfersCollection = collection(firestore, "transfers");
    const dbQuery = query(
      transfersCollection,
      where("toNetwork", "==", this._network),
      orderBy("timestamp", "desc")
    );

    await getDocs(dbQuery).then((recs) => {
      recs.forEach((record) => {
        records.push({
          ...record.data(),
          id: record.id
        });
      });
    }).catch((err) => {
      console.error(err.message);
      throw new Error("The records could not be fetched!");
    });

    return records;
  }

  async fetchClaimedRecords() {
    let records = [];
    const signerAddress = await this._getSignerAddress();

    const transfersCollection = collection(firestore, "transfers");
    const dbQuery = query(
      transfersCollection,
      where("claimed", "==", true),
      where("fromWallet", "==", signerAddress),
      where("toWallet", "==", signerAddress),
      orderBy("timestamp", "desc")
    );

    await getDocs(dbQuery).then((recs) => {
      recs.forEach((record) => {
        records.push({
          ...record.data(),
          id: record.id
        });
      });
    }).catch((err) => {
      console.error(err.message);
      throw new Error("The claimed records could not be fetched!");
    });

    return records;
  }

  async transferAmount(permitSvc, txValidator, data) {
    let successResponse = false;

    const tokenAmountFormatted = formattedAmount(data.tokenAmount);
    const signerAddress = await this._getSignerAddress();
    const bridgeAddress = networkProps(this._network).bridgeAddress;
    const tokenContract = await this._getTokenContract();

    const signedData = await permitSvc.signPermit(
      signerAddress,
      bridgeAddress,
      tokenAmountFormatted,
      tokenContract,
      this._provider,
      data.deadline
    );

    if (this._network === 'sepolia') {
      await txValidator.validateLockTransaction(
        data.tokenAmount, 
        data.tokenSymbol, 
        signerAddress, 
        bridgeAddress
      );
      const chainTokenAddress = networkProps(this._network).tokenAddress;
      successResponse = await this._lockAmount({
        tokenAddress: chainTokenAddress,
        tokenAmount: tokenAmountFormatted,
        deadline: data.deadline,
        r: signedData.r,
        s: signedData.s,
        v: signedData.v
      });
      await txValidator.logBalanceAfterTransaction(data.tokenSymbol, signerAddress, bridgeAddress);
    }

    if (this._network === 'goerli') {
      await txValidator.validateBurnTransaction(
        data.tokenAmount, 
        data.tokenSymbol, 
        signerAddress
      );
      const chainTokenAddress = networkProps(this._network).tokenAddress;
      successResponse = await this._burnAmount({
        tokenAddress: chainTokenAddress,
        tokenAmount: tokenAmountFormatted,
        deadline: data.deadline,
        r: signedData.r,
        s: signedData.s,
        v: signedData.v
      });
      await txValidator.logBalanceAfterTransaction(data.tokenSymbol, signerAddress);
    }

    if (successResponse) {
      const ref = collection(firestore, "transfers");
      return await addDoc(ref, data);
    }

    throw new Error("The given amount could not be transferred!");
  }

  async claimAmount(txValidator, data) {
    let successResponse = false;

    const tokenAmountFormatted = formattedAmount(data.tokenAmount);
    const signerAddress = await this._getSignerAddress();
    const bridgeAddress = networkProps(this._network).bridgeAddress;

    if (this._network === 'sepolia') {
      await txValidator.validateUnlockTransaction(
        data.tokenAmount, 
        data.tokenSymbol, 
        signerAddress, 
        bridgeAddress
      );
      const chainTokenAddress = networkProps(this._network).tokenAddress;
      successResponse = await this._unlockAmount({
        tokenAddress: chainTokenAddress,
        tokenAmount: tokenAmountFormatted
      });
      await txValidator.logBalanceAfterTransaction(data.tokenSymbol, signerAddress, bridgeAddress);
    }

    if (this._network === 'goerli') {
      await txValidator.validateMintTransaction(
        data.tokenAmount, 
        data.tokenSymbol, 
        signerAddress
      );
      const chainTokenAddress = networkProps(this._network).tokenAddress;
      successResponse = await this._mintAmount({
        tokenAddress: chainTokenAddress,
        tokenAmount: tokenAmountFormatted
      });
      await txValidator.logBalanceAfterTransaction(data.tokenSymbol, signerAddress);
    }

    if (successResponse) {
      const ref = doc(firestore, "transfers", data.id);
      return await updateDoc(ref, data);
    }

    throw new Error("The given amount could not be claimed!");
  }
}

export default BridgeService;
