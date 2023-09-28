import { useNetwork, useAccount } from 'wagmi';
import { fetchToken } from '@wagmi/core';
import { useNavigate  } from 'react-router-dom';
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { capitalize, truncate, networkProps } from '../utils';
import Loading from "../components/gui/Loading";
import { ValidationService } from "../services";
import { BridgeService } from "../services";
import { PermitService } from "../services";


export default function Transfer() {

  const navigate = useNavigate();

  const { chain } = useNetwork();
  const { address: accountAddress } = useAccount();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
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
      if (!!chain?.network) {
        const tokenData = await fetchToken({
          address: networkProps(chain.network).tokenAddress,
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
    setShowModal(false);
  };

  const handleInputChange = (evt) => {
    setChainBridge({
      ...chainBridge,
      [evt.target.name]: evt.target.value
    });
  }

  const handleSubmitTransfer = async () => {
    setIsLoading(true);

    const transferDatetime = Date.now();
    const transferDeadline = transferDatetime + 3600;

    const createdTransfer = {
      fromWallet: accountAddress,
      fromNetwork: chain.network,
      toWallet: accountAddress,
      toNetwork: chainBridge.networkName,
      tokenAddress: chainBridge.tokenAddress,
      tokenSymbol: token.symbol,
      tokenAmount: chainBridge.tokenAmount,
      timestamp: transferDatetime,
      deadline: transferDeadline,
      claimed: false
    };

    const bridgeService = new BridgeService(chain.network);
    const validationService = new ValidationService();

    await bridgeService.transferAmount(
      PermitService, 
      validationService, 
      createdTransfer
    ).then(() => {
      toast.success("Transfer send successfully.", { autoClose: 1500 });
      toast.warning("Switch networks for token claim!", { autoClose: 4500 });
      navigate('/claim', { replace: true });
    }).catch((err) => {
      console.error(err.message);
      toast.error(err.message, { autoClose: 4000 });
    });

    setIsLoading(false);
    setChainBridge({
      networkName: '',
      tokenAddress: '0x0',
      tokenAmount: 0
    });
    setShowModal(false);
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

  return (
    <div className="container pt-8">
      <h1 className="text-center">Token Transfer</h1>

      <div className="content-wrapper">
        <Form className="w-75 mx-auto my-6">
          <Form.Group className="py-3">
            <Form.Label>Network to bridge to:</Form.Label>

            <Form.Select 
              name="networkName" 
              value={chainBridge.networkName} 
              onChange={handleInputChange}>

              <option value="">Select Network</option>
              <option value="sepolia" disabled={chain?.network === "sepolia"}>Sepolia</option>
              <option value="goerli" disabled={chain?.network === "goerli"}>Goerli</option>

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
      </div>

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header>
          <Modal.Title className="user-select-none">Please Confirm</Modal.Title>
        </Modal.Header>

        {isLoading ? (<Loading />) : (
          <Modal.Body>
            <div className="my-3">
              <p>Are you sure you want to bridge?</p>
              <br />
              <p>Source chain: {capitalize(chain?.network)}</p>
              <p>Target chain: {capitalize(chainBridge.networkName)}</p>
              {chainBridge.tokenAddress && (
                <p>Token address: {truncate(chainBridge.tokenAddress, 16)}</p>
              )}
              <p>Token supply: {token.totalSupply.formatted} {token.symbol}<br/>
              Token amount: {chainBridge.tokenAmount} {token.symbol}</p>
            </div>
          </Modal.Body>
        )}

        <Modal.Footer>
          <Button 
            variant="secondary" 
            disabled={isLoading}
            onClick={handleCloseModal}>
              Cancel
          </Button>

          <Button 
            variant="primary" 
            disabled={isLoading}
            onClick={handleSubmitTransfer}>
              Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
