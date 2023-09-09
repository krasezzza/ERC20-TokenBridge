// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WERC20 is ERC20 {

  address public admin;

  constructor(
    uint256 _initialAmount,
    string memory _tokenName,
    string memory _tokenSymbol
  ) ERC20(_tokenName, _tokenSymbol) {

    admin = msg.sender;
    mint(msg.sender, _initialAmount);
  }

  function burn(address _from, uint256 _amount) public {
    _burn(_from, _amount);
  }

  function mint(address _to, uint256 _amount) public {
    require(msg.sender == admin, "TokenMint: UNAUTHORIZED_USER");
    _mint(_to, _amount);
  }

  function permit(
    address _owner,
    address _spender,
    uint256 _amount,
    uint256 _deadline,
    string memory _message,
    bytes memory _signature
  ) public returns (bool) {

    require(_amount > 0, "TokenPermit: INVALID_AMOUNT");
    require(block.timestamp < _deadline, "TokenPermit: TRANSACTION_EXPIRED");

    bytes32 messageHash = getMessageHash(_owner, _spender, _amount, _deadline, _message);
    bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
    address recoveredAddress = recoverSigner(ethSignedMessageHash, _signature);

    require(
      recoveredAddress != address(0) && recoveredAddress == _owner,
      "TokenPermit: INVALID_SIGNATURE"
    );

    return approve(_spender, _amount);
  }

  function recoverSigner(
    bytes32 _ethSignedMessageHash, 
    bytes memory _signature
  ) private pure returns (address) {

    bytes32 r;
    bytes32 s;
    uint8 v;

    (r, s, v) = splitSignature(_signature);

    return ecrecover(_ethSignedMessageHash, v, r, s);
  }

  function splitSignature(
    bytes memory _signature
  ) internal pure returns (bytes32, bytes32, uint8) {

    require(_signature.length == 65, "SplitSignature: INVALID_LENGTH");

    bytes32 r;
    bytes32 s;
    uint8 v;

    assembly {
      // first 32 bytes, after the length prefix
      r := mload(add(_signature, 32))
      // second 32 bytes
      s := mload(add(_signature, 64))
      // final byte (first byte of the next 32 bytes)
      v := byte(0, mload(add(_signature, 96)))
    }

    return (r, s, v);
  }

  function getMessageHash(
    address _owner,
    address _spender,
    uint256 _amount,
    uint256 _deadline,
    string memory _message
  ) public pure returns (bytes32) {

    return keccak256(
      abi.encodePacked(_owner, _spender, _amount, _deadline, _message)
    );
  }

  function getEthSignedMessageHash(
    bytes32 _messageHash
  ) public pure returns (bytes32) {

    return keccak256(
      abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
    );
  }
}
