import Pagination from 'react-bootstrap/Pagination';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { useEffect, useState } from "react";
import { useNetwork } from 'wagmi';

import { truncate } from '../utils';
import { toast } from 'react-toastify';
import { TokenBridgeService } from "../services";
import Loading from "../components/gui/Loading";

export default function Claim() {

  const { chain } = useNetwork();

  const [isLoading, setIsLoading] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    const updatedTransfer = {...selectedRecord};
    updatedTransfer.claimed = true;

    const tokenBridgeService = await TokenBridgeService.initialize(chain);
    await tokenBridgeService.claimAmount(updatedTransfer).then(() => {
      toast.success("Transfer claimed successfully.", { autoClose: 1000 });
    }).catch((err) => {
      console.error(err.message);
      toast.error(err.message, { autoClose: 4000 });
    });

    setShowModal(false);
    setRerender(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const tokenBridgeService = await TokenBridgeService.initialize(chain);
      await tokenBridgeService.fetchRecords().then((results) => {
        setTransferRecords([...results]);
      }).catch((err) => {
        console.error(err.message);
        toast.error(err.message, { autoClose: 4000 });
      });

      setIsLoading(false);
    };

    fetchData();
    setRerender(false);
  }, [chain, rerender]);

  return (
    <div className="container my-6 py-3">
      <h1 className="text-center">Token Claim</h1>

      {isLoading ? (<Loading />) : (
        <div className="wrapper">
          <Table className="w-75 mx-auto mt-6 mb-3" responsive="sm" hover={true} striped>
            <thead>
              <tr className="text-center">
                <th>Source</th>
                <th>Target</th>
                <th>Token</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {transferRecords.length ? (
                transferRecords.map(transfer => (
                  <tr className="text-center align-middle" key={transfer.id}>
                    <td>
                      <span>{transfer.fromNetwork}</span>
                      <br />
                      <span>{truncate(transfer.fromWallet, 9)}</span>
                    </td>

                    <td>
                      <span>{transfer.toNetwork}</span>
                      <br />
                      <span>{truncate(transfer.toWallet, 9)}</span>
                    </td>

                    <td>
                      <span>{transfer.tokenAmount} {transfer.tokenSymbol}</span>
                      <br />
                      <span>{truncate(transfer.tokenAddress, 9)}</span>
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
                  <td colSpan={5}>No records currently.</td>
                </tr>
              )}
            </tbody>
          </Table>

          <Pagination className="justify-content-center mt-9">
            <Pagination.First />
            <Pagination.Prev />

            <Pagination.Item active>{1}</Pagination.Item>

            <Pagination.Next />
            <Pagination.Last />
          </Pagination>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Please Confirm</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Are you sure you want to claim your token(s):</p>
          <p>Source chain: {selectedRecord.fromNetwork}</p>
          <p>Target chain: {selectedRecord.toNetwork}</p>
          <p>Token address: {truncate(selectedRecord.tokenAddress, 16)}</p>
          <p>Token amount: {selectedRecord.tokenAmount} {selectedRecord.tokenSymbol}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>

          <Button variant="primary" onClick={handleUpdateTransfer}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
