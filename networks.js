require('dotenv').config();
const { ethers } = require('ethers');
const { cometABI } = require('./abi');
const { 
  ETHEREUM_ASSETS,
  OPTIMISM_ASSETS,
  POLYGON_ASSETS,
  ARBITRUM_ASSETS
} = require('./addresses');

// Загружаем RPC URL-ы из переменных окружения
const networks = {
  ETHEREUM: {
    rpcUrl: process.env.ETHEREUM_RPC_URL,
    assets: ETHEREUM_ASSETS,
  },
  OPTIMISM: {
    rpcUrl: process.env.OPTIMISM_RPC_URL,
    assets: OPTIMISM_ASSETS,
  },
  POLYGON: {
    rpcUrl: process.env.POLYGON_RPC_URL,
    assets: POLYGON_ASSETS,
  },
  ARBITRUM: {
    rpcUrl: process.env.ARBITRUM_RPC_URL,
    assets: ARBITRUM_ASSETS,
  },

/*
  BASE: {
    rpcUrl: process.env.BASE_RPC_URL,
    assets: BASE_ASSETS,
  },
  SCROLL: {
    rpcUrl: process.env.SCROLL_RPC_URL,
    assets: SCROLL_ASSETS,
  },
*/

};

async function initializeContracts() {
  const contracts = {};

  for (const [network, { rpcUrl, assets }] of Object.entries(networks)) {
    contracts[network] = [];
    for (const [contractAddress, assetName] of Object.entries(assets)) {
      try {
      
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractAddress, cometABI, provider);
        contracts[network].push({ contract, assetName });
        console.log(`Contract initialized for ${network} (${assetName}) at address ${contractAddress}`);
      } catch (error) {
        console.error(`Error initializing contract for ${network} (${assetName}) at address ${contractAddress}:`, error);
      }
    }
  }

  return contracts;
}


module.exports = { initializeContracts, networks };
