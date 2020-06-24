
//import the smart contract
const Token = artifacts.require('Token')
const SourceChain = artifacts.require('SourceChain')
const DestinationChain = artifacts.require('DestinationChain')

// helper to convert the token to wei 
function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

  //begin the test conditions
  //'sender' - the first account and 'recipient' the second address
   contract('Test- Buy and sell tokens', ([deployer, senter, burnaddress]) => {
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

    /* TEST */
  describe('Buy the Tokens', async () => {
    let result

    before(async () => {
      // Buy a tokens from the contract
      result = await _sourceChain.buyTokens({from: senter, value: web3.utils.toWei('1', 'ether')})
      })
    it('User bought a token from the contract', async () => {
      // Check senter token balance after purchase
      let investorBalance = await _token.balanceOf(senter)
      assert.equal(investorBalance.toString(), tokens('1'))
    
      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args
      assert.equal(event.account_from, senter)
      assert.equal(event.address_to, _token.address)
      assert.equal(event.unit_token.toString(), tokens('1').toString())
      })
  })  

  describe('Burn the Tokens', async () => {
      let result
       before(async () => {
        // senter must approve tokens before the transfer
        await _token.approve(_sourceChain.address, tokens('1'), { from: senter })
        // senter burn the tokens
        //result = await _sourceChain.sellTokens(tokens('1'), { from: investor })
        result = await _sourceChain.exitTransaction(tokens('1'), burnaddress, { from: senter })
      })
  
       it('The user has transferd the token to a burn address', async () => {
        // Check investor token balance after purchase
        let investorBalance = await _token.balanceOf(senter)
        assert.equal(investorBalance.toString(), tokens('0'))

         // Check burn address balance after the transfer
        let burnAddressBalance
        burnAddressBalance = await _token.balanceOf(burnaddress)
        assert.equal(burnAddressBalance.toString(), tokens('1'))

        // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args
      assert.equal(event.account_from, senter)
      assert.equal(event.address_to, burnaddress)
      assert.equal(event.unit_token.toString(), tokens('1').toString())
                          
      }) 
  }) 
    
})