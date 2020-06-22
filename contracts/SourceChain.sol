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
event TokenPurchased(address account, address token, uint amount);
event TokensSold(address account,address token,uint amount);

// transfer the tokens from token contract
constructor (Token _token) public {
    token = _token;
}

// main function
function exitTransaction() external {
    // if exportVerifier() is true
    //transfer the asset to a burn address
    //lock the asset/transaction  output
    //add a hash value of scret key to the transaction  
}

function exportVerifier() public pure returns (bool results){
//if (spendVerifier() and assetVerifier()) is true
//return true
//else
return true;
}

function spendVerifier() public pure returns (bool results){
//check the signature
return true;
}

function assetVerifier() public  pure returns (bool results){
//check the asset validity
return true;
}

// working code...
function buyTokens() public payable{
    
    uint tokenAmount = msg.value;

    // Require that contract has enough tokens
    require(token.balanceOf(address(this)) >= tokenAmount);

    // Transfer tokens to the user
    token.transfer(msg.sender, tokenAmount);

    //token purchin event
    emit TokenPurchased(msg.sender,address(token),tokenAmount);
}
// working code...
function sellTokens(uint _amount) public {
    // User can't sell more tokens than they have
    require(token.balanceOf(msg.sender) >= _amount);

     // Perform sale
    token.transferFrom(msg.sender, address(this), _amount);
    msg.sender.transfer(_amount);

    // Emit an event
    emit TokensSold(msg.sender, address(token), _amount);
}

}