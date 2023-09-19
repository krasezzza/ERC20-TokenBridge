// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract WERC20 is Ownable, ERC20, ERC20Permit {

  constructor(
    address _bridgeAddress,
    uint256 _initialAmount,
    string memory _tokenName,
    string memory _tokenSymbol
  ) ERC20(_tokenName, _tokenSymbol) ERC20Permit(_tokenName) {

    mintToken(msg.sender, _initialAmount);
    transferOwnership(_bridgeAddress);
  }

  function mintToken(
    address _to,
    uint256 _amount
  ) public onlyOwner {

    _mint(_to, _amount);
  }

  function burnToken(
    address _from,
    uint256 _amount
  ) public {

    _burn(_from, _amount);
  }

  function permitAction(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public {

    permit(owner, spender, value, deadline, v, r, s);
  }
}
