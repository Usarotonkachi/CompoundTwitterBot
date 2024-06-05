const { initializeContracts, networks } = require('../networks');
const { ethers } = require('ethers');
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const twitterText = require('twitter-text');


function splitLongString(str) {
  const maxLength = 280;
  const delimiter = '\n\n';
  const parts = [];

  let currentPart = '';

  const chunks = str.split(delimiter);

  for (const chunk of chunks) {
 
    if (currentPart.length + chunk.length > maxLength) {
  
      parts.push(currentPart.trim());

      currentPart = chunk;
    } else {

      currentPart += delimiter + chunk;

    }
  }

  if (currentPart.trim().length > 0) {
    parts.push(currentPart.trim());
  }

  return parts;
}


async function execute(cometContract, network, assetsIndexer){

  let tweetText = '';

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



  for(const asset of assetsUnderlyings){

      number++;
      assetsIndexer++;

      const underlyingABI = '[{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}, {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}]';
      const underlyingContract = new ethers.Contract(asset, underlyingABI, wallet);

      const symbol = await underlyingContract.symbol();

      const price = await cometContract.getPrice(underToAsset[asset]);
     
      tweetText += `\u{1FA99}  ${symbol}\n`;
      tweetText += `Price: ${(Number(price) / 10**8).toFixed(2)}\u{1F4B2}\n`;
      tweetText += `Collateral factor: ${(Number(assetsInfos[asset][4]) / 10**18 * 100).toFixed(1)} %\n`;
      tweetText += `Liquidation factor: ${(Number(assetsInfos[asset][5]) / 10**18 * 100).toFixed(1)} %\n`;
      tweetText += `Liquidation penalty: ${(100 - Number(assetsInfos[asset][6]) / 10**18 * 100).toFixed(1)} %\n\n`;

  }

  return [tweetText, assetsIndexer];
}


(async () => {
  console.log('suppliedData execution');
  let assetsIndexer = 0;

  let tweetText = '';

  try {
    const contracts = await initializeContracts();

    tweetText += `\u{1F4A1} Supplied assets detail \u{1F4A1}\n\n`;

    for (const [network, networkContracts] of Object.entries(contracts)) {
      tweetText += `\n${network}:\n\n`;
      for (const { contract, assetName } of networkContracts) {
        tweetText += `${assetName}:\n\n`;
        console.log(`Working with contract ${assetName} on network ${network}:`);
        
        const [info, newAssetsIndexer] = await execute(contract, network, assetsIndexer);
        assetsIndexer = newAssetsIndexer;
        tweetText += info;
        
      }
    }
    
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

  console.log(tweetText);

  const textTweet = async (texts) => {
    try {
      await rwClient.v2.tweetThread(texts);
      
      console.log("success");
    } catch (error) {
      console.error(error);
    }
  };
  
  tweetLength = twitterText.getTweetLength(tweetText);
  console.log(tweetLength);

  const parts = splitLongString(tweetText);

  textTweet(parts);
  
  console.log(parts);
  for(const part of parts){
    tweetLength = twitterText.getTweetLength(part);
    console.log(tweetLength);
  }

})();