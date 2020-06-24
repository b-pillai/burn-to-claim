
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
   contract('Test  - contract deployment test', ([deployer, investor]) => {
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
  
})//end of test condition