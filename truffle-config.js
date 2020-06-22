module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 5000000
    }
  },
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 200      // Default: 200
        },
        evmVersion: "petersburg" //https://www.youtube.com/watch?v=nqaiSvsXIEk&t=87s&frags=pl%2Cwn time 15:13
      }
    }
  }
};
