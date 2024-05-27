const { initializeContracts, networks } = require('../networks');
const { ethers } = require('ethers');
require('dotenv').config();
const TwitterApi = require('twitter-api-v2');


let weth = 1;

async function execute(cometContract, network, assetName){

  const provider = new ethers.JsonRpcProvider(networks[network]['rpcUrl']);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const underToAsset = {};

  const assetsInfos = {};

  const assetsUnderlyings = [];

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

  let totalBor = 0;

  for(const asset of assetsUnderlyings){

      number++;

      const underlyingABI = '[{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}, {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}]';
      const underlyingContract = new ethers.Contract(asset, underlyingABI, wallet);

      const symbol = await underlyingContract.symbol();
      const decimals = await underlyingContract.decimals();

      totalBor = await cometContract.totalBorrow();


      const price = await cometContract.getPrice(underToAsset[asset]);
      
      if(weth === 1 && symbol === 'WETH'){
        weth = Number(price) / 10**8;
      }

      if(weth != 1){
        break;
      }

  }

  return totalBor;

}


(async () => {
  try {
    const contracts = await initializeContracts();

    const data = {};

    for (const [network, networkContracts] of Object.entries(contracts)) {
      for (const { contract, assetName } of networkContracts) {
        console.log(`Working with contract ${assetName} on network ${network}:`);
        const totalBor = await execute(contract, network, assetName);
        //console.log(totalBor);
        //console.log(weth);
        let borrowedUSD = 0;
        if(assetName === 'ETH'){
            
            borrowedUSD = Number(totalBor) / 10**18 * weth;
        }else{
            borrowedUSD = Number(totalBor) / 10**6;
        }
        console.log(`Data for ${assetName} on ${network}:`, borrowedUSD);
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
tweetText += 'Data for USDC on ARBITRUM:\n';
networkData.forEach((assetData, index) => {
  tweetText += `   ${index + 1}) ${assetData.symbol}\n`;
  tweetText += `        Oracle price: ${assetData['Oracle price'].toFixed(2)}\n`;
  tweetText += `        Collateral factor: ${assetData['Collateral factor'].toFixed(2)}\n`;
  tweetText += `        Liquidation factor: ${assetData['Liquidation factor'].toFixed(2)}\n`;
  tweetText += `        Liquidation penalty: ${assetData['Liquidation penalty'].toFixed(2)}\n`;
});

// Отправляем твит
client.v1.tweet(tweetText).then((tweet) => {
  console.log('Твит успешно опубликован:', tweet);
}).catch((error) => {
  console.error('Ошибка при отправке твита:', error);
});
  

*/

/*
const data = [];
const assetsUnderlyings = [];


async function main(){

    const underToAsset = {};


    for(let i = 0; i < 5; i++){
   
        const assetInfo = await cometContract.getAssetInfo(i);
       
        assetsUnderlyings.push(assetInfo[1]);
        underToAsset[assetInfo[1]] = assetInfo[2];
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
        tokenData['Collateral'] = collateral;
        tokenData['asset'] = asset;
        tokenData['tvl'] = tvl;

        data.push(tokenData);
        console.log(tokenData);

    }
    
*/
/*
    const markets = await controller.getAllMarkets();

    console.log(markets);

    
    for (const market of markets){

        number++;
        
        const tokenABI = '[{"inputs":[],"name":"underlying","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]';
        const tokenContract = new ethers.Contract(market, tokenABI, wallet);
        const underlying = await tokenContract.underlying();

        const underlyingABI = '[{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}]';
        const underlyingContract = new ethers.Contract(underlying, underlyingABI, wallet);

        const symbol = await underlyingContract.symbol();
        
        const totalCol = await cometContract.totalsCollateral(underlying);
        console.log(totalCol);
        const tokenData = {};

        tokenData['number'] = number;
        tokenData['symbol'] = symbol;
        tokenData['Collateral'] = totalCol / 10**18;
        tokenData['address'] = market;

        data.push(tokenData);
        console.log(tokenData);
    }
*/



//main();
//console.log(data);