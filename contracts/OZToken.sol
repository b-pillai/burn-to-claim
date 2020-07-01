pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OZToken is ERC20 {
    constructor(uint256 initialSupply) public ERC20("OZToken", "OZT") {
        _mint(msg.sender, initialSupply);
    }
}