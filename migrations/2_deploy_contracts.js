
const Token = artifacts.require("Token");
const SourceChain = artifacts.require("SourceChain");
const DestinationChain = artifacts.require("DestinationChain");

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
};
