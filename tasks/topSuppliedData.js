const { initializeContracts, networks } = require('../networks');
const { ethers } = require('ethers');
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const twitterText = require('twitter-text');


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




function splitLongString(str) {
  const maxLength = 275;
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


let weth = 1;


async function execute(cometContract, network, assetName, assetsIndexer){

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

      assetsIndexer++;
      number++;

      const underlyingABI = '[{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}, {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}]';
      const underlyingContract = new ethers.Contract(asset, underlyingABI, wallet);

      const symbol = await underlyingContract.symbol();
      const decimals = await underlyingContract.decimals();

      const totalCol = await cometContract.totalsCollateral(asset);


      const price = await cometContract.getPrice(underToAsset[asset]);
      const collateral = Number(totalCol[0]) / 10**Number(decimals);
      const tvl = collateral * (Number(price) / 10**8);

      if(weth === 1 && symbol === 'WETH'){
        weth = Number(price) / 10**8;
      }

      if(assetName === 'ETH'){

        tweetText += `\u{1FA99}  ${symbol}\n`;
        tweetText += `    Price: ${(Number(price) / 10**8 * weth).toFixed(2)}\u{1F4B2}\n`;
        tweetText += `    Collateral: ${numberToSpacedString(collateral.toFixed(0))}\n`;
        tweetText += `     TVL: ${numberToSpacedString((tvl * weth).toFixed(0))}\u{1F4B2}\n\n`;

      }else{

        tweetText += `\u{1FA99}  ${symbol}\n`;
        tweetText += `    Price: ${(Number(price) / 10**8).toFixed(2)}\u{1F4B2}\n`;
        tweetText += `    Collateral: ${numberToSpacedString(collateral.toFixed(0))}\n`;
        tweetText += `    TVL: ${numberToSpacedString(tvl.toFixed(0))}\u{1F4B2}\n\n`;
       
      }

      
  }

  return [tweetText, assetsIndexer];
}


(async () => {

  let assetsIndexer = 0;

  console.log('TopSuppliedData execution');

  let tweetText = '';
  tweetText += `\u{1F4CA} Supplied assets \u{1F4CA}\n\n`;

  try {
    const contracts = await initializeContracts();

    for (const [network, networkContracts] of Object.entries(contracts)) {
      
      tweetText += `\n${network}:\n\n`;
      for (const { contract, assetName } of networkContracts) {
        console.log(`Working with contract ${assetName} on network ${network}:`);
        const [text, newAssetsIndexer] = await execute(contract, network, assetName, assetsIndexer);
        assetsIndexer = newAssetsIndexer;
        tweetText += text;
      }
      
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
  

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
    bearerToken: process.env.BEARER_TOKEN,
  });

  const rwClient = client.readWrite;

  console.log(tweetText.length);
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
  
  //console.log(parts);
  for(const part of parts){
    tweetLength = twitterText.getTweetLength(part);
    console.log(tweetLength);
  }

})();