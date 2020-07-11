pragma solidity >=0.4.22 <0.7.0;

//impiort the token contract
import "./Token.sol";

/**
@title Source Chain Contract.
This contract provide a way to generate an exit proof. 
Protocol:
1) exitTransaction (asset, burnaddress, hashlock, timelock)
    A sender calls this to burn his asset to a burn address which creatas
    an transfer proof for a given asset, and returneds a 32 byte transaction recept.
    - Transaction is timelocked for a given time.
    - A preimage of a secret code hash is added.
2) reclaimTransaction ()
    After timelock has expired and if the receiver did not withdraw the asset
    the sender can get their asset back with this function.

*/

contract TransferController2 {

//defin the paramaters
Token public token; // instance of the token contract

//string secretKey; //Secret code
//address burnAddress; //Burn address
//uint timeLock; //time lock

struct LockAssetData {
        address sender;
        address burnAddress;
        uint256 asset;
        bytes32 secretCode;
        uint256 timelock;
    }

enum AssetStatus {_true, _false, _burn}
AssetStatus assetStatus;
AssetStatus constant defaultChoice = AssetStatus._true;

 modifier futureTimelock(uint256 _time) {
    // timelock time starts after theis blocktime (now).
    require(_time > now, "timelock time must be in the future");
    _; }

mapping (bytes32 => LockAssetData) lockedData;

//events
//event TokenBurned(address account_from, address address_to, uint unit_token);
event event_exitTransaction(address account_from, address address_to, uint unit_token, bytes32 _secretCode, uint256 _timelock);
event event_tokensSold(address account_from, address address_to, uint unit_token);

// transfer the tokens from token contract
constructor (Token _token) public {
    token = _token;
}
 
/**
@dev Sender sets up the hash time lock burn contract.
NOTE: sender must first call the approve() function on the token contract.
@param _burnAddress Burn Address.
@param _secretCode A sha-2 sha256 hash hashlock.
@param _timelock UNIX epoch seconds time that the lock expires at.
        Reclaim can be made after this time.
@param _asset asset to be burned.
@return contractId Id of the new HTLC. This is needed for subsequent calls.
*/

function exitTransaction(uint _asset, address _burnAddress, bytes32 _secretCode, uint256 _timelock)
external payable futureTimelock(_timelock) returns (bytes32 Tx_receipt) {

Tx_receipt = sha256(abi.encodePacked (msg.sender, _burnAddress, _asset, _secretCode, _timelock));

// Reject if a Transaction already exists
if (haveTransaction(Tx_receipt)) revert("Transaction already exists");

// burn the token to burn address
if (!token.transferFrom(msg.sender, _burnAddress, _asset)) revert("transferFrom sender to this failed");

assetStatus = AssetStatus._false;

// time lock data
lockedData[Tx_receipt] = LockAssetData(msg.sender, _burnAddress, _asset, _secretCode, _timelock);

//transaction event
emit event_exitTransaction(msg.sender, _burnAddress, _asset, _secretCode, _timelock);

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

// sendre buy a Token form the contract
function buyTokens() public payable{
    uint tokenAmount = msg.value;
    // Require that contract has enough tokens
    require(token.balanceOf(address(this)) >= tokenAmount);
   // Transfer tokens to the user
    token.transfer(msg.sender, tokenAmount);
    //token purchin event
    emit event_tokensSold(msg.sender,address(token),tokenAmount);
}
/**
     * @dev Is there a contract with id _contractId.
     * @param _Tx_receipt Id into contracts mapping.
     */
    function haveTransaction(bytes32 _Tx_receipt)  internal view  returns (bool exists)  {
        exists = (lockedData[_Tx_receipt].sender != address(0));
    }



}

