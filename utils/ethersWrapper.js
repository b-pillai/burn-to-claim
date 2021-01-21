/**
 * See https://docs.ethers.io/ethers.js/v5-beta/#
 */

var ethers = require("ethers");
var ethersWrapper = {}

ethersWrapper.genAddress = () => {
	let burnAccount = ethers.Wallet.createRandom();
	let ba = burnAccount;
	let burnAddress = ba.address;
	return burnAddress;
}

ethersWrapper.genAccount = () => {
	let burnAccount = ethers.Wallet.createRandom();
	return burnAccount;
}


module.exports = ethersWrapper;