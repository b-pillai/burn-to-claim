
const Token = artifacts.require("Token");
const SourceChain = artifacts.require("SourceChain");
const DestinationChain = artifacts.require("DestinationChain");
const HashedTimelock = artifacts.require("HashedTimelock");
const HashedTimelockERC20 = artifacts.require("HashedTimelockERC20");
const OZToken = artifacts.require("OZToken");
const OZTokenTimelock = artifacts.require("OZTokenTimelock");


module.exports = async function(deployer) {
  // Deploy Token contract
  await deployer.deploy(Token);
  const _token = await Token.deployed()

  await deployer.deploy(SourceChain, _token.address);
  await deployer.deploy(DestinationChain);
  await deployer.deploy(HashedTimelock);
  await deployer.deploy(HashedTimelockERC20);
  await deployer.deploy(OZToken);
  
  // Transfer all tokens to source Chain contract (1 million)
  const _sourceChain = await SourceChain.deployed();
  await _token.transfer(_sourceChain.address, '1000000000000000000000000')




};
