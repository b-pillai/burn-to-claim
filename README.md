# The Burn-to-Claim cross-Blockchain asset transfer protocols
Burn-to-Claim is a cross-blockchain protocol aim to transfer digital crypto asset between networks of blockchains in a distributed manner. The design is to transfer assets from one blockchain network to another in a way that it is being burned (destroyed) from one blockchain network and re-created on the other blockchain network.
This protocol consists of two main functions: an exitTransaction to generate a self-verifiable transfer-proof that the asset is burned on the source network and an entryTransaction to verify the validity of transfer-proof and to re-create the asset in the destination network.

## exitTransaction()
The exitTransaction initiated on the source network by the sender dose the following:-
- Check the transaction's validity - checks the authenticity of the asset and the owner's ability to spend.
- Generate the transfer-proof - a proof that the asset exists and it is locked while the asset is in transit. 
## entryTrasnaction()
The entry-transaction is in the destination chain and initiated by the recipient. Upon presenting the transfer-proof, the destination network nodes verify the validity and correctness of the transfer-proof and execute the exchange. We assume that the recipient’s network nodes can validate the transfer-proof through an intermediary middleware mechanism.

### Overview of the Included Smart Contracts in this project

<li><code>BurnToClaim.sol</code> is the main contract of the cross-blockchain protocol.</li>
<li><code>BaseicToken.sol</code> is an interface of the ERC20 standard for Ethereum tokens.</li>

## A high level overview of the Burn-to-Claim protocol workflow

---![](/images/graphicalAbstract.png?raw=true)

## Notations used
<img src="./images/notations.png">


# Prerequisites
You need to install the following tools/packages:

* [Node](https://nodejs.org/en/)
* [Ganache](https://www.trufflesuite.com/ganache) 
* [Tuffle](https://www.trufflesuite.com) 

## Required Accounts
- [infura.io](https://infura.io/)
- [Mongodb Atlas](https://cloud.mongodb.com/)^
  
## Required Software / Global Installs
- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [Truffle](https://www.trufflesuite.com/)
- [Waffle](https://ethereum-waffle.readthedocs.io/en/latest/index.html#)
- [Mongodb](https://docs.mongodb.com/manual/installation/)^

^The app can be run without mongodb but only the latest log result will be retained.

This is a node.js console application running ethers.js. [dotenv](https://www.npmjs.com/package/dotenv) is used to store keys and connection strings.

# Installation

## To download:
- Download via zip file / git clone / github desktop
- create a file in same folder as 'package.json' called '.env'
- Add the following lines to the .env file:  
  -  `CN_STRING = mongodb+srv://<user>:<password>@<project>.mongodb.net/<database>?retryWrites=true&w=majority`
  -  `INFURA = <keyfrominfuraaccount>`
- run 'npm install' to install all local packages.
- run 'npm start' to start the application.
  

## Compiling
The source contracts are located in `contracts`.
They can be compiled using either Truffle or Waffle.
- 'truffle compile'


## Settings
Settings can be found in `utils/settings.json`. Some of the settings include:
- **deploy**: Token and contract will be (re)deployed on the first run (transfer).
- **iterations**: The number of transfers to complete
- **sendLogbookToDb**: If Mongodb is connected, set this to true
- **tokenAmount**: The amount to transfer
- **initialBalance**: On deployment, the intial amount for of tokens


## Video Tutorial
Available on [Youtube](https://youtu.be/VhIfeQ-fgJ0)
  
