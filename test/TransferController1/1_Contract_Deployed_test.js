
//import the smart contract
const Token = artifacts.require('Token')
const TransferController1 = artifacts.require('TransferController1')

  //begin the test conditions
  //'sender' - the first account and 'recipient' the second address
   contract('Test  - contract deployment test', ([deployer, investor]) => {
    //declare the variables 
    let _token, _TransferController1
  
    // add common things
    before (async()=>{
      _token = await Token.new()
      _TransferController1 = await TransferController1.new(_token.address)
      //transfer all tokens to testcontract (1 million)
      await _token.transfer(_TransferController1.address, 10000)
    })

  
  // deployed test - check the contract address is empty or not 
  //TransferController1 contract
  describe ("smart contract deployment", async()=>{
    it('Transfer Controller smart contract is deployed', async () => {
    const _TransferController1 = await TransferController1.deployed()
    assert(_TransferController1.address !== '')
    console.log(_TransferController1.address)
    })
  //Token contract
    it('Token contract is deployed', async () => {
    const _token = await Token.deployed()
    assert(_token.address !== '')
    console.log(_token.address)
    })
  })

  //test the token balance (https://youtu.be/wF0TJMPKPdQ?t=702)
  describe ("Check the balance", async()=>{
    it('The Source chain contract has tokens', async () => {
    let balance = await _token.balanceOf(_TransferController1.address)
    assert.equal(balance.toString(), 10000)
    console.log(balance.toString())
    })// end of token balance test
  })
  
})
