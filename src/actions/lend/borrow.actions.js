
import { ethers } from 'ethers';

import { marketplaceConstants } from '../../constants';

import ERC20ABI_VB from '../../_contracts/assets/VB.json';
import ERC20ABI_WETH_GETAWAY from '../../_contracts/lend/WETHGateway.json';
import ERC20ABI_POOL from '../../_contracts/lend/Pool.json';
import ERC20ABI_AAVE from '../../_contracts/lend/AaveProtocolDataProvider.json';

import ERC20ABI_STABLE_DEBT_TOKEN from '../../_contracts/lend/StableDebtToken.json';
import ERC20ABI_VARIBLE_DEBT_TOKEN from '../../_contracts/lend/VariableDebtToken.json';

import { formatLocaleString, numberWithCommas, randomKeyUUID } from '../../utils/lib';
import * as actions from '../.';


const TOKEN_AAVE = process.env.REACT_APP_ADDRESS_PROTOCOL;
const ADDRESS_GATEWAY = process.env.REACT_APP_ADDRESS_GATEWAY; // WETHGateway (chinh là VET Asset)
const ADDRESS_POOL = process.env.REACT_APP_ADDRESS_POOL;

// ------------------------ BORROW ------------------------ //

/**
 * 
 * @param {*} dataToken 
 * @returns dispatch strore
 * 
 */
export const loadModalBorrow = (dataToken) => async (dispatch, getState) => {

    const state = getState();
    const { web3, account } = state.web3;

    const dataPrice = state.assetsPriceReducer.data;

    let accountBalance = 0;
    let accountApprove = 0;
    // let contractBorrow;

    let accountStableDebtApprove = 0;
    let accountVariableDebtApprove = 0;

    if(!account){
        dispatch(actions.web3Connect(true));
        return;
    }

    const contractAAVE = new web3.eth.Contract(ERC20ABI_AAVE, TOKEN_AAVE);
    const contractPOOL = new web3.eth.Contract(ERC20ABI_POOL, ADDRESS_POOL);

    dispatch({
        type: marketplaceConstants.MODAL_OPEN_BORROW_MARKET,
        dataToken,
        accountBalance,
        loading:true,
    });

    if(contractPOOL){

        const accountData = await contractPOOL.methods.getUserAccountData(account).call();
        console.log("accountData",accountData);

        if (accountData.availableBorrowsBase) {
            accountBalance = ethers.utils.formatUnits(accountData.availableBorrowsBase, 18);
            accountBalance = accountBalance / dataPrice[dataToken.assetsAddress];
        }

        if(contractAAVE ){

            const getReserveData = await contractAAVE.methods.getReserveData(dataToken.assetsAddress).call();
            console.log("getReserveData", getReserveData);

            let totalUserCollateralPool = getReserveData.totalAToken - (getReserveData.totalStableDebt  + getReserveData.totalVariableDebt)
            totalUserCollateralPool = totalUserCollateralPool.toLocaleString('fullwide', {useGrouping:false});
            totalUserCollateralPool = ethers.utils.formatUnits(totalUserCollateralPool, dataToken.assetsDecimals);

            // Tổng pool có chép borrow nhỏ hơn giá trị user có thể variableBorrowRate
            if(Number(totalUserCollateralPool) < Number(accountBalance)){
                accountBalance = totalUserCollateralPool;
            }
            
        }
        
    }
  
    if (dataToken.assetsChain === "VET") {

        // check approveDelegation
        // let contractStableDebt = new web3.eth.Contract(ERC20ABI_STABLE_DEBT_TOKEN, process.env.REACT_APP_STABLE_DEBT_TOKEN_VET);
        // accountStableDebtApprove = await contractStableDebt.methods.borrowAllowance(account, ADDRESS_GATEWAY).call();
        // accountStableDebtApprove = ethers.utils.formatEther(accountStableDebtApprove);
        // accountStableDebtApprove = Number(accountStableDebtApprove);

        // check approveDelegation
        let contractVariableDebt = new web3.eth.Contract(ERC20ABI_VARIBLE_DEBT_TOKEN, process.env.REACT_APP_VARIABLE_DEBT_TOKEN_VET);
        accountVariableDebtApprove = await contractVariableDebt.methods.borrowAllowance(account, ADDRESS_GATEWAY).call();

        accountVariableDebtApprove = ethers.utils.formatEther(accountVariableDebtApprove);
        accountVariableDebtApprove = Number(accountVariableDebtApprove);

        accountApprove = accountVariableDebtApprove;


    } else {

        const contractBorrow = new web3.eth.Contract(ERC20ABI_VB, dataToken.assetsAddress);

        // get the approved ADDRESS_POOL
        accountApprove = await contractBorrow.methods.allowance(account, ADDRESS_POOL).call();
        accountApprove = ethers.utils.formatUnits(accountApprove, dataToken.assetsDecimals);
        accountApprove = Number(accountApprove);

    }


    dispatch({
        type: marketplaceConstants.MODAL_OPEN_BORROW_MARKET,
        loading:false,
        accountApprove,
        accountStableDebtApprove,
        accountVariableDebtApprove,
        accountBalance: formatLocaleString(accountBalance,dataToken.assetsDecimals),
        dataToken
    });

};


/**
 * 
 * @param {*} dataToken 
 * @param {*} rateMode 
 * @returns 
 * interestRateMode: 0, 1, 2  => 0: None, 1: Stable, 2: Variable
 */

export const approveBorrow = (dataToken, rateMode) => async (dispatch, getState) => {

    const state = getState();
    const { web3, account, connex } = state.web3;

    let amountApprove = 999999999;

    if (account && dataToken.assetsAddress && rateMode) {
        const key = randomKeyUUID();

        dispatch(actions.alertActions.loading({
            title: "Waiting For Approve",
            description: `Approve borrow ${dataToken.assetsChain} on VeBank`,
          }, key));

        let approveABI;
        let TOKEN_APPROVE;
        let approveMethod;

        if (dataToken.assetsChain === "VET") {

            TOKEN_APPROVE = ADDRESS_GATEWAY;

            if (rateMode === 1) {
                approveABI = ERC20ABI_STABLE_DEBT_TOKEN.find(({ name, type }) => (name === "approveDelegation" && type === "function"));
                approveMethod = connex.thor.account(process.env.REACT_APP_STABLE_DEBT_TOKEN_VET).method(approveABI);
            }

            if (rateMode === 2) {
                approveABI = ERC20ABI_VARIBLE_DEBT_TOKEN.find(({ name, type }) => (name === "approveDelegation" && type === "function"));
                approveMethod = connex.thor.account(process.env.REACT_APP_VARIABLE_DEBT_TOKEN_VET).method(approveABI);
            }


        } else {
            TOKEN_APPROVE = ADDRESS_POOL;
            approveABI = { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }
            approveMethod = connex.thor.account(dataToken.assetsAddress).method(approveABI);
        }

        if (approveMethod) {
            approveMethod.transact(TOKEN_APPROVE, web3.utils.toWei(amountApprove.toString()))
                .comment(`approve ${dataToken.assetsChain} on VeBank`)
                .request()
                .then(result => {
                    dispatch({
                        type: marketplaceConstants.MODAL_OPEN_BORROW_MARKET,
                        accountApprove: amountApprove
                    });
                    dispatch(actions.alertActions.update({
                        status: "success",
                        title: "Approve success",
                        description: `Approve borrow ${dataToken.assetsChain} on VeBank success!`,
                      }, key));
                    return result;

                }).catch((e) => {
                    console.log("error----", e);
                    dispatch(actions.alertActions.update({
                        status: "warning",
                        title: "Approve Borrow Rejected",
                        description: e.message
                      }, key));
                    return e;
                });
        }
    }


};


/**
 * 
 * @param {number} id 
 * @returns dispatch strore
 *  borrow(addressAsset, amount, interestRateMode, referralCode, userAddress)  Ex: borrow(0x0fa8DC6200255Fc3382CDDb4B5358d7713D99c8d, "5000000000000000000", 1, 0, 0xeC310e7cC338f9087CaAcf291ba5023B3326626F)
 * 
 * 
 */
export const borrowMarket = (dataToken, amount, rateMode) => async (dispatch, getState) => {

    const state = getState();

    const { account, connex } = state.web3;

    console.log("borrowMarket",amount,dataToken);

    if (connex && account && dataToken.assetsAddress) {

        const key = randomKeyUUID();

        dispatch(actions.alertActions.loading({
            title: "Waiting For Confirmation",
            description: `Borrow ${amount} ${dataToken.assetsChain}`,
          }, key));

        dispatch({
            type: marketplaceConstants.MODAL_BORROW_MARKET_REQUEST
        });

        const borrowABI = ERC20ABI_POOL.find(({ name, type }) => (name === "borrow" && type === "function"));
console.log("borrowABI",borrowABI);
        const methodBorrow = connex.thor.account(ADDRESS_POOL).method(borrowABI);

        console.log("methodBorrow",methodBorrow);
        const amountBorrow = ethers.utils.parseUnits(amount.toString(), dataToken.assetsDecimals);

        console.log("amountBorrow",amountBorrow);

        methodBorrow.transact(dataToken.assetsAddress, amountBorrow, rateMode, 0, account)
            .comment(`transfer ${amount} ${dataToken.assetsChain} to Borrow VeBank`)
            .request()
            .then(transaction => {

                dispatch({
                    type: marketplaceConstants.MODAL_BORROW_MARKET_SUCCESS,
                    transaction: 1
                });

                dispatch(actions.alertActions.update({
                    status: "success",
                    title: "Transaction Submitted",
                    description: `Transfer ${amount} ${dataToken.assetsChain} to Borrow VeBank`,
                  }, key));

                return transaction;

            }).catch((e) => {

                console.log("error----", e);
                dispatch({
                    type: marketplaceConstants.MODAL_BORROW_MARKET_ERROR
                });
                dispatch(actions.alertActions.update({
                    status: "warning",
                    title: "Transaction Borrow Rejected",
                    description: e.message
                  }, key));
                return e;

            });

    }


};


/**
 * 
 * @param {number} id 
 * @returns dispatch strore
 * borrowETH(PoolAddress, amount, interestRateMode, referralCode) await iWETHGateway.borrowETH("0x", "80000000000000000", 2, 0);
 * "interestRateMode: 0, 1, 2 => 0: None, 1: Stable, 2: Variable"
 */
export const borrowETHMarket = (addressAsset, amount, rateMode) => async (dispatch, getState) => {

    const state = getState();

    const { web3, account, connex } = state.web3;

    if (connex && account && amount) {

        const key = randomKeyUUID();

        dispatch(actions.alertActions.loading({
            title: "Waiting For Confirmation",
            description: `Borrow ${amount} ${addressAsset.assetsChain}`,
        }, key));

        dispatch({
            type: marketplaceConstants.MODAL_BORROW_MARKET_REQUEST
        });

        const amountBorrow = web3.utils.toWei(amount.toString());

        const borrowETH_ABI = ERC20ABI_WETH_GETAWAY.find(({ name, type }) => name === "borrowETH" && type === "function");
        const methodBorrow = connex.thor.account(ADDRESS_GATEWAY).method(borrowETH_ABI);

        methodBorrow.transact(ADDRESS_POOL, amountBorrow, rateMode, 0)
            .comment(`transfer ${amount} VET to borrowETH`)
            .request()
            .then(transaction => {

                dispatch({
                    type: marketplaceConstants.MODAL_BORROW_MARKET_SUCCESS,
                    transaction: 1
                });

                dispatch(actions.alertActions.update({
                    status: "success",
                    title: "Transaction Submitted",
                    description: `Transfer ${amount} VET to borrowETH`,
                  }, key));

                return transaction;

            }).catch((e) => {
                console.log("error----", e);
                dispatch({
                    type: marketplaceConstants.MODAL_BORROW_MARKET_ERROR
                });
                dispatch(actions.alertActions.update({
                    status: "warning",
                    title: "Transaction Borrow Rejected",
                    description: e.message
                  }, key));
                return e;

            });

    }


};

