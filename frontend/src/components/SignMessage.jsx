import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { verifyMessage } from "ethers";
import { useSignMessage } from "wagmi";

export default function SignMessage(props) {

  const { data: signatureData, error, isLoading, signMessage } = useSignMessage({
    onSuccess(signatureData, variables) {
      const signerAddress = verifyMessage(variables.message, signatureData);
      props.signedData({
        address: signerAddress,
        signature: signatureData,
        message: variables.message
      });
    }
  });

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const message = formData.get('message');
    signMessage({ message });
  };

  return (
    <div className="mt-4 mb-2">
      <Form className="d-flex align-items-center" onSubmit={handleSubmit}>
        <Form.Group className="w-75">
          <Form.Control 
            as="textarea" 
            rows={1} 
            name="message" 
            placeholder="Enter message..."/>
        </Form.Group>

        <Button 
          type="submit" 
          className="w-25 ms-3" 
          variant="primary" 
          disabled={isLoading}>
            {isLoading ? 'Check' : 'Sign'}
        </Button>
      </Form>

      {signatureData && (
        <div className="text-success text-truncate mt-4 px-1">
          Signature: {signatureData}
        </div>
      )}

      {error && (
        <div className="text-danger mt-4 px-1">
          Error: {error.message}
        </div>
      )}
    </div>
  )
};
