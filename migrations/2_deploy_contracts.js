
const Token = artifacts.require("Token");
const SourceChain = artifacts.require("SourceChain");
const DestinationChain = artifacts.require("DestinationChain");
const TransferController1 = artifacts.require("TransferController1");
const TransferController2 = artifacts.require("TransferController2");

module.exports = async function(deployer) {
  // Deploy Token contract
  await deployer.deploy(OZToken,1000000 );
  const _ozToken = await OZToken.deployed()
  
  //deploy the Test1 contract
  await deployer.deploy(OZTokenTimelock, _ozToken.address, '0x92b060bdf342b6b6e79BB7dCd8a7E65aa196B7Ff',1593807611);
  
  // Transfer all tokens to source Chain contract (1 million)
  await _token.transfer(_sourceChain.address, '1000000000000000000000000')


// Deploy TransferController1 -- the contract takes the token address
await deployer.deploy(TransferController1, _token.address);
const _transferController1 = await TransferController1.deployed();



// Deploy TransferController1 -- the contract takes the token address
await deployer.deploy(TransferController2, _token.address);
const _transferController2 = await TransferController2.deployed();


};
