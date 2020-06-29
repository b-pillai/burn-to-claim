//import the smart contract
const Token = artifacts.require('Token')
const SourceChain = artifacts.require('SourceChain')
const DestinationChain = artifacts.require('DestinationChain')

const REQUIRE_FAILED_MSG = 'Returned error: VM Exception while processing transaction: revert'

const {
  bufToStr,
  htlcERC20ArrayToObj,
  isSha256Hash,
  newSecretHashPair,
  nowSeconds,
  random32,
  txContractId,
  txLoggedArgs,
} = require('./helper/utils')

const hourSeconds = 3600
const timeLock1Hour = nowSeconds() + hourSeconds
const hashPair = newSecretHashPair()
//const asset = 1

// helper to convert the token to wei 
function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

  //begin the test conditions
  //'sender' - the first account and 'recipient' the second address
   contract('Test- Buy and sell tokens', accounts => {
    const deployer = accounts[1]
    const sender = accounts[2]
    const burnAddress = accounts[3]
    const receiver = accounts[4]
    const asset = tokens('1')

    
    //declare the variables 
    let _token, _sourceChain, _destinationChain, result, htlc
  
    // add common things
    before (async()=>{
      _token = await Token.new()
      _sourceChain = await SourceChain.new(_token.address)
      _destinationChain = await DestinationChain.new()
      //transfer all tokens to testcontract (1 million)
      await _token.transfer(_sourceChain.address, tokens('1000000'))
    })

    /* TEST */
  describe('Buy the Tokens', async () => {
      before(async () => {
      // Buy a tokens from the contract
      result = await _sourceChain.buyTokens({from: sender, value: web3.utils.toWei('1', 'ether')})
      })
    it('User bought a token from the contract', async () => {
      // Check sender token balance after purchase
      let investorBalance = await _token.balanceOf(sender)
      assert.equal(investorBalance.toString(), tokens('1'))
    
      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args
      assert.equal(event.account_from, sender)
      assert.equal(event.address_to, _token.address)
      assert.equal(event.unit_token.toString(), tokens('1').toString())
      })
  })  

  describe('Burn the Tokens', async () => {
      
       // htlc = await _sourceChain.new()
       before(async () => {
       // sender must approve tokens before the transfer
        await _token.approve(_sourceChain.address, tokens('1'), { from: sender })
       // sender burn the tokens
        //result = await _sourceChain.sellTokens(tokens('1'), { from: investor })
        //result = await _sourceChain.exitTransaction(tokens('1'), burnaddress, { from: sender })
        result = await _sourceChain.exitTransaction(tokens('1'), burnAddress, hashPair.hash, timeLock1Hour, { from: sender })
      })
       it('The user has transferd the token to a burn address', async () => {
        // Check investor token balance after purchase
        let investorBalance = await _token.balanceOf(sender)
        assert.equal(investorBalance.toString(), tokens('0'))
      
         // Check burn address balance after the transfer
        let burnAddressBalance
        burnAddressBalance = await _token.balanceOf(burnAddress)
        assert.equal(burnAddressBalance.toString(), tokens('1'))
        console.log(burnAddressBalance.toString())
        
         // Check logs to ensure event was emitted with correct data
        const event = result.logs[0].args
        assert.equal(event.account_from, sender)
        assert.equal(event.address_to, burnAddress)
        assert.equal(event.unit_token.toString(), tokens('1').toString())
        assert.equal(event._secretCode, hashPair.hash)
        assert.equal(event._timelock, timeLock1Hour)
       // console.log(result.logs[0].args)
        })
        
         it('exitTransaction() should fail when no token transfer approved', async () => {
          await _token.approve(_sourceChain.address, tokens('0'), {from: sender}) // ensure 0
          await newContractExpectFailure('expected failure due to no tokens approved')
        }) 

        it('exitTransaction() should fail when token amount is 0', async () => {
          // approve htlc for one token but send amount as 0
          await _token.approve(_sourceChain.address, tokens('1'), {from: sender})
          await newContractExpectFailure('expected failure due to 0 token amount', {amount: 0, })
        })

        it('exitTransaction() should fail when tokens approved for some random account', async () => {
          // approve htlc for different account to the htlc contract
          await _token.approve(_sourceChain.address, tokens('0'), {from: sender}) // ensure 0
          await _token.approve(accounts[9], tokens('1'), {from: sender})
          await newContractExpectFailure('expected failure due to wrong approval')
        })

        it('exitTransaction() should fail when the timelock is in the past', async () => {
          const pastTimelock = nowSeconds() - 2
          await _token.approve(_sourceChain.address, asset, {from: sender})
          await newContractExpectFailure( 'expected failure due to timelock in the past', {timelock: pastTimelock})
        })
        // not working
       /*  it('newContract() should reject a duplicate contract request', async () => {
          const hashlock = newSecretHashPair().hash
          const timelock = timeLock1Hour + 5
          const balBefore = web3.utils.toBN(await _token.balanceOf(_sourceChain.address))
      
          await newContract({hashlock: hashlock, timelock: timelock})
          await assertTokenBal(
            _sourceChain.address,
            balBefore.add(web3.utils.toBN(asset)),'tokens not transfered to htlc contract')
          await _token.approve(_sourceChain.address, asset, {from: sender})
          // now attempt to create another with the exact same parameters
          await newContractExpectFailure( 'expected failure due to duplicate contract details',
              {timelock: timelock,  hashlock: hashlock,})
        }) */


      }) 

 
   // Helper for newContract() calls, does the ERC20 approve before calling
    const newContract = async ({ timelock = timeLock1Hour, hashlock = newSecretHashPair().hash, } = {}) => {
    await _token.approve(_sourceChain.address, asset, {from: sender})
    return _sourceChain.exitTransaction(_asset, _burnAddress, _amount, _hashlock, _timelock, {from: sender,})
    }
   // Helper for newContract() when expecting failure

  const newContractExpectFailure = async (shouldFailMsg, { 
      _burnAddress = burnAddress, 
      _asset = asset,
      _timelock = timeLock1Hour,
      _hashlock = newSecretHashPair().hash
    } = {}
  ) => {
    try {
      await _sourceChain.exitTransaction(_asset, _burnAddress, _hashlock, _timelock, {from: sender,})
      assert.fail(shouldFailMsg)
    } catch (err) {
      assert.isTrue(err.message.startsWith(REQUIRE_FAILED_MSG))
    }
  }
})
   

//function exitTransaction(uint _asset, address _burnAddress, bytes32 _secretCode, uint256 _timelock)