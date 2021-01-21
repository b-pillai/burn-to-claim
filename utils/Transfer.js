const statman = require('statman');
const TimeHelper = require('./TimeHelper');
class Transfer {
  constructor(settings, instances, logbook,c) {
    this.settings = settings;
    this.instances = instances;
    this.logbook = logbook;
    this.c = c;
    this.timestamp = TimeHelper.YYYYMMDDHHmmss();
    this.senderNetwork = settings.senderNetwork;
    this.recipientNetwork = settings.senderNetwork;
    this.senderAddress = settings.sender.address;
    this.burnAddress = instances.burnAccount.address;
    this.recipientAddress = settings.recipient.address;
    this.amount = settings.tokenAmount;
    this.transactionId = '';
    this.creationUtc = instances.senderAgent.creationTime;
    this.expired = false;
    this.seedInits(settings, instances);
    this.seedTxs(settings, instances);

    //this.instances.senderAgent.ethersContract.on('exitTransactionEvent',this.handleExitTx);
  }

// async handleExitTx(transactionId,sender,receiver,tokenContract,amount,hashlock,timelock,event){
//   console.log('handleExitTx',transactionId);
// }


  async runInitMethods(stopwatch) {
    for (const tx of this.inits) {
      let instance = this.instances[tx.instance]
      await instance.run(tx, stopwatch, this.logbook,this.c);

    }
  }

  async runTxs(stopwatch) {
    let i = 0;
    for (const iterator of this.txs) {     
      let tx = this.txs[i]; 
      let instance = this.instances[tx.instance];
      if (this.checkTimeout(tx)) {
        await instance.run(tx, stopwatch, this.logbook,this.c);
        if (tx.method === 'exitTransaction') {
          this.timeoutTimer = new statman.Stopwatch();
          // instance.ethersContract.on('exitTransactionEvent',(args) => {
          //   console.log(args.transactionId);
          // } )
          this.settings.transactionId = instance.events[instance.events.length - 1].args.transactionId;
          this.seedTxs();
        }
      }
      i++;
    }
  }


  checkTimeout(tx) {
    if(!this.timeoutTimer){
      return true;
    }
    let timeSplit = Math.floor(this.timeoutTimer.read(0) / 1000)
    let expired = timeSplit >= this.settings.timeoutSeconds;
    if (tx.preTimeout && !expired) {
      return true;
    }
    if (!tx.preTimeout && expired) {
      return true;
    }
    return false;
  }


  seedTxs() {
    let settings = this.settings;
    let instances = this.instances;

    this.txs = [
      {
        preTimeout: true,
        instance: 'senderToken',
        method: 'approve',
        args: [
          instances.senderAgent.address,
          settings.tokenAmount
        ],
      },
      {
        preTimeout: true,
        instance: 'senderAgent',
        method: 'exitTransaction',
        args: [
          instances.burnAccount.address,
          instances.hashPair.hash,
          instances.senderAgent.timer.periodEndSeconds,
          instances.senderToken.address,
          settings.tokenAmount

        ],
      },
      {
        preTimeout: false,
        instance: 'senderAgent',
        method: 'reclaimTransaction',
        args: [
          settings.transactionId
        ],
      },
      {
        preTimeout: true,
        instance: 'recipientAgent',
        method: 'add',
        args: [
          instances.senderAgent.address,
          settings.transactionId,
          instances.burnAccount.address,
          instances.hashPair.hash,
          instances.senderAgent.timer.periodEndSeconds,
          instances.recipientToken.address,
          settings.tokenAmount

        ],
      },
      {
        preTimeout: true,
        instance: 'recipientAgent',
        method: 'entryTransaction',
        args: [
          settings.tokenAmount,
          settings.recipient.address,
          settings.transactionId,
          instances.hashPair.secret

        ],
      },
      {
        preTimeout: true,
        instance: 'senderAgent',
        method: 'update',
        args: [
          instances.recipientAgent.address,
          settings.transactionId,
          instances.hashPair.secret,
        ],
      },
    ]
  }
  
  seedInits() {
    let settings = this.settings;
    let instances = this.instances;

    this.inits = [
      {
        instance: 'senderAgent',
        method: 'registerContract',
        args: [
          instances.recipientAgent.address
        ],
      },
      {
        instance: 'recipientAgent',
        method: 'registerContract',
        args: [
          instances.senderAgent.address
        ],
      },
      {
        instance: 'senderToken',
        method: 'transfer',
        args: [
          instances.senderAgent.address,
          1000
        ],
      },
      {
        instance: 'recipientToken',
        method: 'transfer',
        args: [
          instances.recipientAgent.address,
          1000
        ],
      },

    ];
  }
}

module.exports = Transfer;