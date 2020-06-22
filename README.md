# The Burn-to-Claim cross-Blockchain asset transfer protocols
The Burn-to-Claim project aim to address cross-Blockchain asset transfer. We define it as a protocol which consists of two components: an exitTransaction to generate a selfverifiable proof that the transaction is committed in the source
network and an entryTransaction to verify the validity of the proof in order to re-create the asset in the destination
network.

## exitTransaction

The exit-transaction must be initiated on the source network by the sender. This execution checks the validity of the transaction and generates a transfer-proof.

### SourceChain.sol 

We defin the sourceChain.sol in the source netwetork.

check the transaction-validity - checks the authenticity of the asset and the owner's ability to spend.
generate the transfer-proof - a proof that the asset exists and it is locked while the asset is in transit.

This transaction aims to create an exit proof for that asset in the source blockchain network. 

## entryTrasnaction



Our cross-chain protocol has three stages: prepare, commit and execute.
1. At the prepare stage, the users agree and establish the transfer parameters. We assume this process occurs out-of-band through a secure channel.
- the screat key

2. At the commit stage, the source network generates a conditional time-locked and publicly verifiable transfer-proof. We define this transfer-proof to be a committed cross-chain transaction. The conditional time-lock means that the transaction output is time-locked in the source network while the transaction is in transit.

3. Finally, at the execute stage, upon presenting the transfer-proof, the destination network nodes verify the validity and correctness of the transfer-proof and execute the exchange. We assume that the recipient's network nodes can validate the transfer-proof through an intermediary middleware mechanism. The recipient can claim the transaction if it is within the conditional time-bound and the transfer-proof has been validated. In case of an unsuccessful transaction, after the expiry of time-bound, the sender is able to reclaim the asset.

# Token Contract
This is typical ERC20 token contract. 
The token contract will transfer ERC20 token to the Source chain contract during the deployment.
we will be suing the transfer function from token contract to transfer token berween accounts.

# SourceChain Contract

# Destination Chian Contract


## Installation

### Prerequisites
You need to install the following tools/packages:

* [Node](https://nodejs.org/en/)
* [Ganache](https://www.trufflesuite.com/ganache) 
* [Tuffle] (https://www.trufflesuite.com) 

### Deployment
1. Clone the repository: `git clone ---urls---`
2. Install all dependencies: `npm install`
3. Start Ganache: `Ganache-cli
3. Deploy contracts: `truffle migrate
4. Run the test: `truffle test


git remote add origin https://github.com/b-pillai/burn-to-claim.git
git push -u origin master


## Testing
Test 1 - Contract deployed
Token contract
Source chain
Destination chain

Test 2 - contract balance
Source chian has the balance