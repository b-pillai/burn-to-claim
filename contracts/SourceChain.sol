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

contract SourceChain {
    //defin the paramaters
    Token public token; // instance of the token contract

    //string secretKey; //Secret code
    //address burnAddress; //Burn address
    //uint timeLock; //time lock

    struct LockContract {
        address sender;
        address receiver;
        uint256 asset;
        bytes32 secretCode;
        uint256 timelock;
        bool withdrawn;
        bool refunded;
        bytes32 preimage;
    }

    enum AssetStatus {_true, _false, _burn}
    AssetStatus assetStatus;
    AssetStatus constant defaultChoice = AssetStatus._true;

    modifier contractExists(bytes32 _contractId) {
        require(haveContract(_contractId), "contractId does not exist");
        _;
    }

    modifier withdrawable(bytes32 _contractId) {
        require(
            contracts[_contractId].receiver == msg.sender,
            "withdrawable: not receiver"
        );
        require(
            contracts[_contractId].withdrawn == false,
            "withdrawable: already withdrawn"
        );
        // if we want to disallow claim to be made after the timeout, uncomment the following line
        // require(contracts[_contractId].timelock > now, "withdrawable: timelock time must be in the future");
        _;
    }
    mapping(bytes32 => LockContract) contracts;

    //events
    //event TokenBurned(address account_from, address address_to, uint unit_token);
    event event_exitTransaction(
        address account_from,
        address address_to,
        uint256 unit_token,
        bytes32 _secretCode,
        uint256 _timelock,
        uint256 _assetStatus
    ); //asset status 'true','false' or 'burn'
    event HTLCERC20Withdraw(bytes32 indexed contractId);
    event HTLCERC20Refund(bytes32 indexed contractId);
    event event_tokensSold(
        address account_from,
        address address_to,
        uint256 unit_token
    );

    // transfer the tokens from token contract
    constructor(Token _token) public {
        token = _token;
    }

    /**
     * @dev Sender sets up the hash timelock burn contract.
     *
     * NOTE: sender must first call the approve() function on the token contract.
     *
     * @param _asset asset to be burned.
     * @param _burnAddress Burn Address.
     * @param _secretCode A sha-2 sha256 hash hashlock.
     * @param _timelock UNIX epoch seconds time that the lock expires at.
     *        Reclaim can be made after this time.
     *
     * @return Tx_receipt - Transaction receipt.
     *
     */
    function exitTransaction(
        uint256 _asset,
        address _burnAddress,
        bytes32 _secretCode,
        uint256 _timelock
    ) external payable returns (bytes32 contractId) {
        
        // check the requirements
        require(_asset > 0, "asset amount must be > 0");
        require(_timelock > now, "timelock time must be in the future");
        
        //Generate a Transaction ID
        contractId = sha256(
            abi.encodePacked(
                msg.sender,
                _burnAddress,
                _asset,
                _secretCode,
                _timelock
            )
        );

        // Reject if that Transaction ID already exists
        if (haveContract(contractId)) revert("Transaction already exists");

        // burn function using openzeppelin library - check this out later....
        // https://medium.com/crowdbotics/how-to-create-a-burnable-token-with-solidity-and-openzeppelin-library-38bd3249d0c7
        // function burn(uint256 _value) public {
        //  _burn(msg.sender, _value);
        //}

        // Burn the token to burn address
        if (!token.transferFrom(msg.sender, _burnAddress, _asset))
            revert("transferFrom sender to this failed");

        assetStatus = AssetStatus._burn;

        // Update the Transaction data
        contracts[contractId] = LockContract(
            msg.sender,
            _burnAddress,
            _asset,
            _secretCode,
            _timelock,
            false, //withdrawn
            false, //refunded
            0x0
        );

        //transaction event
        emit event_exitTransaction(
            msg.sender,
            _burnAddress,
            _asset,
            _secretCode,
            _timelock,
            getValue()
        );
    }

    /**
     * @dev Called by the receiver once they know the preimage of the hashlock.
     * This will transfer ownership of the locked tokens to their address.
     *
     * @param _contractId Id of the HTLC.
     * @param _preimage sha256(_preimage) should equal the contract hashlock.
     * @return bool true on success
     */
    function entryTransaction(bytes32 _contractId, bytes32 _preimage)
        external
        payable
        returns (bool)
    {
        // check the requirements
        require(haveContract(_contractId), "contractId does not exist");
        require(
            contracts[_contractId].secretCode == sha256(abi.encodePacked(_preimage)),
            "hashlock hash does not match"
        );
        require(
            contracts[_contractId].receiver == msg.sender,
            "withdrawable: not receiver"
        );
        require(
            contracts[_contractId].withdrawn == false,
            "withdrawable: already withdrawn"
        );
        require(
            contracts[_contractId].timelock > now,
            "withdrawable: timelock time must be in the future"
        );

        // get the transaction data
        LockContract storage c = contracts[_contractId];
        c.preimage = _preimage;
        c.withdrawn = true;
        token.transfer(msg.sender, c.asset);
        emit HTLCERC20Withdraw(_contractId);
        return true;
    }


    /**
     * @dev Called by the receiver once they know the preimage of the hashlock.
     * This will transfer ownership of the locked tokens to their address.
     *
     * @param _contractId Id of the HTLC.
     * @param _preimage sha256(_preimage) should equal the contract hashlock.
     * @return bool true on success
     */
    function reclaimTransaction(bytes32 _contractId, bytes32 _preimage)
        external
        payable
        returns (bool)
    {
        // check the requirements
        require(haveContract(_contractId), "contractId does not exist");
        require(
            contracts[_contractId].secretCode == sha256(abi.encodePacked(_preimage)),
            "hashlock hash does not match"
        );
        require(
            contracts[_contractId].receiver == msg.sender,
            "withdrawable: not receiver"
        );
        require(
            contracts[_contractId].withdrawn == false,
            "withdrawable: already withdrawn"
        );
        require(
            contracts[_contractId].timelock > now,
            "withdrawable: timelock time must be in the future"
        );

        // get the transaction data
        LockContract storage c = contracts[_contractId];
        c.preimage = _preimage;
        c.withdrawn = true;
        token.transfer(msg.sender, c.asset);
        emit HTLCERC20Withdraw(_contractId);
        return true;
    }


    function exportVerifier() public pure returns (bool results) {
        //if (spendVerifier() and assetVerifier()) is true
        //return true
        //else
        return true;
    }

    function spendVerifier() public pure returns (bool results) {
        //check the signature
        // chck the address is generted from the given public key
        return true;
    }

    function assetVerifier() public pure returns (bool results) {
        //check the asset validity
        return true;
    }

  
    function reclaimVerifier() public pure returns (bool results) {
        // if (spendVerifier() and proofVerifier()) is true then
        return true;
    }

    function proofVerifier() public pure returns (bool results) {
        return true;
    }

    function getValue() internal view returns (uint256) {
        return uint256(assetStatus);
    }

    // sendre buy a Token form the contract
    function buyTokens() public payable {
        uint256 tokenAmount = msg.value;
        // Require that contract has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount);
        // Transfer tokens to the user
        token.transfer(msg.sender, tokenAmount);
        //token purchin event
        emit event_tokensSold(msg.sender, address(token), tokenAmount);
    }

    /**
     * @dev Is there a contract with id _contractId.
     * @param _contractId Id into contracts mapping.
     */
    function haveContract(bytes32 _contractId)
        internal
        view
        returns (bool exists)
    {
        exists = (contracts[_contractId].sender != address(0));
    }
}
