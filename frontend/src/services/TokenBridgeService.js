import { doc, addDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { Contract, BrowserProvider, formatEther, verifyMessage } from 'ethers';
import firestore from "../firebase";
import { network } from '../utils';

import TokenBridge from "../abi/TokenBridge.json";
import WERC20 from "../abi/WERC20.json";

class TokenBridgeService {

  constructor(config) {
    this.provider = config.provider;

    this.signerAddress = config.signerAddress;
    this.bridgeAddress = config.bridgeAddress;
    this.tokenAddress = config.tokenAddress;

    this.bridgeContract = new Contract(this.bridgeAddress, TokenBridge.abi, config.signer);
    this.tokenContract = new Contract(this.tokenAddress, WERC20.abi, config.signer);
  }

  static async initialize(chain) {
    const provider = new BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    const bridgeAddress = network(chain.name).bridgeAddress;
    const tokenAddress = network(chain.name).tokenAddress;

    return new TokenBridgeService({ provider, signer, signerAddress, bridgeAddress, tokenAddress });
  }

  async fetchRecords() {
    let records = [];
    const transfersCollection = collection(firestore, "transfers");

    await getDocs(transfersCollection).then((recs) => {
      recs.forEach((record) => {
        records.push({
          id: record.id,
          ...record.data()
        });
      });
    });

    return records;
  }

  async transferAmount(data) {
    let successResponse = false;
    let signedData = null;

    try {
      const message = "Programmatically signed message.";
      signedData = await this.signGivenMessage(message);
      successResponse = this.verifySignedMessage(signedData);
    } catch (err) {
      throw new Error("Message verification rejected!");
    }

    let signerBalance = await this.getBalance(this.signerAddress);
    console.log("Signer balance before operation is:", signerBalance);
    let bridgeBalance = await this.getBalance(this.bridgeAddress);
    console.log("Bridge balance before operation is:", bridgeBalance);

    if (successResponse && signedData) {
      const currentChain = await this.provider.getNetwork();

      if (currentChain.name === 'sepolia') {
        console.log("Executing on Sepolia testnet...");
  
        try {
          const lockAmountTx = await this.bridgeContract.lockAmount(
            this.tokenAddress,
            data.tokenAmount,
            data.deadline,
            signedData.signature
          );
          const lockAmountReceipt = await lockAmountTx.wait();
          successResponse = lockAmountReceipt.status === 1;
        } catch (err) {
          throw new Error(err.message.split('(')[0]);
        }
      }
  
      if (currentChain.name === 'goerli') {
        console.log("Executing on Goerli testnet...");
  
        try {
          const burnAmountTx = await this.bridgeContract.burnAmount(
            this.tokenAddress,
            data.tokenAmount,
            data.deadline,
            signedData.signature
          );
          const burnAmountReceipt = await burnAmountTx.wait();
          successResponse = burnAmountReceipt.status === 1;
        } catch (err) {
          throw new Error(err.message.split('(')[0]);
        }
      }
    }

    signerBalance = await this.getBalance(this.signerAddress);
    console.log("Signer balance after operation is:", signerBalance);
    bridgeBalance = await this.getBalance(this.bridgeAddress);
    console.log("Bridge balance after operation is:", bridgeBalance);

    if (successResponse) {
      const ref = collection(firestore, "transfers");
      return await addDoc(ref, data);
    }

    throw new Error("The given amount could not be transferred!");
  }

  async claimAmount(data) {
    let successResponse = false;

    let signerBalance = await this.getBalance(this.signerAddress);
    console.log("Signer balance before operation is:", signerBalance);
    let bridgeBalance = await this.getBalance(this.bridgeAddress);
    console.log("Bridge balance before operation is:", bridgeBalance);

    const currentChain = await this.provider.getNetwork();

    if (currentChain.name === 'sepolia') {
      console.log("Executing on Sepolia testnet...");

      try {
        const unlockAmountTx = await this.bridgeContract.unlockAmount(
          this.tokenAddress,
          data.tokenAmount,
        );
        const unlockAmountReceipt = await unlockAmountTx.wait();
        successResponse = unlockAmountReceipt.status === 1;
      } catch (err) {
        throw new Error(err.message.split('(')[0]);
      }
    }

    if (currentChain.name === 'goerli') {
      console.log("Executing on Goerli testnet...");

      try {
        const mintAmountTx = await this.bridgeContract.mintAmount(
          this.tokenAddress,
          data.tokenAmount,
        );
        const mintAmountReceipt = await mintAmountTx.wait();
        successResponse = mintAmountReceipt.status === 1;
      } catch (err) {
        throw new Error(err.message.split('(')[0]);
      }
    }

    signerBalance = await this.getBalance(this.signerAddress);
    console.log("Signer balance after operation is:", signerBalance);
    bridgeBalance = await this.getBalance(this.bridgeAddress);
    console.log("Bridge balance after operation is:", bridgeBalance);

    if (successResponse) {
      const ref = doc(firestore, "transfers", data.id);
      return await updateDoc(ref, data);
    }

    throw new Error("The given amount could not be claimed!");
  }

  async getBalance(address) {
    const balance = await this.tokenContract.balanceOf(address);
    return formatEther(balance);
  }

  async signGivenMessage(message) {
    const signer = await this.provider.getSigner();
    const address = await signer.getAddress();
    const signature = await signer.signMessage(message);
    
    return { message, address, signature };
  }

  verifySignedMessage({ message, address, signature }) {
    const signerAddress = verifyMessage(message, signature);

    if (signerAddress !== address) {
      return false;
    }
    return true;
  }
}

export default TokenBridgeService;
