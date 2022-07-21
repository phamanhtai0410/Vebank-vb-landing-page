import { ethers } from 'ethers';

import { marketplaceConstants } from '../constants';

import * as actions from './';

import ERC20ABI_AAVE from '../_contracts/lend/AaveProtocolDataProvider.json';
import ERC20ABI_POOL from '../_contracts/lend/Pool.json';
import ERC20ABI_ISEER_ORACLE from '../_contracts/SeerOracle.json';


// VET : dung de staking duy tri he thong
// VTH0 : dung de tra vi chay smart Contract

const TOKEN_AAVE = process.env.REACT_APP_ADDRESS_PROTOCOL;
const ADDRESS_POOL = process.env.REACT_APP_ADDRESS_POOL;

const ListKeyISeerOracle = {
    "VET": process.env.REACT_APP_ISO_VET,
    "VTHO": process.env.REACT_APP_ISO_VETHO,
    "VB": process.env.REACT_APP_ISO_VB,
    "VEUSD": process.env.REACT_APP_ISO_VEUSD
}

export const getMarketAssets = (isCurrentUSD) => async (dispatch, getState) => {

    const state = getState();

    const { web3 } = state.web3;
    const { data } = state.assetsMarketReducer;

    let dataTotal = {
        totalSupply: 0,
        totalBorrow: 0
    }

    let dataList = [];

    if (web3 && TOKEN_AAVE && data.length > 0) {

        let contractAAVE = new web3.eth.Contract(ERC20ABI_AAVE, TOKEN_AAVE);

        const RAY = 10**27; // 10 to the power 27
        const SECONDS_PER_YEAR = 31536000;

        for await (const item of data) {

            const getReserveData = await contractAAVE.methods.getReserveData(item.assetsAddress).call();
            
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

            // if (isCurrentUSD && ListKeyISeerOracle[item.assetsChain]) {
            //     let contractISeerOracle = new web3.eth.Contract(ERC20ABI_ISEER_ORACLE, ListKeyISeerOracle[item.assetsChain]);
            //     const currentPrice = await contractISeerOracle.methods.latestAnswer().call();
            //     console.log(currentPrice);
            // }

            //const dataConfig = await contractAAVE.methods.getReserveConfigurationData(item.assetsAddress).call();

            let balanceSupply = 0;
            if (getReserveData.totalAToken) {
                balanceSupply = ethers.utils.formatUnits(getReserveData.totalAToken, item.assetsDecimals);
                dataTotal.totalSupply = dataTotal.totalSupply + Number(balanceSupply);
            }

            let balanceBorrow = 0;
            if (getReserveData.totalStableDebt || getReserveData.totalVariableDebt) {

                // const totalStableDebt = ethers.utils.formatUnits(getReserveData.totalStableDebt || '0', item.assetsDecimals);
                const totalVariableDebt = ethers.utils.formatUnits(getReserveData.totalVariableDebt || '0', item.assetsDecimals);

                // balanceBorrow = Number(totalStableDebt) + Number(totalVariableDebt);
                balanceBorrow = totalVariableDebt;
                //balanceBorrow = Math.round((balanceBorrow) * 100) / 100;

                dataTotal.totalBorrow = dataTotal.totalBorrow + Number(balanceBorrow);

            }

            dataList.push({
                ...item,
                totalSupplied: balanceSupply,
                totalBorrowed: balanceBorrow,
                supplyAPY: parseFloat((depositAPY * 100).toFixed(5)),
                borrowAPY: parseFloat((variableBorrowAPY * 100).toFixed(5))
            })

        }

        dataTotal.totalBorrow = dataTotal.totalBorrow.toFixed(2)
        dataTotal.totalSupply = dataTotal.totalSupply.toFixed(2)

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
            data
        });
    }

    return dataList;

};

export const getCurrentAssets = () => async (dispatch, getState) => {

    const state = getState();

    const { web3 } = state.web3;
    const { data } = state.assetsMarketReducer;

    let dataList = {};

    if (web3 && data.length > 0) {

        for await (const item of data) {

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

export const getAccountOverview = () => async (dispatch, getState) => {

    const state = getState();

    const { web3, account } = state.web3;

    const dataPrice = state.assetsPriceReducer.data;
    const dataAccountAssets = state.accountAssetsReducer.data;

    let healthFactor = 0;
    let dataList = [];

    if (web3 && account && dataPrice && dataAccountAssets) {

        const contractPOOL = new web3.eth.Contract(ERC20ABI_POOL, ADDRESS_POOL);

        let accountTotalSupplied= 0;
        let accountTotalBorrowed= 0;

        if (contractPOOL && account) {

            try {

                const accountPool = await contractPOOL.methods.getUserAccountData(account).call();
                if (accountPool && accountPool.healthFactor) {
                    healthFactor = ethers.utils.formatUnits(accountPool.healthFactor || '0', 18);
                }

            } catch (error) {
                console.log("error getUserAccountData:", error);
            }

            for await (const item of dataAccountAssets) {

                if(item.totalSupplied){
                    accountTotalSupplied = (dataPrice[item.assetsAddress] * item.totalSupplied) + accountTotalSupplied;
                }

                if(item.totalBorrowed){
                    accountTotalBorrowed = (dataPrice[item.assetsAddress] * item.totalBorrowed) + accountTotalBorrowed;
                }
                
            }

        }

        dispatch({
            type: marketplaceConstants.FETCH_ACCOUNT_OVERVIEW_SUCCESS,
            data: {
                accountTotalSupplied,
                accountTotalBorrowed,
                healthFactor
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

export const getAccountAssets = () => async (dispatch, getState) => {

    const state = getState();

    const { web3, account } = state.web3;
    const { data } = state.assetsMarketReducer;

    let dataList = [];

    if (web3 && account) {

        const contractAAVE = new web3.eth.Contract(ERC20ABI_AAVE, TOKEN_AAVE);

        if (contractAAVE && account) {

            for await (const item of data) {

                const accountReserve = await contractAAVE.methods.getUserReserveData(item.assetsAddress, account).call();
                
                let balanceSupply = 0;
                if (accountReserve.currentATokenBalance !== "0") {

                    balanceSupply = ethers.utils.formatUnits(accountReserve.currentATokenBalance, item.assetsDecimals);
                    balanceSupply = Number(balanceSupply);

                    // console.log("balanceSupply",balanceSupply);
                    // balanceSupplyUSD = dataPrice[item.assetsAddress] * balanceSupply;
                    // console.log("balanceSupplyUSD",balanceSupplyUSD);
                    // dataUser.accountSupplyBalance = dataUser.accountSupplyBalance + balanceSupplyUSD;

                }

                let balanceBorrow = 0;
                let accountVariableDebt = 0;
                let accountStableDebt = 0;

                if (accountReserve.currentStableDebt || accountReserve.currentVariableDebt) {

                    const currentStableDebt = ethers.utils.formatUnits(accountReserve.currentStableDebt || '0', item.assetsDecimals);
                    accountStableDebt = Number(currentStableDebt);

                    const currentVariableDebt = ethers.utils.formatUnits(accountReserve.currentVariableDebt || '0', item.assetsDecimals);
                    accountVariableDebt = Number(currentVariableDebt);

                    //balanceBorrow = accountStableDebt + accountVariableDebt;
                    balanceBorrow = accountVariableDebt;
                    // balanceBorrow = Math.round((balanceBorrow) * 100) / 100;

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

            // dataUser.accountSupplyBalance = Number(dataUser.accountSupplyBalance.toFixed(2));
            // dataUser.accountBorrowBalance = Number(dataUser.accountBorrowBalance.toFixed(2));

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

export const reloadAccountAssets = (addressAsset) => async (dispatch, getState) => {

    const state = getState();
    const { web3, account } = state.web3;

    if (web3 && account) {

        await dispatch(actions.instantiateVetContracts());
        await dispatch(actions.instantiateVBContracts());
        await dispatch(actions.instantiateVEUSDContracts());

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
