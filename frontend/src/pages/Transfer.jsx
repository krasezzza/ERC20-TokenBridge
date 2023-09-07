import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useState } from "react";

export default function Transfer() {

  const [transferForm, setTransferForm] = useState({
    network: '',
    address: 0x0,
    amount: 0
  });
  const handleInputChange = (evt) => {
    setTransferForm({
      ...transferForm,
      [evt.target.name]: evt.target.value
    });
  }

  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="container my-6 py-3">
      <h1 className="text-center">Transfer Tokens</h1>

      <Form className="my-6">
        <Form.Group className="py-3">
          <Form.Label>Choose network to bridge to:</Form.Label>

          <Form.Select 
            name="network" 
            value={ transferForm.network } 
            onChange={ handleInputChange }>
            <option>Select Network</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="py-3">
          <Form.Label>Choose token/address:</Form.Label>

          <Form.Select 
            name="address" 
            value={ transferForm.address } 
            onChange={ handleInputChange }>
            <option>Select Token or Address</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="py-3">
          <Form.Label>Choose amount:</Form.Label>

          <Form.Control 
            type="number" min="1" 
            name="amount" 
            value={ transferForm.amount } 
            placeholder="Enter Amount" 
            onChange={ handleInputChange } />
        </Form.Group>

        <div className="d-flex justify-content-center align-items-center py-6">
          <Button 
            className="mx-6" 
            variant="secondary">
              Approve
          </Button>

          <Button 
            className="mx-6" 
            variant="primary" 
            onClick={handleShowModal}>
              Transfer
          </Button>
        </div>
      </Form>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Please Confirm</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Are you sure you want to bridge:</p>
          <p>Source Chain: Sepolia</p>
          <p>Target Chain: Mumbai</p>
          <p>Token: wETH</p>
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
