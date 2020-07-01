
const OZTokenTimelock = artifacts.require("OZTokenTimelock");
const OZToken = artifacts.require("OZToken");

module.exports = async function(deployer) {
  // Deploy Token contract
  await deployer.deploy(OZToken,1000000 );
  const _ozToken = await OZToken.deployed()
  
  //deploy the Test1 contract
  await deployer.deploy(OZTokenTimelock, _ozToken.address, '0x92b060bdf342b6b6e79BB7dCd8a7E65aa196B7Ff',1593807611);
  
  // Transfer all tokens to source Chain contract (1 million)
  await _ozToken.transfer(OZTokenTimelock.address, 1000000)
};
