
// Подключение к контракту
const controller = new ethers.Contract(controllerAddress, controllerABI, wallet);
const cometContract = new ethers.Contract(cometAddress, cometABI, wallet);

const data = [];
const assetsUnderlyings = [];


async function main(){

    const underToAsset = {};

    const assetsInfos = {};


    for(let i = 0; i < 5; i++){
   
        const assetInfo = await cometContract.getAssetInfo(i);
       
        assetsUnderlyings.push(assetInfo[1]);
        underToAsset[assetInfo[1]] = assetInfo[2];
        assetsInfos[assetInfo[1]] = assetInfo;
       
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
        console.log(tokenData);

    }

    

}


main();
console.log(data);