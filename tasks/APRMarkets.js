const { initializeContracts, networks } = require('../networks');
const { ethers } = require('ethers');
require('dotenv').config();
const TwitterApi = require('twitter-api-v2');


async function execute(cometContract, network){
  
  const secondsPerYear = 60 * 60 * 24 * 365;
  const utilization = await cometContract.getUtilization();
  const supplyRate = await cometContract.getSupplyRate(utilization);
  const supplyAPR = Number(supplyRate) / (10 ** 18) * secondsPerYear * 100;
  
  return supplyAPR;
  
}


// Вы можете использовать async/await без скобок
(async () => {
  try {
    const contracts = await initializeContracts();

    const data = {};

    for (const [network, networkContracts] of Object.entries(contracts)) {
      for (const { contract, assetName } of networkContracts) {
        console.log(`Working with contract ${assetName} on network ${network}:`);
        const tokenData = await execute(contract, network);
        
        console.log(`Data for ${assetName} on ${network}:`, tokenData);
      }
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
})();

/*
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Формируем текст твита на основе данных
let tweetText = '';
networkData.forEach((assetData, index) => {
  tweetText += `Data for ${assetData.symbol} on ARBITRUM:\n`;
  tweetText += `   ${index + 1}) ${assetData.symbol}\n`;
  tweetText += `        Oracle price: ${assetData['Oracle price']}\n`;
  tweetText += `        Collateral factor: ${assetData['Collateral factor']}\n`;
  tweetText += `        Liquidation factor: ${assetData['Liquidation factor']}\n`;
  tweetText += `        Liquidation penalty: ${assetData['Liquidation penalty']}\n\n`;
});

// Отправляем твит
client.v1.tweet(tweetText).then((tweet) => {
  console.log('Твит успешно опубликован:', tweet);
}).catch((error) => {
  console.error('Ошибка при отправке твита:', error);
});
  
*/


// Подключение к контракту
/*
const controller = new ethers.Contract(controllerAddress, controllerABI, wallet);
const cometContract = new ethers.Contract(cometAddress, cometABI, wallet);

const data = [];



*/


//console.log(data);