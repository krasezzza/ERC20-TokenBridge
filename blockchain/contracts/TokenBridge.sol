// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface IWERC20 {

  function balanceOf(address source) external view returns (uint256);

  function transfer(address to, uint256 amount) external;

  function transferFrom(address owner, address spender, uint256 amount) external;

  function mintToken(address to, uint256 value) external;

  function burnToken(address from, uint256 value) external;

  function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;
}

contract TokenBridge {

  enum Step { Lock, Unlock, Burn, Mint }

  event TransferEvent(
    address from,
    address to,
    uint256 amount,
    uint256 timestamp,
    Step indexed step
  );

  modifier onlyAvailable(address _tokenAddress, address _source, uint256 _amount) {
    require(
      IWERC20(_tokenAddress).balanceOf(_source) >= _amount,
      "TokenBridge: insufficient amount"
    );
    _;
  }

  function lockAmount(
    address _tokenAddress,
    uint256 _amount,
    uint256 _deadline,
    bytes32 r,
    bytes32 s,
    uint8 v
  ) external onlyAvailable(_tokenAddress, msg.sender, _amount) {

    IWERC20(_tokenAddress).permit(
      msg.sender,
      address(this),
      _amount,
      _deadline,
      v, r, s
    );

    IWERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);

    emit TransferEvent(
      msg.sender,
      address(this),
      _amount,
      block.timestamp,
      Step.Lock
    );
  }

  function unlockAmount(address _tokenAddress, uint256 _amount) external {

    IWERC20(_tokenAddress).transfer(msg.sender, _amount);

    emit TransferEvent(
      address(this),
      msg.sender,
      _amount,
      block.timestamp,
      Step.Unlock
    );
  }

  function burnAmount(
    address _tokenAddress,
    uint256 _amount,
    uint256 _deadline,
    bytes32 r,
    bytes32 s,
    uint8 v
  ) public onlyAvailable(_tokenAddress, msg.sender, _amount) {

    IWERC20(_tokenAddress).permit(
      msg.sender,
      address(this),
      _amount,
      _deadline,
      v, r, s
    );

    IWERC20(_tokenAddress).burnToken(msg.sender, _amount);

    emit TransferEvent(
      msg.sender,
      address(this),
      _amount,
      block.timestamp,
      Step.Burn
    );
  }

  function mintAmount(address _tokenAddress, uint256 _amount) public {

    IWERC20(_tokenAddress).mintToken(msg.sender, _amount);

    emit TransferEvent(
      address(this),
      msg.sender,
      _amount,
      block.timestamp,
      Step.Mint
    );
  }
}
