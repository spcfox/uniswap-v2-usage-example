// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(uint256 amount) ERC20("My Token", "MYTKN") {
        _mint(msg.sender, amount);
    }
}
