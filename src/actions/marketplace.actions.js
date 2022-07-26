import { ethers } from 'ethers';

import { marketplaceConstants } from '../constants';

import * as actions from './';

import ERC20ABI_AAVE from '../_contracts/lend/AaveProtocolDataProvider.json';
import ERC20ABI_POOL from '../_contracts/lend/Pool.json';
import ERC20ABI_ISEER_ORACLE from '../_contracts/SeerOracle.json';
import ERCABI_REWARD from '../_contracts/lend/RewardsController.json';

// VET : dung de staking duy tri he thong
// VTH0 : dung de tra vi chay smart Contract

const TOKEN_AAVE = process.env.REACT_APP_ADDRESS_PROTOCOL;
const ADDRESS_POOL = process.env.REACT_APP_ADDRESS_POOL;
const ADDRESS_REWARD = process.env.REACT_APP_REWARD_CONTROLLER;

const ListKeyISeerOracle = {
    "VET": process.env.REACT_APP_ISO_VET,
    "VTHO": process.env.REACT_APP_ISO_VETHO,
    "VB": process.env.REACT_APP_ISO_VB,
    "VEUSD": process.env.REACT_APP_ISO_VEUSD
}

export const getMarketAssets = () => async (dispatch, getState) => {

    const state = getState();

    const { web3 } = state.web3;
    const { listAsset } = state.assetsMarketReducer;

    let dataTotal = {
        totalSupply: 0,
        totalBorrow: 0
    }

    let dataList = [];

    if (web3 && TOKEN_AAVE && listAsset.length > 0) {

        let contractAAVE = new web3.eth.Contract(ERC20ABI_AAVE, TOKEN_AAVE);

        let contractIcentives = new web3.eth.Contract(ERCABI_REWARD, ADDRESS_REWARD);
        console.log("contractIcentives",contractIcentives);

        const RAY = 10**27; // 10 to the power 27
        const SECONDS_PER_YEAR = 31536000;
        let totalChange = 0;

        for await (const item of listAsset) {

            const getReserveData = await contractAAVE.methods.getReserveData(item.assetsAddress).call();
            console.log("getReserveData",getReserveData);

            // Get data
            const rewardsByAsset = await contractIcentives.methods.getRewardsByAsset(item.assetsAddress).call();
            console.log("rewardsByAsset",rewardsByAsset);

            // const vEmission = contractIcentives.methods.getAssetData(item.assetsAddress);
            // console.log("aEmission",aEmission);
            
            const {
                variableBorrowRate,
                stableBorrowRate,
                liquidityRate
            } = getReserveData

            // Deposit and Borrow calculations
            // APY and APR are returned here as decimals, multiply by 100 to get the percents
            const depositAPR = liquidityRate.toString() / RAY;
            const variableBorrowAPR = variableBorrowRate.toString() / RAY;
            const stableBorrowAPR = stableBorrowRate.toString() / RAY;

            var depositAPY = ((1 + (depositAPR / SECONDS_PER_YEAR)) ** SECONDS_PER_YEAR) - 1;
            var variableBorrowAPY = ((1 + (variableBorrowAPR / SECONDS_PER_YEAR)) ** SECONDS_PER_YEAR) - 1;
            var stableBorrowAPY = ((1 + (stableBorrowAPR / SECONDS_PER_YEAR)) ** SECONDS_PER_YEAR) - 1;

            // console.table([
            //     ["assetsAddress",item.assetsAddress],
            //     ["depositAPR",depositAPR],
            //     ["variableBorrowAPR",variableBorrowAPR],
            //     ["stableBorrowAPR",stableBorrowAPR],
            //     ["depositAPY",depositAPY],
            //     ["variableBorrowAPY",variableBorrowAPY],
            //     ["stableBorrowAPY",stableBorrowAPY]
            // ]);

            let balanceSupply = 0;
            if (getReserveData.totalAToken) {
                balanceSupply = ethers.utils.formatUnits(getReserveData.totalAToken, item.assetsDecimals);
                dataTotal.totalSupply = dataTotal.totalSupply + Number(balanceSupply);
            }

            let balanceBorrow = 0;
            if (getReserveData.totalStableDebt || getReserveData.totalVariableDebt) {

                // const totalStableDebt = ethers.utils.formatUnits(getReserveData.totalStableDebt || '0', item.assetsDecimals);
                const totalVariableDebt = ethers.utils.formatUnits(getReserveData.totalVariableDebt || '0', item.assetsDecimals);
                balanceBorrow = totalVariableDebt;
                dataTotal.totalBorrow = dataTotal.totalBorrow + Number(balanceBorrow);

            }

            dataList.push({
                ...item,
                totalSupplied: balanceSupply,
                totalBorrowed: balanceBorrow,
                supplyAPY: parseFloat((depositAPY * 100).toFixed(2)),
                borrowAPY: parseFloat((variableBorrowAPY * 100).toFixed(2)),
                depositAPY,
                variableBorrowAPY
            })

        }


    
        dataTotal.totalBorrow = dataTotal.totalBorrow.toFixed(2);
        dataTotal.totalSupply = dataTotal.totalSupply.toFixed(2);

        dispatch({
            type: marketplaceConstants.FETCH_ASSETS_MARKET_SUCCESS,
            ...dataTotal,
            contractAAVE,
            data: dataList
        });

    } else {
        dispatch({
            type: marketplaceConstants.FETCH_ASSETS_MARKET_SUCCESS,
            ...dataTotal,
            data:[]
        });
    }

    return dataList;

};

export const getCurrentAssets = () => async (dispatch, getState) => {

    const state = getState();

    const { web3 } = state.web3;
    const { listAsset } = state.assetsMarketReducer;

    let dataList = {};

    if (web3 && listAsset.length > 0) {

        for await (const item of listAsset) {

            if (ListKeyISeerOracle[item.assetsChain]) {

                let contractISeerOracle = new web3.eth.Contract(ERC20ABI_ISEER_ORACLE, ListKeyISeerOracle[item.assetsChain]);

                let currentPriceUSD = await contractISeerOracle.methods.latestAnswer().call();

                currentPriceUSD = ethers.utils.formatUnits(currentPriceUSD || '0', 18);;

                dataList[item.assetsAddress] = Number(currentPriceUSD);

            }

        }

        dispatch({
            type: marketplaceConstants.FETCH_ASSETS_PRICE_SUCCESS,
            data: dataList
        });

    }

    return dataList;

};

export const getAccountAssets = (dataAssets) => async (dispatch, getState) => {

    const state = getState();

    const { web3, account } = state.web3;

    let dataList = [];

    if (web3 && account) {

        const contractAAVE = new web3.eth.Contract(ERC20ABI_AAVE, TOKEN_AAVE);

        if (contractAAVE && account) {


            for await (const item of dataAssets) {

                const accountReserve = await contractAAVE.methods.getUserReserveData(item.assetsAddress, account).call();
                
                let balanceSupply = 0;
                if (accountReserve.currentATokenBalance !== "0") {

                    balanceSupply = ethers.utils.formatUnits(accountReserve.currentATokenBalance, item.assetsDecimals);
                    balanceSupply = Number(balanceSupply);

                }

                let balanceBorrow = 0;
                let accountVariableDebt = 0;
                let accountStableDebt = 0;

                if (accountReserve.currentStableDebt || accountReserve.currentVariableDebt) {

                    const currentStableDebt = ethers.utils.formatUnits(accountReserve.currentStableDebt || '0', item.assetsDecimals);
                    accountStableDebt = Number(currentStableDebt);

                    const currentVariableDebt = ethers.utils.formatUnits(accountReserve.currentVariableDebt || '0', item.assetsDecimals);
                    accountVariableDebt = Number(currentVariableDebt);

                    balanceBorrow = accountVariableDebt + accountStableDebt;

                }

                if (balanceSupply || balanceBorrow) {
                  
                    dataList.push({
                        ...item,
                        totalSupplied: balanceSupply,
                        totalBorrowed: balanceBorrow,
                        accountStableDebt: accountStableDebt,
                        accountVariableDebt: accountVariableDebt,
                    })
                  
                }

            }


        }

        dispatch({
            type: marketplaceConstants.FETCH_ACCOUNT_ASSETS_SUCCESS,
            contractAAVE,
            data: dataList
        });

    } else {

        dispatch({
            type: marketplaceConstants.FETCH_ACCOUNT_ASSETS_SUCCESS,
            data: dataList
        });
    }


    return dataList;

};

export const getAccountOverview = () => async (dispatch, getState) => {

    const state = getState();

    const { web3, account } = state.web3;

    const dataPrice = state.assetsPriceReducer.data;
    const dataAccountAssets = state.accountAssetsReducer.data;

    let healthFactor = 0;
    let accountTotalSupplied= 0;
    let accountTotalBorrowed= 0;
    let netAPY = 0;
    let dataList = [];


    if (web3 && account && dataPrice && dataAccountAssets) {

        const contractPOOL = new web3.eth.Contract(ERC20ABI_POOL, ADDRESS_POOL);

        if (contractPOOL && account) {

            try {

                const accountPool = await contractPOOL.methods.getUserAccountData(account).call();
                if (accountPool && accountPool.healthFactor) {
                    healthFactor = ethers.utils.formatUnits(accountPool.healthFactor || '0', 18);
                }

            } catch (error) {
                console.log("error getUserAccountData:", error);
            }

            let supplyAPYChange = 0;
            let borrowAPYChange = 0;

            for await (const item of dataAccountAssets) {

                if(item.totalSupplied){
                    supplyAPYChange =  ((dataPrice[item.assetsAddress] * item.totalSupplied) * item.depositAPY) +supplyAPYChange;
                    accountTotalSupplied = (dataPrice[item.assetsAddress] * item.totalSupplied) + accountTotalSupplied;
                }

                if(item.totalBorrowed){
                    borrowAPYChange =  ((dataPrice[item.assetsAddress] * item.totalBorrowed) * item.variableBorrowAPY) +borrowAPYChange;
                    accountTotalBorrowed = (dataPrice[item.assetsAddress] * item.totalBorrowed) + accountTotalBorrowed;
                }
                
            }

            netAPY =( (supplyAPYChange - borrowAPYChange) / accountTotalSupplied)*100;

        }

        dispatch({
            type: marketplaceConstants.FETCH_ACCOUNT_OVERVIEW_SUCCESS,
            data: {
                accountTotalSupplied,
                accountTotalBorrowed,
                healthFactor,
                netAPY
            }
        });

    } else {

        dispatch({
            type: marketplaceConstants.FETCH_ACCOUNT_OVERVIEW_SUCCESS,
            healthFactor
        });
    }

    return dataList;

};

export const reloadAccountAssets = () => async (dispatch, getState) => {

    const state = getState();

    const { web3, account } = state.web3;

    if (web3 && account) {

        setTimeout(async () => {
            await dispatch(getAccountAssets());
            await dispatch(getMarketAssets());
        }, 3000);

        setTimeout(async () => {
            await dispatch(getAccountAssets());
            await dispatch(getMarketAssets());
        }, 6000);

    }

};
