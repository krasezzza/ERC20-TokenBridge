import { useSignMessage } from "wagmi";
import { verifyMessage } from "ethers";
import { useEffect } from "react";

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

  useEffect(() => {
    if (props.isVisible) {
      signMessage({ message: "Programmatically signed message." });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="mt-4 mb-2">
      {isLoading && (
        <div className="text-warning px-1">
          Pending signature request...
        </div>
      )}

      {signatureData && (
        <div className="text-success text-truncate px-1">
          Signature created successfully.
        </div>
      )}

      {error && (
        <div className="text-danger px-1">
          {error.message}
        </div>
      )}
    </div>
  )
};
