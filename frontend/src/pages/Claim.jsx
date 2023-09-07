import Pagination from 'react-bootstrap/Pagination';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { useState } from "react";

export default function Claim() {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="container my-6 py-3">
      <h1 className="text-center">Claim Tokens</h1>

      <Table className="my-6" responsive="sm" hover={true} striped>
        <thead>
          <tr>
            <th>Source</th>
            <th>Target</th>
            <th>Token</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="align-middle">Sepolia</td>
            <td className="align-middle">Mumbai</td>
            <td className="align-middle">wETH</td>
            <td className="align-middle">4.567</td>
            <td className="align-middle">
              <Button 
                variant="outline-primary" 
                onClick={handleShowModal}>
                  Claim
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>

      <Pagination className="justify-content-center mt-9">
        <Pagination.First />
        <Pagination.Prev />
        <Pagination.Item>{1}</Pagination.Item>
        <Pagination.Ellipsis />

        <Pagination.Item>{11}</Pagination.Item>
        <Pagination.Item active>{12}</Pagination.Item>
        <Pagination.Item disabled>{13}</Pagination.Item>

        <Pagination.Ellipsis />
        <Pagination.Item>{20}</Pagination.Item>
        <Pagination.Next />
        <Pagination.Last />
      </Pagination>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Please Confirm</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Are you sure you want to claim your token(s):</p>
          <p>Source Chain: Sepolia</p>
          <p>Target Chain: Mumbai</p>
          <p>Amount: 15 wETH</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>

          <Button variant="primary" onClick={handleCloseModal}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
