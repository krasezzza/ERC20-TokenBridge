import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useNetwork, useAccount } from 'wagmi'
import { useState } from "react";

import handleSubmit from '../handles/submit';

export default function Transfer() {

  const tokenChoice = {
    "Sepolia": "KRT",
    "Mumbai": "WKRT"
  };

  const { chain } = useNetwork();
  const { address } = useAccount();

  const [showModal, setShowModal] = useState(false);
  const [targetChain, setTargetChain] = useState({
    networkName: '',
    walletAddress: '',
    tokenAmount: 0
  });

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleInputChange = (evt) => {
    setTargetChain({
      ...targetChain,
      [evt.target.name]: evt.target.value
    });
  }
  const handleSubmitTransfer = async () => {
    const transferDatetime = Date.now();
    const transferDeadline = transferDatetime + 3600;

    await handleSubmit({
      fromNetwork: chain.name,
      fromAddress: address,
      toNetwork: targetChain.networkName,
      toAddress: targetChain.walletAddress,
      token: tokenChoice[chain.name],
      amount: targetChain.tokenAmount,
      timestamp: transferDatetime,
      deadline: transferDeadline,
      claimed: false
    });

    setTargetChain({
      networkName: '',
      walletAddress: '',
      tokenAmount: 0
    });

    setShowModal(false);
  };

  const isFormValid = () => {
    const regexpAddress = /^0x[a-fA-F0-9]{40}$/g;

    return !!targetChain.networkName && 
      regexpAddress.test(targetChain.walletAddress) && 
      !!parseInt(targetChain.tokenAmount);
  };

  return (
    <div className="container my-6 py-3">
      <h1 className="text-center">Token Transfer</h1>

      <Form className="w-75 mx-auto my-6">
        <Form.Group className="py-3">
          <Form.Label>Choose network to bridge to:</Form.Label>

          <Form.Select 
            name="networkName" 
            value={ targetChain.networkName } 
            onChange={ handleInputChange }>

            <option value="">Select Network</option>
            <option value="Sepolia" disabled={chain.name === "Sepolia"}>Sepolia</option>
            <option value="Mumbai" disabled={chain.name === "Mumbai"}>Mumbai</option>

          </Form.Select>
        </Form.Group>

        <Form.Group className="py-3">
          <Form.Label>Choose address:</Form.Label>

          <Form.Control 
            type="text" 
            name="walletAddress" 
            value={ targetChain.walletAddress } 
            placeholder="Enter Address" 
            onChange={ handleInputChange } />
        </Form.Group>

        <Form.Group className="py-3">
          <Form.Label>Choose amount:</Form.Label>

          <Form.Control 
            type="number" min="0" 
            name="tokenAmount" 
            value={ targetChain.tokenAmount } 
            placeholder="Enter Amount" 
            onChange={ handleInputChange } />
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
          <p>Are you sure you want to bridge?</p>
          <br />
          <p>Source chain: {chain.name}</p>
          <p>Target chain: {targetChain.networkName}</p>
          <p>Token amount: {targetChain.tokenAmount} {tokenChoice[chain.name]}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>

          <Button variant="primary" onClick={handleSubmitTransfer}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
