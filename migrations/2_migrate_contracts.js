const BasicToken = artifacts.require("BasicToken");
const BurnToClaim = artifacts.require("BurnToClaim");

module.exports = function(deployer) {
  var basicToken =  deployer.deploy(BasicToken,100000000);
  var burnToClaim =  deployer.deploy(BurnToClaim);
 var bt = await basicToken.deployed();
};
