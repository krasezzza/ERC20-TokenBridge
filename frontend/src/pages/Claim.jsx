import { useNavigate  } from 'react-router-dom';
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNetwork } from 'wagmi';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

import ItemsPagination from "../components/gui/ItemsPagination";
import { capitalize, truncate } from '../utils';
import Loading from "../components/gui/Loading";
import { ValidationService } from "../services";
import { BridgeService } from "../services";


export default function Claim() {

  const navigate = useNavigate();
  const { chain } = useNetwork();

  const [isLoading, setIsLoading] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentPageItems, setCurrentPageItems] = useState([]);
  const [transferRecords, setTransferRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState({
    fromNetwork: "",
    toNetwork: "",
    tokenAddress: "",
    tokenSymbol: "",
    tokenAmount: 0
  });

  const handleShowModal = (selected) => {
    setSelectedRecord(selected);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setSelectedRecord({
      fromNetwork: "",
      toNetwork: "",
      tokenAddress: "",
      tokenSymbol: "",
      tokenAmount: 0
    });
    setShowModal(false);
  };

  const handleUpdateTransfer = async () => {
    setIsLoading(true);

    const updatedTransfer = {...selectedRecord};
    updatedTransfer.claimed = true;

    const bridgeService = new BridgeService(chain.network);
    const validationService = new ValidationService();

    await bridgeService.claimAmount(
      validationService, 
      updatedTransfer
    ).then(() => {
      toast.success("Transfer claimed successfully.", { autoClose: 1500 });
      navigate('/history', { replace: true });
    }).catch((err) => {
      console.error(err.message);
      toast.error(capitalize(err.message.split(' (')[0]), { autoClose: 4000 });
    });

    setIsLoading(false);
    setShowModal(false);
    setRerender(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const bridgeService = new BridgeService(chain?.network);

      await bridgeService.fetchTransferRecords().then((results) => {
        setTransferRecords([...results]);
      }).catch((err) => {
        console.error(err.message);
        toast.error(err.message, { autoClose: 4000 });
      });

      setIsLoading(false);
    };

    fetchData();
    setRerender(false);
    // eslint-disable-next-line
  }, [chain, rerender, transferRecords.length]);

  const handleCallback = (items) => {
    setCurrentPageItems(items);
  };

  return (
    <div className="container pt-6">
      <h1 className="text-center">Claim Tokens</h1>

      {isLoading ? (<Loading />) : (
        <div className="content-wrapper">
          <Table className="w-75 mx-auto mt-6 mb-3" responsive="sm" hover={true} striped>
            <thead>
              <tr className="text-center">
                <th>Token</th>
                <th>Source</th>
                <th>Target</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentPageItems.length ? (
                currentPageItems.map(transfer => (
                  <tr className="text-center align-middle" key={transfer.id}>
                    <td>
                      <span>{transfer.tokenAmount} {transfer.tokenSymbol}</span>
                      <br />
                      <span>{truncate(transfer.tokenAddress, 9)}</span>
                    </td>

                    <td>
                      <span>{capitalize(transfer.fromNetwork)}</span>
                      <br />
                      <span>{truncate(transfer.fromWallet, 9)}</span>
                    </td>

                    <td>
                      <span>{capitalize(transfer.toNetwork)}</span>
                      <br />
                      <span>{truncate(transfer.toWallet, 9)}</span>
                    </td>

                    <td>
                      {transfer.claimed ? (
                        <Button 
                          variant="outline-secondary" 
                          disabled={true}>
                          Claimed
                        </Button>
                      ) : (
                        <Button 
                          variant="outline-primary" 
                          onClick={() => handleShowModal(transfer)}>
                          Claim
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center align-middle">
                  <td colSpan={4}>No records currently.</td>
                </tr>
              )}
            </tbody>
          </Table>

          <ItemsPagination 
            records={transferRecords} 
            setPageItemsCallback={handleCallback} />
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header>
          <Modal.Title className="user-select-none">Please Confirm</Modal.Title>
        </Modal.Header>

        {isLoading ? (<Loading />) : (
          <Modal.Body>
            <p>Are you sure you want to claim your token(s):</p>
            <p>Source chain: {capitalize(selectedRecord.fromNetwork)}</p>
            <p>Target chain: {capitalize(selectedRecord.toNetwork)}</p>
            <p>Token address: {truncate(selectedRecord.tokenAddress, 16)}</p>
            <p>Token amount: {selectedRecord.tokenAmount} {selectedRecord.tokenSymbol}</p>
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
            onClick={handleUpdateTransfer}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
