
//import the smart contract
const OZToken = artifacts.require('OZToken')
const OZTokenTimelock = artifacts.require('OZTokenTimelock')


  //begin the test conditions
  //'sender' - the first account and 'recipient' the second address
   contract('Test  - contract deployment test', ([deployer, investor]) => {
    //declare the variables 
    let _ozToken, _ozTokenTimelock
  
    // add common things
    before (async()=>{
      _ozToken = await OZToken.new(1000000)
      _ozTokenTimelock = await OZTokenTimelock.new(_ozToken.address, '0x92b060bdf342b6b6e79BB7dCd8a7E65aa196B7Ff',1593807611)
      //transfer all tokens to testcontract (1 million)
      await _ozToken.transfer(_ozTokenTimelock.address,1000000)
    })

  
  // deployed test - check the contract address is empty or not 
  //sourceChain contract
  describe ("smart contract deployment", async()=>{
    //Token contract
      it('Source Chain smart contract is deployed', async () => {
      const _ozTokenTimelock = await OZTokenTimelock.deployed()
      assert(_ozTokenTimelock.address !== '')
      console.log(_ozTokenTimelock.address)
      })
      it('Token contract is deployed', async () => {
      const _ozToken = await OZToken.deployed()
      assert(_ozToken.address !== '')
      console.log(_ozToken.address)
      })
  })

  //test the token balance (https://youtu.be/wF0TJMPKPdQ?t=702)
  describe ("Check the balance", async()=>{
    it('The Source chain contract has tokens', async () => {
    let balance = await _ozToken.balanceOf(_ozTokenTimelock.address)
    assert.equal(balance.toString(), 1000000)
    console.log(balance.toString())
    })// end of token balance test
  })
  
})
