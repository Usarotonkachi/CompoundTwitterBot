const { initializeContracts, networks } = require('../networks');
const { ethers } = require('ethers');
require('dotenv').config();
const TwitterApi = require('twitter-api-v2');


async function execute(cometContract, network){
  
  const provider = new ethers.JsonRpcProvider(networks[network]['rpcUrl']);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const underToAsset = {};

  const assetsInfos = {};

  const assetsUnderlyings = [];

  const data = [];

  let assetIndex = 0;

  while (true) {
    try {

        const assetInfo = await cometContract.getAssetInfo(assetIndex);
        
        assetsUnderlyings.push(assetInfo[1]);
        underToAsset[assetInfo[1]] = assetInfo[2];
        assetsInfos[assetInfo[1]] = assetInfo;
        
        assetIndex++;
    } catch (error) {
        break;
    }
  }

  let number = 0;



  for(const asset of assetsUnderlyings){

      number++;

      const underlyingABI = '[{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}, {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}]';
      const underlyingContract = new ethers.Contract(asset, underlyingABI, wallet);

      const symbol = await underlyingContract.symbol();
      const decimals = await underlyingContract.decimals();

      const totalCol = await cometContract.totalsCollateral(asset);


      const price = await cometContract.getPrice(underToAsset[asset]);
      const collateral = Number(totalCol[0]) / 10**Number(decimals);
      const tvl = collateral * (Number(price) / 10**8);

      const tokenData = {};

      tokenData['number'] = number;
      tokenData['symbol'] = symbol;
      tokenData['asset'] = asset;
      tokenData['Oracle price'] = Number(price) / 10**8;
      tokenData['Collateral factor'] = Number(assetsInfos[asset][4]) / 10**18 * 100;
      tokenData['Liquidation factor'] = Number(assetsInfos[asset][5]) / 10**18 * 100;
      tokenData['Liquidation penalty'] = 100 - Number(assetsInfos[asset][6]) / 10**18 * 100;

      data.push(tokenData);

  }

  return data;
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
        console.log(tokenData);
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