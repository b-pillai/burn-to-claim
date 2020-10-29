pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/ERC20.sol";

contract BurnToClaim {
    event exitTransactionEvent(
        bytes32 indexed transactionId,
        address indexed sender,
        address indexed receiver,
        address tokenContract,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock
    );

    event entryTransactionEvent(bytes32 indexed transactionId);

    event reclaimTransactionEvent(bytes32 indexed transactionId);

    struct BurnTokenData {
        address sender;
        address receiver;
        address tokenContract;
        uint256 amount;
        bytes32 hashlock;
        uint256 timelock;
        bool withdrawn;
        bool refunded;
        bytes32 preimage;
    }

    mapping(bytes32 => BurnTokenData) burnTokenData;

    struct CrosschainAddress {
        address contractAddress;
        bool isExit;
    }

    mapping(address => CrosschainAddress) crosschainAddress;

    mapping(bytes32 => bytes32) transactionIds;

    event requireMockEvent(string  message);

    event revertMockEvent(string  message);

    function requireMock(bool result, string memory message) public {
        if(result == false){
            emit requireMockEvent(message);
        }
    }

    function registerContract(address contractAddress) external {
        requireMock(
            contractAddress != address(0),
            "contract address must not be zero address"
        );

        crosschainAddress[contractAddress] = CrosschainAddress(
            contractAddress,
            true
        );
    }

    function getTransactionId(bytes32 _hashlock) public view returns (bytes32 txId) {
        txId = transactionIds[_hashlock];
        return txId;
    }

    function getNumber(int _number) public view returns (int val) {
            val = _number * 2;
            return val;
        }



function exitTransaction(
        address _burnAddress,
        bytes32 _hashlock,
        uint256 _timelock,
        address _tokenContract,
        uint256 _amount
    ) external returns (bytes32 transactionId) {
        uint timeNow = now;
        requireMock(_amount > 0, "token amount must be > 0");
        requireMock(
            ERC20(_tokenContract).allowance(msg.sender, address(this)) >=
                _amount,
            "token allowance must be >= amount"
        );
        
        requireMock(_timelock > timeNow, "timelock time must be in the future");

        transactionId = sha256(
            abi.encodePacked(
                msg.sender,
                _burnAddress,
                _tokenContract,
                _amount,
                _hashlock,
                _timelock
            )
        );

        transactionIds[_hashlock] = transactionId;

        if (haveContract(transactionId)) revert("Contract already exists");

        if (
            !ERC20(_tokenContract).transferFrom(
                msg.sender,
                _burnAddress,
                _amount
            )
        ) revert("transferFrom sender to this failed");
        

        // burnTokenData[transactionId] = BurnTokenData(
        //     msg.sender,
        //     _burnAddress,
        //     _tokenContract,
        //     _amount,
        //     _hashlock,
        //     _timelock,
        //     false,
        //     false,
        //     0x0
        // );

        emit exitTransactionEvent(
            transactionId,
            msg.sender,
            _burnAddress,
            _tokenContract,
            _amount,
            _hashlock,
            now
        );
        
    }

    function add(
        address _crosschainContractAddress,
        bytes32 _transactionId,
        address _burnAddress,
        bytes32 _hashlock,
        uint256 _timelock,
        address _tokenContract, // base token contract
        uint256 _amount
    ) external {
        requireMock(
            crosschainAddress[_crosschainContractAddress].isExit,
            "Add corssChain data contract address not exit"
        );
        burnTokenData[_transactionId] = BurnTokenData(
            msg.sender,
            _burnAddress,
            _tokenContract,
            _amount,
            _hashlock,
            _timelock,
            false,
            false,
            0x0
        );
    }

    function entryTransaction(
        uint256 _amount,
        address _receiver,
        bytes32 _transactionId,
        address _tokenContract,
        bytes32 _preimage
    ) external returns (bool) {

        // requireMock(haveContract(_transactionId), "transactionId does not exist");
        // requireMock(
        //     burnTokenData[_transactionId].hashlock ==
        //         sha256(abi.encodePacked(_preimage)),
        //     "hashlock hash does not match"
        // );
        // requireMock(
        //     burnTokenData[_transactionId].withdrawn == false,
        //     "withdrawable: already withdrawn"
        // );
        // requireMock(
        //     burnTokenData[_transactionId].timelock > now,
        //     "withdrawable: timelock time must be in the future"
        // );

        // BurnTokenData storage c = burnTokenData[_transactionId];
        // c.preimage = _preimage;
        // c.withdrawn = true;

        if (!ERC20(_tokenContract).transfer(_receiver, _amount)){
            revert("transferFrom sender to this failed");
        }
        else{

        emit entryTransactionEvent(_transactionId);
        }
        return true;
    }

    function update(
        address _crosschainContractAddress,
        bytes32 _transactionId,
        bytes32 _preimage
    ) external {
        requireMock(
            crosschainAddress[_crosschainContractAddress].isExit,
            "Update corssChain data contract address not exit"
        );
        BurnTokenData storage c = burnTokenData[_transactionId];
        c.preimage = _preimage;
        c.withdrawn = true;
    }

    function reclaimTransaction(bytes32 _transactionId)
        external
        returns (bool)
    {
        requireMock(haveContract(_transactionId), "transactionId does not exist");
        requireMock(
            burnTokenData[_transactionId].sender == msg.sender,
            "refundable: not sender"
        );
        requireMock(
            burnTokenData[_transactionId].refunded == false,
            "refundable: already refunded"
        );
        requireMock(
            burnTokenData[_transactionId].withdrawn == false,
            "refundable: already withdrawn"
        );
        requireMock(
            burnTokenData[_transactionId].timelock <= now,
            "refundable: timelock not yet passed"
        );

        BurnTokenData storage c = burnTokenData[_transactionId];
        c.refunded = true;
        if (!ERC20(c.tokenContract).transfer(c.sender, c.amount))
            revert("transferFrom sender to this failed");
        emit reclaimTransactionEvent(_transactionId);
        return true;
    }

    function reclaimTransaction1(bytes32 _transactionId)
        external
        returns (bool)
    {
        requireMock(haveContract(_transactionId), "transactionId does not exist");
        requireMock(
            burnTokenData[_transactionId].sender == msg.sender,
            "refundable: not sender"
        );
        requireMock(
            burnTokenData[_transactionId].refunded == false,
            "refundable: already refunded"
        );
        requireMock(
            burnTokenData[_transactionId].withdrawn == false,
            "refundable: already withdrawn"
        );
        //   requireMock(
        //     burnTokenData[_transactionId].timelock <= now,
        //      "refundable: timelock not yet passed"
        //);

        BurnTokenData storage c = burnTokenData[_transactionId];
        c.refunded = true;
        if (!ERC20(c.tokenContract).transfer(c.sender, c.amount))
            revert("transferFrom sender to this failed");
        emit reclaimTransactionEvent(_transactionId);
        return true;
    }

    function btcTransfer(
        address _tokenContract,
        address _recipient,
        uint256 _amount
    ) external {
        if (!ERC20(_tokenContract).transfer(_recipient, _amount))
            revert("transferFrom sender to this failed");
    }

    function btcTransferFrom(
        address _tokenContract,
        address _sender,
        address _recipient,
        uint256 _amount
    ) external {
        if (!ERC20(_tokenContract).transferFrom(_sender, _recipient, _amount))
            revert("transferFrom sender to this failed");
    }

    function getContract(bytes32 _transactionId)
        public
        view
        returns (
            address sender,
            address receiver,
            address tokenContract,
            uint256 amount,
            bytes32 hashlock,
            uint256 timelock,
            bool withdrawn,
            bool refunded,
            bytes32 preimage
        )
    {
        if (haveContract(_transactionId) == false)
            return (
                address(0),
                address(0),
                address(0),
                0,
                0,
                0,
                false,
                false,
                0
            );
        BurnTokenData storage c = burnTokenData[_transactionId];
        return (
            c.sender,
            c.receiver,
            c.tokenContract,
            c.amount,
            c.hashlock,
            c.timelock,
            c.withdrawn,
            c.refunded,
            c.preimage
        );
    }

    function haveContract(bytes32 _transactionId)
        internal
        view
        returns (bool exists)
    {
        exists = (burnTokenData[_transactionId].sender != address(0));
    }
}
