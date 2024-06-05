require('dotenv').config();
const { ethers } = require('ethers');
const { othersGovernABI, ethGovernABI } = require('../abi');
const { networksGover } = require('../addresses');
const { networks } = require('../networks');
const { TwitterApi } = require("twitter-api-v2");



async function getProposalCreatedEvents(contract) {
   
    const filter = contract.filters.ProposalCreated();

    const events = await contract.queryFilter(filter);
  
    return events;
}


(async () => {
    console.log('governance execution');
    let tweetText = [];

    
    try {

        let indexer = 0;

        for (const network of Object.keys(networks)) {

            let governanceContract;
            
            const goverAddress = networksGover[network];
            
            const provider = new ethers.JsonRpcProvider(networks[network]['rpcUrl']);

            const currentBlockNumber = await provider.getBlockNumber();

            if (network === 'ETHEREUM') {
                const networkData = [];

                governanceContract = new ethers.Contract(goverAddress, ethGovernABI, provider);

                const proposals = await governanceContract.proposalCount();
                const proposalCount = Number(proposals);

                let lastProposalFlag = 0;

                for (let number = proposalCount; number > 0; number--) {

                    let thread = '';

                    if(number === proposalCount){
                        thread += `\u{1F4DC} Governance data \u{1F4DC}\n\n`;
                    }
                    
                    const proposalInfo = await governanceContract.proposals(number);
                    
                    const id = Number(proposalInfo[0]);
                    const startBlock = Number(proposalInfo[3]);
                    const endBlock = Number(proposalInfo[4]);
                    const forVotes = Number(proposalInfo[5]);
                    const againstVotes = Number(proposalInfo[6]);
                    const abstainVotes = Number(proposalInfo[7]);
                    const cancelled = proposalInfo[8];
                    const executed = proposalInfo[9];

                    if (currentBlockNumber < endBlock) {
                        const events = await getProposalCreatedEvents(governanceContract);

                        events.forEach((event) => {
                            const { id, proposer, targets, values, signatures, calldatas, startBlock, endBlock, description } = event.args;

                            if (Number(id) === number) {
                                let lines = description.split('\n');
                                let modifiedText = lines[0];

                                indexer++;

                                modifiedText = modifiedText.replace(/#/g, '');
                                modifiedText = modifiedText.replace(/\[Gauntlet\]/g, '');

                                thread += `\u{270D}   Active proposal\n\n`;


                                thread += `Title: ${modifiedText} \u{1F3C6}\n\n`;
                                thread += `Proposal ID in the Protocol: ${id}\n`;

                                if (currentBlockNumber >= startBlock) {
                                    thread += `Status: voting\n`;
                                } else {
                                    thread += `Status: preparation for voting\n`;
                                }

                                thread += `Votes for: ${Math.floor(Number(forVotes) / 10**18)}\n`;
                                thread += `Votes against: ${Math.floor(Number(againstVotes) / 10**18)}\n`;
                                thread += `Votes abstain: ${Math.floor(Number(abstainVotes) / 10**18)}\n\n\n`;
                            }
                        });
                    } else {
                        if (lastProposalFlag === 0) {
                            const events = await getProposalCreatedEvents(governanceContract);

                            indexer++;

                            events.forEach((event) => {
                                const { id, proposer, targets, values, signatures, calldatas, startBlock, endBlock, description } = event.args;

                                if (Number(id) === number) {
                                    let lines = description.split('\n');
                                    let modifiedText = lines[0];

                                    modifiedText = modifiedText.replace(/#/g, '');
                                    modifiedText = modifiedText.replace(/\[Gauntlet\]/g, '');

                                    thread += `\u{270D}   Last executed proposal\n\n`;
                                    thread += `Title: ${modifiedText} \u{1F3C6}\n\n`;
                                    thread += `Proposal ID in the Protocol: ${id}\n`;
                                    thread += `Status: executed\n`;
                                    thread += `Votes for: ${Math.floor(Number(forVotes) / 10**18)}\n`;
                                    thread += `Votes against: ${Math.floor(Number(againstVotes) / 10**18)}\n`;
                                    thread += `Votes abstain: ${Math.floor(Number(abstainVotes) / 10**18)}\n\n\n`;
                                }
                            });
                            lastProposalFlag = 1;
                        } else {
                            break;
                        }
                    }
                    tweetText.push(thread);
                }
            }
            break;
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
          await rwClient.v2.tweetThread(tweetText);
          console.log("success");
        } catch (error) {
          console.error(error);
        }
      };
      
      textTweet();
      
})();