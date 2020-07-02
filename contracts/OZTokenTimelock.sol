// contracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
import "./OZToken.sol";

import "@openzeppelin/contracts/token/ERC20/TokenTimelock.sol";

contract OZTokenTimelock is TokenTimelock {
    constructor(IERC20 token, address beneficiary, uint256 releaseTime)
    TokenTimelock(token, beneficiary, releaseTime) public {

        
    }
}