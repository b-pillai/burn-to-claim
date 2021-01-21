// contracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * A basic token for testing the HashedTimelockERC20.
 */
contract BobERC20 is ERC20("Bob Token","Bob Token" ) {


    constructor(uint256 _initialBalance) public {
        _mint(msg.sender, _initialBalance);
    }
}
