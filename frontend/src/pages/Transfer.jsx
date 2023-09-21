import { useNavigate  } from 'react-router-dom';
import { useNetwork, useAccount } from 'wagmi'
import { fetchToken } from '@wagmi/core';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useEffect, useState } from "react";

import { toast } from 'react-toastify';
import { truncate, network } from '../utils';
import { TokenBridgeService } from "../services";
import SignMessage from '../components/custom/SignMessage';

export default function Transfer() {

  const navigate = useNavigate();

  const { chain } = useNetwork();
  const { address: accountAddress } = useAccount();
  
  const [showModal, setShowModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [signedMessage, setSignedMessage] = useState(null);
  const [chainBridge, setChainBridge] = useState({
    networkName: '',
    tokenAddress: '0x0',
    tokenAmount: 0
  });
  const [token, setToken] = useState({
    name: '',
    symbol: '',
    address: '',
    decimals: 0,
    totalSupply: 0
  });

  useEffect(() => {
    const getTokenData = async () => {
      if (!!chain?.name) {
        const tokenData = await fetchToken({
          address: network(chain.name).tokenAddress,
        });
        setToken(tokenData);
      }
    };
    getTokenData();
  }, [chain]);

  const handleShowModal = () => {
    setShowModal(true);
  };
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
      tokenSymbol: token.symbol,
      tokenAmount: chainBridge.tokenAmount,
      timestamp: transferDatetime,
      deadline: transferDeadline,
      claimed: false
    };

    TokenBridgeService.transferAmount(createdTransfer).then(() => {
      toast.success("Transfer send successfully.", { autoClose: 1000 });
    }).catch((err) => {
      console.error(err);
      toast.error(err.message, { autoClose: 4000 });
    });

    setChainBridge({
      networkName: '',
      tokenAddress: '0x0',
      tokenAmount: 0
    });
    setShowModal(false);

    navigate('/claim', { replace: true });
  };

  const canInputAddress = (address) => {
    const options = ['0x0', token.address];

    return !options.includes(address);
  };

  const checkTokenAddress = async (address) => {
    let flag = false;
    const regexp = /^0x[a-fA-F0-9]{40}$/g;
    
    if (regexp.test(address)) {
      await fetchToken({
        address
      }).then((res) => {
        flag = !!res.decimals;
      }).catch((err) => {
        flag = false;
      });
    }

    return flag;
  };

  useEffect(() => {
    const checkFormValidation = async () => {
      const isValidNetwork = !!chainBridge.networkName;
      const isTokenAddress = await checkTokenAddress(chainBridge.tokenAddress);
      const isValidAmount = !!parseInt(chainBridge.tokenAmount);
  
      setIsFormValid(isValidNetwork && isTokenAddress && isValidAmount);
    };
    checkFormValidation();
  }, [chainBridge]);

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
            <option value="Sepolia" disabled={chain?.name === "Sepolia"}>Sepolia</option>
            <option value="Goerli" disabled={chain?.name === "Goerli"}>Goerli</option>

          </Form.Select>
        </Form.Group>

        <Form.Group className="py-3">
          <Form.Label>Token address:</Form.Label>

          {canInputAddress(chainBridge.tokenAddress) ? (
            <Form.Control 
              type="text" 
              name="tokenAddress" 
              value={chainBridge.tokenAddress} 
              placeholder="Enter Address" 
              onChange={handleInputChange} />
          ) : (
            <Form.Select 
              name="tokenAddress" 
              value={chainBridge.tokenAddress} 
              onChange={handleInputChange}>

              <option value="0x0">Select Address</option>
              <option value={token.address}>[{token.name}] {token.address}</option>
              <option value="">Other</option>

            </Form.Select>
          )}
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
            disabled={!isFormValid} 
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
            <p>Source chain: {chain?.name}</p>
            <p>Target chain: {chainBridge.networkName}</p>
            {chainBridge.tokenAddress && (
              <p>Token address: {truncate(chainBridge.tokenAddress, 16)}</p>
            )}
            <p>Token supply: {token.totalSupply.formatted} {token.symbol}<br/>
            Token amount: {chainBridge.tokenAmount} {token.symbol}</p>
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
