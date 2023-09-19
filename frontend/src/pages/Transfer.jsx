import { useNavigate  } from 'react-router-dom';
import { useNetwork, useAccount } from 'wagmi'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useState } from "react";

import { truncate } from '../utils';
import { toast } from 'react-toastify';
import { TokenBridgeService } from "../services";
import SignMessage from '../components/custom/SignMessage';

export default function Transfer() {

  const tokenChoice = {
    "Sepolia": "KRT",
    "Goerli": "WKRT"
  };
  const navigate = useNavigate();

  const { chain } = useNetwork();
  const { address: accountAddress } = useAccount();

  const [showModal, setShowModal] = useState(false);
  const [signedMessage, setSignedMessage] = useState(null);
  const [chainBridge, setChainBridge] = useState({
    networkName: '',
    tokenAddress: '',
    tokenAmount: 0
  });

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setSignedMessage(null);
    setShowModal(false);
  };

  const handleInputChange = (evt) => {
    setChainBridge({
      ...chainBridge,
      [evt.target.name]: evt.target.value
    });
  }

  const handleSubmitTransfer = () => {
    const transferDatetime = Date.now();
    const transferDeadline = transferDatetime + 3600;

    const createdTransfer = {
      fromWallet: accountAddress,
      fromNetwork: chain.name,
      toWallet: accountAddress,
      toNetwork: chainBridge.networkName,
      tokenAddress: chainBridge.tokenAddress,
      tokenSymbol: tokenChoice[chain.name],
      tokenAmount: chainBridge.tokenAmount,
      timestamp: transferDatetime,
      deadline: transferDeadline,
      claimed: false
    };

    TokenBridgeService.transferAmount(createdTransfer).then(() => {
      toast.success("Transfer send successfully.", { autoClose: 1000 });
    }).catch((err) => {
      console.log(err);
      toast.error(err.message, { autoClose: 4000 });
    });

    setChainBridge({
      networkName: '',
      tokenAddress: '',
      tokenAmount: 0
    });
    setShowModal(false);

    navigate('/claim', { replace: true });
  };

  const isTokenAddress = (address) => {
    const regexp = /^0x[a-fA-F0-9]{40}$/g;
    return regexp.test(address);
  };

  const isFormValid = () => {
    return !!chainBridge.networkName && 
      isTokenAddress(chainBridge.tokenAddress) && 
      !!parseInt(chainBridge.tokenAmount);
  };

  const pullData = (data) => {
    setSignedMessage(data);
  };

  return (
    <div className="container my-6 py-3">
      <h1 className="text-center">Token Transfer</h1>

      <Form className="w-75 mx-auto my-6">
        <Form.Group className="py-3">
          <Form.Label>Network to bridge to:</Form.Label>

          <Form.Select 
            name="networkName" 
            value={chainBridge.networkName} 
            onChange={handleInputChange}>

            <option value="">Select Network</option>
            <option value="Sepolia" disabled={chain.name === "Sepolia"}>Sepolia</option>
            <option value="Goerli" disabled={chain.name === "Goerli"}>Goerli</option>

          </Form.Select>
        </Form.Group>

        <Form.Group className="py-3">
          <Form.Label>Token address:</Form.Label>

          <Form.Control 
            type="text" 
            name="tokenAddress" 
            value={chainBridge.tokenAddress} 
            placeholder="Enter Address" 
            onChange={handleInputChange} />
        </Form.Group>

        <Form.Group className="py-3">
          <Form.Label>Choose amount:</Form.Label>

          <Form.Control 
            type="number" min="0" 
            name="tokenAmount" 
            value={chainBridge.tokenAmount} 
            placeholder="Enter Amount" 
            onChange={handleInputChange} />
        </Form.Group>

        <div className="d-flex justify-content-center align-items-center py-6">
          <Button 
            className="mx-6" 
            variant="primary" 
            disabled={!isFormValid()} 
            onClick={handleShowModal}>
              Submit
          </Button>
        </div>
      </Form>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Please Confirm</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="my-3">
            <p>Are you sure you want to bridge?</p>
            <br />
            <p>Source chain: {chain.name}</p>
            <p>Target chain: {chainBridge.networkName}</p>
            <p>Token address: {truncate(chainBridge.tokenAddress, 16)}</p>
            <p>Token amount: {chainBridge.tokenAmount} {tokenChoice[chain.name]}</p>
          </div>

          <SignMessage isVisible={showModal} signedData={pullData} />
        </Modal.Body>

        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleCloseModal}>
              Cancel
          </Button>

          <Button 
            variant="primary" 
            disabled={accountAddress !== signedMessage?.address} 
            onClick={handleSubmitTransfer}>
              Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
