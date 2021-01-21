require('dotenv').config()
const fs = require('fs-extra');
const statman = require('statman');
const stopwatch = new statman.Stopwatch();
const ethers = require('ethers');
const ethersWrapper = require('./utils/ethersWrapper');
const Contract = require('./utils/Contract');
const Transfer = require('./utils/Transfer');
const crypto = require('./utils/cryptoWrapper');
const tokenArtifact = require('./build/contracts/BasicToken.json');
const agentArtifact = require('./build/contracts/BurnToClaim.json');
const settings = require('./utils/settings.json');
const LogbookModel = require('./utils/models/logbook');
const TimeHelper = require('./utils/TimeHelper');
const delay = require('delay');


(async function () {
  //setup a counter to use synchronous 'x of y' loop. TODO: refactor
  const iCounter = [];
  for (let i = 0; i < settings.iterations; i++) {
    iCounter.push(i);
  }
  
  //-------------- DEPLOY--------------------------------------//
  //----Set deploy flag in utils/settings.json. Don't forget 'npm run compile' before deploying
  let init = await deploy();
  //-----------------------------------------------------------------//



  for (const c of iCounter) {
    const logbook = new LogbookModel();
    logbook.c = c;
    logbook.hasErrors = false;
    logbook.senderNetwork = settings.senderNetwork;
    logbook.recipientNetwork = settings.recipientNetwork;
    const instances = {};
    instances.burnAccount = ethersWrapper.genAccount();
    instances.hashPair = crypto.newSecretHashPair();
    instances.senderToken = new Contract(settings.senderNetwork, settings.sender, settings.token, tokenArtifact);
    instances.senderAgent = new Contract(settings.senderNetwork, settings.sender, settings.agent, agentArtifact); //agent/broker/gateway  
    instances.recipientToken = new Contract(settings.recipientNetwork, settings.sender, settings.token, tokenArtifact);
    instances.recipientAgent = new Contract(settings.recipientNetwork, settings.sender, settings.agent, agentArtifact);
    await instances.senderAgent.timer.init(settings.timeoutSeconds);
    const transfer = new Transfer(settings, instances,logbook,c);

    logbook.preBalances.push(await getEthersBalance(settings.senderNetwork, settings.sender));
    logbook.preBalances.push(await getEthersBalance(settings.recipientNetwork, settings.sender));
    logbook.preBalances.push(await instances.senderToken.balanceOfLog(settings.sender));
    logbook.preBalances.push(await instances.senderToken.balanceOfLog(settings.recipient));
    logbook.preBalances.push(await instances.recipientToken.balanceOfLog(settings.sender));
    logbook.preBalances.push(await instances.recipientToken.balanceOfLog(settings.recipient));


    if (init) {
      console.log('pre-transfer setup (init) transactions:');
      stopwatch.start();
      await transfer.runInitMethods(stopwatch);
      stopwatch.reset();
      //Possible cause of errors in running subesquent sequence could be lag following deployment. Waiting 2 minutes before continuing.
      init = false;
      console.log('sleeping for 120 seconds');
      await delay(120000);
    }
    


    console.log(`sequence iteration ${c}:`);
    // await instances.senderAgent.timer.init(settings.timeoutSeconds);
    stopwatch.start();
    await transfer.runTxs(stopwatch);

    logbook.postBalances.push(await getEthersBalance(settings.senderNetwork, settings.sender));
    logbook.postBalances.push(await getEthersBalance(settings.recipientNetwork, settings.sender));
    logbook.postBalances.push(await instances.senderToken.balanceOfLog(settings.sender));
    logbook.postBalances.push(await instances.senderToken.balanceOfLog(settings.recipient));
    logbook.postBalances.push(await instances.recipientToken.balanceOfLog(settings.sender));
    logbook.postBalances.push(await instances.recipientToken.balanceOfLog(settings.recipient));


    let totalGasUsed = instances.senderToken.gasUsed + instances.senderAgent.gasUsed +  instances.recipientToken.gasUsed +  instances.recipientAgent.gasUsed
    console.log(`Sequence iteration ${c} finished in ${Math.floor(stopwatch.read(0) / 1000)} seconds. Gas used: ${totalGasUsed}`);
    stopwatch.reset();

    logbook.settings = settings;
    logbook.instances = instances;
    fs.writeJSONSync('./utils/logbook.json', logbook);
    fs.writeJSONSync('./utils/settings.json', settings);

    try{
      await require('./utils/sendLogbookToDb')(logbook,c,settings.truncateDb);
    }
    catch{
      console.log('sendLogbookToDb(logbook,i) failed.');
    }
  }

})();




async function deploy() {
  if(!settings.deploy) return false;
  console.log('deploy');
  settings.token.addresses[settings.senderNetwork] = await deployContract(settings.admin, tokenArtifact, settings.senderNetwork, [settings.initialBalance]);
  settings.token.addresses[settings.recipientNetwork] = await deployContract(settings.admin, tokenArtifact, settings.recipientNetwork, [settings.initialBalance]);
  settings.agent.addresses[settings.senderNetwork] = await deployContract(settings.admin, agentArtifact, settings.senderNetwork);
  settings.agent.addresses[settings.recipientNetwork] = await deployContract(settings.admin, agentArtifact, settings.recipientNetwork);
  return true;
}



async function deployContract(msgSender, artifact, network, args = []) {
  console.log('deploying:', { network, args });
  const infura = new ethers.providers.InfuraProvider(network, process.env.INFURA);
  // const default = ethers.getDefaultProvider
  const ganache = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
  this.provider = network === "ganache" ? ganache : infura;
  const privateKey = msgSender.privateKey;
  const wallet = new ethers.Wallet(privateKey, provider);
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const deployment = await factory.deploy(...args);
  const result = await deployment.deployed();
  return result.address;
}



async function getEthersBalance(network, account) {
  const infura = new ethers.providers.InfuraProvider(network, process.env.INFURA);
  const ganache = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
  this.provider = network === "ganache" ? ganache : infura;
  const wallet = new ethers.Wallet(account.privateKey, provider);
  const balance = await wallet.getBalance();
  const ethBalance = ethers.utils.formatEther(balance);
  return {network,contractAddress: '0x0',accountAddress: account.address, accountName: account.name,balance: ethBalance};

 // return `${network} ethers balance for  ${account.name}: ${ethBalance}`;
}


