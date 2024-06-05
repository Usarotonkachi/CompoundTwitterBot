const { initializeContracts, networks } = require('../networks');
const { ethers } = require('ethers');
require('dotenv').config();
const { TwitterApi } = require("twitter-api-v2");


function insertSpaces(str) {
 
  const chars = str.split('');

  for (let i = chars.length - 3; i > 0; i -= 3) {
    chars.splice(i, 0, ' ');
  }

  return chars.join('');
}


function numberToSpacedString(num) {

  const numStr = num.toString();

  const decimalIndex = numStr.indexOf('.');

  if (decimalIndex === -1) {
    return insertSpaces(numStr);
  }

  const integerPart = numStr.slice(0, decimalIndex);
  return insertSpaces(integerPart);
}


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

  console.log('totalBorrowed execution');

  let tweetText = '';
  

  let networkList = '';

  for (const [chain, networkContracts] of Object.entries(networks)){
    networkList += `${chain}, `;
  }
  let listn = networkList.substring(0, networkList.length - 2);

  tweetText += `\u{1F4B0} Total borrowed value in Compound \u{1F4B0} (${listn}):\n\n`;

  try {
    const contracts = await initializeContracts();

    let totalCompoundBorrowed = 0;

    for (const [network, networkContracts] of Object.entries(contracts)) {
      for (const { contract, assetName } of networkContracts) {
        console.log(`Working with contract ${assetName} on network ${network}:`);
        const totalBor = await execute(contract, network, assetName);
        
        let borrowedUSD = 0;
        if(assetName === 'ETH'){
            
            borrowedUSD = Number(totalBor) / 10**18 * weth;
        }else{
            borrowedUSD = Number(totalBor) / 10**6;
        }
        totalCompoundBorrowed += borrowedUSD;
        
      }
    }

    tweetText += `Total borrowed value in USD: ${numberToSpacedString(totalCompoundBorrowed.toFixed(0))}\u{1F4B2}\n`;
  } catch (error) {
    console.error('Error in main execution:', error);
  }

  console.log(tweetText);
  console.log(tweetText.length);

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
    bearerToken: process.env.BEARER_TOKEN,
  });

  const rwClient = client.readWrite;

  const textTweet = async () => {
    try {
      await rwClient.v2.tweet(tweetText);
      console.log("success");
    } catch (error) {
      console.error(error);
    }
  };

  textTweet();

})();