
const Token = artifacts.require("Token");
const SourceChain = artifacts.require("SourceChain");
const DestinationChain = artifacts.require("DestinationChain");
const TransferController1 = artifacts.require("TransferController1");
const TransferController2 = artifacts.require("TransferController2");

module.exports = async function(deployer) {
  // Deploy Token contract
  await deployer.deploy(Token);
  const _token = await Token.deployed()

// Deploy SourceChain -- the contract takes the token address
  await deployer.deploy(SourceChain, _token.address);
  const _sourceChain = await SourceChain.deployed();

  //deploy the DestinationChain contract
  await deployer.deploy(DestinationChain);

  // Transfer all tokens to source Chain contract (1 million)
  await _token.transfer(_sourceChain.address, '1000000000000000000000000')


// Deploy TransferController1 -- the contract takes the token address
await deployer.deploy(TransferController1, _token.address);
const _transferController1 = await TransferController1.deployed();



// Deploy TransferController1 -- the contract takes the token address
await deployer.deploy(TransferController2, _token.address);
const _transferController2 = await TransferController2.deployed();


};
