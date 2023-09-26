import { Signature } from "ethers";

const signaturePermit = async (
  owner,
  spender,
  value,
  tokenContract,
  provider,
  deadline
) => {
  try {
    const nonce = await tokenContract.nonces(owner);
    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];
    const tokenName = await tokenContract.name();
    const network = await provider.getNetwork();
    const domain = {
      name: tokenName,
      version: "1",
      chainId: network.chainId.toString(),
      verifyingContract: tokenContract.target
    };
    const Permit = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ];
    const message = {
      owner,
      spender,
      value: value.toString(),
      nonce: nonce.toString(),
      deadline
    };
    const data = JSON.stringify({
      types: { EIP712Domain, Permit },
      domain,
      primaryType: "Permit",
      message
    });

    const signature = await provider.send("eth_signTypedData_v4", [owner, data]);
    const signedData = Signature.from(signature);

    return {
      r: signedData.r,
      s: signedData.s,
      v: signedData.v
    };
  } catch (err) {
    throw new Error(`${err.message}`);
  }
};

export default signaturePermit;
