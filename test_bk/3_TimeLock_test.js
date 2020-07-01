/* 
//import the smart contract
const Token = artifacts.require('Token')
const SourceChain = artifacts.require('SourceChain')
const DestinationChain = artifacts.require('DestinationChain')

const {
    bufToStr,
    getBalance,
    htlcArrayToObj,
    isSha256Hash,
    newSecretHashPair,
    nowSeconds,
    random32,
    txContractId,
    txGas,
    txLoggedArgs,
  } = require('./helper/utils')
const { assert } = require('console')
  
// helper to convert the token to wei 
function tokens(n) {
    return web3.utils.toWei(n, 'ether');
  }

const hourSeconds = 3600
const timeLock1Hour = nowSeconds() + hourSeconds

  //begin the test 
  contract('HashedTimelock', accounts => {
    let result
    const deployer= accounts[1]
    const sender = accounts[2]
    const burnaddress = accounts[3]
 //   const receiver = accounts[4]
    describe('extiTransaction() time lock the asset', async () => {
        const _sourceChain = await SourceChain.deployed()
      //  result = await _sourceChain.newContract( receiver, hashPair.hash, timeLock1Hour, { from: sender, value: oneFinney, })
        result = await _sourceChain.exitTransaction(tokens('1'), burnaddress, hashPair.hash, timeLock1Hour, { from: senter })
    })
    it('The user has transferd the token to a burn address', async () => {
        const hashPair = newSecretHashPair()
        // Check investor token balance after purchase

          // Check logs to ensure event was emitted with correct data
        const event = result.logs[1].args
        assert.equal(event.account_from, senter)
        assert.equal(event.address_to, burnaddress)
        assert.equal(event.unit_token.toString(), tokens('1').toString())
        assert.equal(event._hashlock, hashPair.hash)
        assert.equal(event._timelock, timeLock1Hour)
        })
  })
  
 */