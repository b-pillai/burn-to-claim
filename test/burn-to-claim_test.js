
//import the smart contract
const Token = artifacts.require('Token')
const SourceChain = artifacts.require('SourceChain')
const DestinationChain = artifacts.require('DestinationChain')

// helper to convert the token to wei (https://youtu.be/wF0TJMPKPdQ?t=1176)
function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

  //begin the test conditions
  //'sender' - the first account and 'recipient' the second address
   contract('Test burn-to-claim protocol smart contract', ([deployer, investor]) => {
    //declare the variables 
    let _token, _sourceChain, _destinationChain
  
    // add common things
    before (async()=>{
      _token = await Token.new()
      _sourceChain = await SourceChain.new(_token.address)
      _destinationChain = await DestinationChain.new()
      //transfer all tokens to testcontract (1 million)
      await _token.transfer(_sourceChain.address, tokens('1000000'))
    })

  /* TEST
  deployed test - check the contract address is empty or not */
  //sourceChain contract
  describe ("smart conract deployment", async()=>{
    it('Source Chain smart contract is deployed', async () => {
    const _sourceChain = await SourceChain.deployed()
    assert(_sourceChain.address !== '')
    })
  //destination chain contract
    it('Destination Chain smart contract is deployed', async () => {
    const _destinationChain = await DestinationChain.deployed()
    assert(_destinationChain.address !== '')
    })
  //Token contract
    it('Token contract is deployed', async () => {
    const _token = await Token.deployed()
    assert(_token.address !== '')
    })// end of deployment test
  })

  /* TEST */
  //test the token balance (https://youtu.be/wF0TJMPKPdQ?t=702)
  describe ("Check the balance", async()=>{
    it('The Source chain contract has tokens', async () => {
    let balance = await _token.balanceOf(_sourceChain.address)
    assert.equal(balance.toString(), tokens('1000000'))
    })// end of token balance test
  })
  
  /* TEST */
  describe('Buy the Tokens', async () => {
    let result

    before(async () => {
      // Purchase tokens before each example
      result = await _sourceChain.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')})
    })
    it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
         // Check investor token balance after purchase
      let investorBalance = await _token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('1'))

      // Check sourceContractBalance and sender balance after purchase
      let sourceContractBalance
      sourceContractBalance = await _token.balanceOf(_sourceChain.address)
      assert.equal(sourceContractBalance.toString(), tokens('999999'))
      sourceContractBalance = await web3.eth.getBalance(_sourceChain.address)
      assert.equal(sourceContractBalance.toString(), web3.utils.toWei('1', 'Ether'))

      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, _token.address)
      assert.equal(event.amount.toString(), tokens('1').toString())
      })
  })  

  /* TEST */
  describe('Sell the Tokens', async () => {
      let result
  
      before(async () => {
        // Investor must approve tokens before the purchase
        await _token.approve(_sourceChain.address, tokens('1'), { from: investor })
        // Investor sells tokens
        result = await _sourceChain.sellTokens(tokens('1'), { from: investor })
      })
  
       it('Allows user to instantly sell tokens to ethSwap for a fixed price', async () => {
        // Check investor token balance after purchase
        let investorBalance = await _token.balanceOf(investor)
        assert.equal(investorBalance.toString(), tokens('0'))
  
        // Check ethSwap balance after purchase
        let sourceContractBalance
        sourceContractBalance = await _token.balanceOf(_sourceChain.address)
        assert.equal(sourceContractBalance.toString(), tokens('1000000'))
        sourceContractBalance = await web3.eth.getBalance(_sourceChain.address)
        assert.equal(sourceContractBalance.toString(), web3.utils.toWei('0', 'Ether'))
  
        // Check logs to ensure event was emitted with correct data
        const event = result.logs[0].args
        assert.equal(event.account, investor)
        assert.equal(event.token, _token.address)
        assert.equal(event.amount.toString(), tokens('1').toString())

      }) 

  })

})//end of test condition