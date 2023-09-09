// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "./WERC20.sol";

contract TokenBridge {

  WERC20 private token;
  uint256 public totalAmount;

  enum Step { Lock, Unlock, Burn, Mint }

  event TransferEvent(
    address from,
    address to,
    uint256 amount,
    uint256 timestamp,
    Step indexed step
  );

  constructor(address _token) {
    token = WERC20(_token);
  }

  modifier onlyAvailable(address _source, uint256 _amount) {
    require(token.balanceOf(_source) >= _amount, "TokenBridge: INSUFFICIENT_AMOUNT");
    _;
  }

  function lockToken(
    uint256 _amount, 
    uint256 _deadline, 
    string memory _message,
    bytes memory _signature
  ) external onlyAvailable(msg.sender, _amount) {

    token.permit(msg.sender, address(this), _amount, _deadline, _message, _signature);
    token.transferFrom(msg.sender, address(this), _amount);

    totalAmount += _amount;

    emit TransferEvent(
      msg.sender,
      address(this),
      _amount,
      block.timestamp,
      Step.Lock
    );
  }

  function unlockToken(
    uint256 _amount
  ) external onlyAvailable(address(this), _amount) {

    token.transferFrom(address(this), msg.sender, _amount);

    totalAmount -= _amount;

    emit TransferEvent(
      address(this),
      msg.sender,
      _amount,
      block.timestamp,
      Step.Unlock
    );
  }

  function burnToken(
    uint256 _amount, 
    uint256 _deadline, 
    string memory _message,
    bytes memory _signature
  ) public onlyAvailable(msg.sender, _amount) {

    token.permit(msg.sender, address(this), _amount, _deadline, _message, _signature);
    token.burn(msg.sender, _amount);

    totalAmount += _amount;

    emit TransferEvent(
      msg.sender,
      address(this),
      _amount,
      block.timestamp,
      Step.Burn
    );
  }

  function mintToken(
    uint256 _amount
  ) public onlyAvailable(address(this), _amount) {

    token.mint(msg.sender, _amount);

    totalAmount -= _amount;

    emit TransferEvent(
      address(this),
      msg.sender,
      _amount,
      block.timestamp,
      Step.Mint
    );
  }
}
