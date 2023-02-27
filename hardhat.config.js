require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.6",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  defaultNetwork: "mumbai",
  networks: {
    // Hardhat localhost testnet
    hardhat: {
      chainId: 1337, //31337 - 1337
    },
    // Goerli testnet
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.MAIN_ACCOUNT],
      chainId: 5,
    },
    // Mumbai Testnet
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.MAIN_ACCOUNT],
      chainId: 80001,
    },
    // Polygon mainnet
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.MAIN_ACCOUNT],
      chainId: 137,
    },
    // Ethereum mainnet
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.MAIN_ACCOUNT],
      chainId: 1,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    noColors: true,
    outputFile: "gasReportFile2.txt",
    coinmarketcap: process.env.COINMARKETKAP_API_KEY,
    token: "matic",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
