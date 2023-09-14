import Pagination from 'react-bootstrap/Pagination';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { useEffect, useState } from "react";

import { truncate } from '../utils';
import handleFetch from '../handles/fetch';
import handleUpdate from '../handles/update';
import Loading from "../components/Loading";

export default function Claim() {

  const [isLoading, setIsLoading] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transferRecords, setTransferRecords] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState({});

  const handleShowModal = (selected) => {
    setSelectedTransfer(selected);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setSelectedTransfer({});
    setShowModal(false);
  };

  const handleUpdateTransfer = () => {
    const updatedTransfer = {...selectedTransfer};
    updatedTransfer.claimed = true;
    handleUpdate(updatedTransfer);
    setShowModal(false);
    setRerender(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const results = await handleFetch();
      setTransferRecords([...results]);

      setIsLoading(false);
    };
    fetchData();
    setRerender(false);
  }, [rerender]);

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
                <th>Amount</th>
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
                      <span>{truncate(transfer.fromAddress, 9)}</span>
                    </td>

                    <td>
                      <span>{transfer.toNetwork}</span>
                      <br />
                      <span>{truncate(transfer.toAddress, 9)}</span>
                    </td>

                    <td>{transfer.token}</td>

                    <td>{transfer.amount}</td>

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
          <p>Source chain: {selectedTransfer.fromNetwork}</p>
          <p>Target chain: {selectedTransfer.toNetwork}</p>
          <p>Token amount: {selectedTransfer.amount} {selectedTransfer.token}</p>
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
