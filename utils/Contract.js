
/**
 * Controller class that instantiates a contract via ethers.js
 */
const fs = require('fs-extra');
const statman = require('statman');
const pidusage = require('pidusage');
const si = require('systeminformation');
const ethers = require("ethers");
const TimeHelper = require('./TimeHelper');
class Contract {
	constructor(network, msgSender, contractSettings, artifact) {
		this.network = network;
		this.msgSender = msgSender;
		this.contractSettings = contractSettings;
		this.address = contractSettings.addresses[network];
		const infura = new ethers.providers.InfuraProvider(network, process.env.INFURA);
		const ganache = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
		this.provider = network == "ganache" ? ganache : infura;
		this.wallet = new ethers.Wallet(msgSender.privateKey, this.provider);
		this.ethersContract = new ethers.Contract(this.address, artifact.abi, this.wallet);
		this.timer = new TimeHelper();
		this.transactionId = '';
		this.gasUsed = 0
		this.result = {};
		this.overrides = {
			// The maximum units of gas for the transaction to use
			gasLimit: 200000,
			// The price (in wei) per unit of gas
			gasPrice: ethers.utils.parseUnits('20.0', 'gwei'),
			// The amount to send with the transaction (i.e. msg.value)
			// value: ethers.utils.parseEther('0.05'),
		};
	}

	isValid(preTimeout, timeoutSeconds) {
		let expired = this.timeoutTimer.read() >= timeoutSeconds;
		if (preTimeout && !expired) {
			return true;
		}
		if (!preTimeout && expired) {
			return true;
		}
		return false;
	}

	async balanceOf(address) {
		let balance = await this.ethersContract.balanceOf(address);
		return parseInt(balance);
	}

	async balanceOfLog(account) {
		let balance = await this.balanceOf(account.address);
		return { network: this.network, contractAddress: this.address, accountAddress: account.address, accountName: account.name, balance };
	}

	async run(tx, stopwatch, logbook,c) {
		let { method, args } = tx;
		console.log(method);
		let ethersTx = this.ethersContract[method];
		let gasEstimationHex = await this.provider.estimateGas(ethersTx);
		let gasEstimation = parseInt(gasEstimationHex);
		logbook.txs.push({ method, args, gasEstimation, split: Math.floor(stopwatch.read(0) / 1000) });
		await ethersTx(...args, this.overrides).then(async (signedTx) => {
			logbook.signedTxs.push(signedTx);
			await signedTx.wait().then(async (completedTx) => {
				completedTx.gasUsed.int = parseInt(completedTx.gasUsed._hex);
				let gasUsed = completedTx.gasUsed.int;
				completedTx.cumulativeGasUsed.int = parseInt(completedTx.cumulativeGasUsed._hex);
				let cumulativeGasUsed = completedTx.cumulativeGasUsed.int;
				delete completedTx.logsBloom;
				logbook.completedTxs.push(completedTx);
				let cpu = await pidusage(process.pid);
				logbook.summary.push({c, transactionHash: completedTx.transactionHash, method, gasUsed, cumulativeGasUsed, split: Math.floor(stopwatch.read(0) / 1000),memory:cpu.memory });
				// let sysInfo = await si.cpu();
				this.events = completedTx.events;
				logbook.cpuData.push(cpu);
			})
				.catch(async (completedTxError) => {
					console.log('completedTx error');
					logbook.completedTxErrors.push(completedTxError);
					logbook.hasErrors = true;
					// throw completedTxError;
				})
				.finally(async () => {
				});
		})
			.catch(async (signedTxError) => {
				console.log('signedTx error');
				logbook.signedTxErrors.push(signedTxError);
				logbook.hasErrors = true;
				// throw signedTxError;

			})
			.finally(async () => {
			});
		return this.result;
	}

	async writeToLogbook(logbook) {
	}
}

module.exports = Contract;
