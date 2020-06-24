pragma solidity >=0.4.22 <0.7.0;

//impiort the token contract
import "./Token.sol";

contract SourceChain {

//defin the paramaters
Token public token; // instance of the token contract
string secretKey; //Secret Key
address burnAddress; //Burn address
uint timeLock; //time lock

//events
event TokenBurned(address account_from, address address_to, uint unit_token);
event TokensSold(address account_from, address address_to, uint unit_token);

// transfer the tokens from token contract
constructor (Token _token) public {
    token = _token;
}

// main function
function exitTransaction(uint _amount, address _burnaddress) external payable {
// if exportVerifier() is true
// burn the token to burn address
token.transferFrom(msg.sender, _burnaddress, _amount);
//token burned event
emit TokenBurned(msg.sender, _burnaddress, _amount);
// lock the asset/transaction output
// add a hash value of scret key to the transaction

}

function exportVerifier() public pure returns (bool results){
//if (spendVerifier() and assetVerifier()) is true
//return true
//else
return true;
}

function spendVerifier() public pure returns (bool results){
//check the signature
// chck the address is generted from the given public key

return true;
}

function assetVerifier() public pure returns (bool results){
//check the asset validity
return true;
}

// this function is to reclaim the asset
// as per the algorithm 6

function reclaimTransaction() external{
//if reclaimVerifier() return true;
// check the time lock period
// require(now >= timeLock);
// check the secret key
// reclaim the token
// token.transfer(to_address, _amount);
}

function reclaimVerifier() public pure returns (bool results){
  // if (spendVerifier() and proofVerifier()) is true then
    return true;
}

function proofVerifier() public pure returns (bool results){
return true;
}

// working and testing code...
function buyTokens() public payable{
    uint tokenAmount = msg.value;
    // Require that contract has enough tokens
    require(token.balanceOf(address(this)) >= tokenAmount);
   // Transfer tokens to the user
    token.transfer(msg.sender, tokenAmount);
    //token purchin event
    emit TokensSold(msg.sender,address(token),tokenAmount);
}
}

