
require('dotenv').config(); // Подключаем dotenv
const ethers = require('ethers');
const { cometABI } = require('./abi');

const provider = new ethers.JsonRpcProvider(process.env.RPC); // Подключение к сети Ethereum
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Приватный ключ вашего кошелька


const controllerABI = '[{"constant":true,"inputs":[],"name":"getAllMarkets","outputs":[{"internalType":"contract CToken[]","name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"}]'; // Загружаем ABI смарт-контракта
const controllerAddress = '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B'; // Адрес смарт-контракта

//const cometABI = '[{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"totalsCollateral","outputs":[{"internalType":"uint128","name":"totalSupplyAsset","type":"uint128"},{"internalType":"uint128","name":"_reserved","type":"uint128"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"uint8","name":"i","type":"uint8"}],"name":"getAssetInfo","outputs":[{"components":[{"internalType":"uint8","name":"offset","type":"uint8"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"address","name":"priceFeed","type":"address"},{"internalType":"uint64","name":"scale","type":"uint64"},{"internalType":"uint64","name":"borrowCollateralFactor","type":"uint64"},{"internalType":"uint64","name":"liquidateCollateralFactor","type":"uint64"},{"internalType":"uint64","name":"liquidationFactor","type":"uint64"},{"internalType":"uint128","name":"supplyCap","type":"uint128"}],"internalType":"struct CometCore.AssetInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"priceFeed","type":"address"}],"name":"getPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]';
const cometAddress = '0xc3d688B66703497DAA19211EEdff47f25384cdc3';



// Подключение к контракту
const controller = new ethers.Contract(controllerAddress, controllerABI, wallet);
const cometContract = new ethers.Contract(cometAddress, cometABI, wallet);

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
}


main();
console.log(data);