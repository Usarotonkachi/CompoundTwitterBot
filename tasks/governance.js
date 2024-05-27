require('dotenv').config();
const { ethers } = require('ethers');
const { othersGovernABI, ethGovernABI } = require('../abi');
const { 
  networksGover
} = require('../addresses');
const {
    networks
} = require('../networks');



(async () => {
    try {
  
        for (const network of Object.keys(networks)) {

            let governanceContract;
            
            const goverAddress = networksGover[network];
            
            const provider = new ethers.JsonRpcProvider(networks[network]['rpcUrl']);

            const currentBlockNumber = await provider.getBlockNumber();
            
            //const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);


            if (network === 'ETHEREUM'){
                governanceContract = new ethers.Contract(goverAddress, ethGovernABI, provider);

                const proposals = await governanceContract.proposalCount();
                const proposalCount = Number(proposals);

                for(let number = proposalCount; number > 0; number--){
                    const proposalInfo = await governanceContract.proposals(number);
                    console.log(proposalInfo);
                    const id = Number(proposalInfo[0]);
                    const startBlock = Number(proposalInfo[3]);
                    const endBlock = Number(proposalInfo[4]);
                    const forVotes = Number(proposalInfo[5]);
                    const againstVotes = Number(proposalInfo[6]);
                    const abstainVotes = Number(proposalInfo[7]);
                    const cancelled = proposalInfo[8];
                    const executed = proposalInfo[9];

                    const actions = await governanceContract.getActions(id);
                    const interface = new ethers.Interface(ethGovernABI);

                    

                }

            }else{
                governanceContract = new ethers.Contract(goverAddress, othersGovernABI, provider);
            }


            

        }

    } catch (error) {
      console.error('Error in main execution:', error);
    }
  })();