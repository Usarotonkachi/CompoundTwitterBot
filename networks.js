require('dotenv').config();
const { ethers } = require('ethers');
const abi = require('./abi');

// Загружаем RPC URL-ы и адреса смарт-контрактов из переменных окружения
const networks = {
  ethereum: {
    rpcUrl: process.env.ETHEREUM_RPC_URL,
    contractAddresses: process.env.ETHEREUM_CONTRACT_ADDRESSES.split(','),
  },
  optimism: {
    rpcUrl: process.env.OPTIMISM_RPC_URL,
    contractAddresses: process.env.OPTIMISM_CONTRACT_ADDRESSES.split(','),
  },
  polygon: {
    rpcUrl: process.env.POLYGON_RPC_URL,
    contractAddresses: process.env.POLYGON_CONTRACT_ADDRESSES.split(','),
  },
  base: {
    rpcUrl: process.env.BASE_RPC_URL,
    contractAddresses: process.env.BASE_CONTRACT_ADDRESSES.split(','),
  },
  arbitrum: {
    rpcUrl: process.env.ARBITRUM_RPC_URL,
    contractAddresses: process.env.ARBITRUM_CONTRACT_ADDRESSES.split(','),
  },
  scroll: {
    rpcUrl: process.env.SCROLL_RPC_URL,
    contractAddresses: process.env.SCROLL_CONTRACT_ADDRESSES.split(','),
  },
};

async function initializeContracts() {
  const contracts = {};

  for (const [network, { rpcUrl, contractAddresses }] of Object.entries(networks)) {
    contracts[network] = [];
    for (const contractAddress of contractAddresses) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        contracts[network].push(contract);
        console.log(`Contract initialized for ${network} at address ${contractAddress}`);
      } catch (error) {
        console.error(`Error initializing contract for ${network} at address ${contractAddress}:`, error);
      }
    }
  }

  return contracts;
}

// Экспорт функции для использования в других файлах
module.exports = { initializeContracts };
