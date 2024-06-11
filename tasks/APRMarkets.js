const { initializeContracts, networks } = require('../networks');
const { ethers } = require('ethers');
require('dotenv').config();
const { TwitterApi } = require("twitter-api-v2");
const twitterText = require('twitter-text');


async function execute(cometContract, network){
  
  const secondsPerYear = 60 * 60 * 24 * 365;
  const utilization = await cometContract.getUtilization();
  const supplyRate = await cometContract.getSupplyRate(utilization);
  const supplyAPR = Number(supplyRate) / (10 ** 18) * secondsPerYear * 100;
  
  return supplyAPR;
  
}

(async () => {
  console.log('APRMarkets execution');
  let tweetText = '';
  try {
    const contracts = await initializeContracts();

    const data = {};

    tweetText += `\u{1F51D} APR in Compound Markets \u{1F51D}\n\n`;

    for (const [network, networkContracts] of Object.entries(contracts)) {
      tweetText += `\n${network}:\n`;

      for (const { contract, assetName } of networkContracts) {
        console.log(`Working with contract ${assetName} on network ${network}:`);
        const apr = await execute(contract, network);
  
        tweetText += `\u{1FA99}  ${assetName}: ${apr.toFixed(2)} %\n`;
        
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

  const textTweet = async () => {
    try {
      await rwClient.v2.tweet(tweetText);
      console.log("success");
    } catch (error) {
      console.error(error);
    }
  };

  tweetLength = twitterText.getTweetLength(tweetText);
  console.log(tweetLength);
  
  //textTweet();
  
})();