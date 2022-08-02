import { ethers } from 'ethers';

import {  marketplaceConstants } from '../../constants';

import ERC20ABI from '../../_contracts/abi-erc20.json';
import ERC20ABI_AAVE from '../../_contracts/lend/AaveProtocolDataProvider.json';
import ERC20ABI_WETH_GETAWAY from '../../_contracts/lend/WETHGateway.json';
import ERC20ABI_POOL from '../../_contracts/lend/Pool.json';
import ERC20ABI_VARIBLE_DEBT_TOKEN from '../../_contracts/lend/VariableDebtToken.json';



import { randomKeyUUID } from '../../utils/lib';
import * as actions from '../.';

const ADDRESS_GATEWAY = process.env.REACT_APP_ADDRESS_GATEWAY; // WETHGateway (chinh là VET Asset)
const ADDRESS_POOL = process.env.REACT_APP_ADDRESS_POOL;
const TOKEN_AAVE = process.env.REACT_APP_ADDRESS_PROTOCOL;

const approveABI = ERC20ABI.find(({ name, type }) => (name === "approve" && type === "function"));

// ------------------------ REPAY ------------------------ //

/**
 * 
 * @param {*} dataToken 
 * @returns dispatch strore
 * 
 */
export const loadModalRepay = (dataToken) => async (dispatch, getState) => {

    const state = getState();
    const { web3, account } = state.web3;

    let accountBalance = 0;
    let accountApprove = 0;
    // let contractBorrow;

    if (!account || !dataToken) {
        return;
    }

    const contractAAVE = new web3.eth.Contract(ERC20ABI_AAVE, TOKEN_AAVE);

    let accountBalanceStableDebt = 0;
    let accountBalanceVariableDebt = 0;

    let accountVariableDebtApprove = 0;
    let accountStableDebtApprove = 0;

    dispatch({
        type: marketplaceConstants.MODAL_OPEN_REPAY_MARKET,
        loading: true,
        accountApprove,
        accountBalance,
        dataToken
    });

    if (dataToken.assetsAddress && contractAAVE) {

        const accountReserve = await contractAAVE.methods.getUserReserveData(dataToken.assetsAddress, account).call();

        // console.log("getUserReserveData", accountReserve);

        if (accountReserve.currentVariableDebt !== "0") {
            accountBalanceVariableDebt = ethers.utils.formatUnits(accountReserve.currentVariableDebt, dataToken.assetsDecimals);
            // console.log("accountBalanceVariableDebt", accountBalanceVariableDebt)
            // accountBalanceVariableDebt = Math.round(accountBalanceVariableDebt * 100) / 100;
            // accountBalanceVariableDebt = Number(accountBalanceVariableDebt);
        }

        if (accountReserve.currentStableDebt !== "0") {
            accountBalanceStableDebt = ethers.utils.formatUnits(accountReserve.currentStableDebt, dataToken.assetsDecimals);
            // accountBalanceStableDebt = Math.round(accountBalanceStableDebt * 100) / 100;
            // accountBalanceStableDebt = Number(accountBalanceStableDebt);
        }

        // gia tri dc repay
        accountBalance = accountBalanceVariableDebt;

        const contractBorrow = new web3.eth.Contract(ERC20ABI, dataToken.assetsAddress);
        accountApprove = await contractBorrow.methods.allowance(account, ADDRESS_POOL).call();
  
        if(accountApprove){
            // get the approved ADDRESS_POOL
            accountApprove = ethers.utils.formatUnits(accountApprove, dataToken.assetsDecimals);
            accountApprove = Number(accountApprove);
        }

    }

    dispatch({
        type: marketplaceConstants.MODAL_OPEN_REPAY_MARKET,
        loading: false,
        accountApprove,
        accountStableDebtApprove,
        accountVariableDebtApprove,
        accountBalanceStableDebt,
        accountBalanceVariableDebt,
        accountBalance,
        dataToken
    });

};

export const approveRepay = (dataToken) => async (dispatch, getState) => {

    const state = getState();

    const { web3, account, connex } = state.web3;

    const amountMax = 1000000000;

    if (account && dataToken.assetsAddress) {

        const key = randomKeyUUID();

        dispatch(actions.alertActions.loading({
            title: "Waiting For Approve",
            description: `Approve Supply ${dataToken.assetsChain} on VeBank`,
        }, key));

        const approveMethod = connex.thor.account(dataToken.assetsAddress).method(approveABI);

        let TOKEN_APPROVE = ADDRESS_POOL;

        approveMethod
            .transact(TOKEN_APPROVE, web3.utils.toWei(amountMax.toString()))
            .comment(`approve ${dataToken.assetsChain} on VeBank`)
            .request()
            .then(result => {

                dispatch({
                    type: marketplaceConstants.MODAL_OPEN_REPAY_MARKET,
                    accountApprove: amountMax
                });

                dispatch(actions.alertActions.update({
                    status: "success",
                    title: "Approve success",
                    description: `Approve supply ${dataToken.assetsChain} on VeBank success!`,
                }, key));

                return result;

            }).catch((e) => {

                console.log("error----", e);
                dispatch(actions.alertActions.update({
                    status: "warning",
                    title: "Approve Supply Rejected",
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
 *  borrow(addressAsset, amount, interestRateMode, referralCode, userAddress)  Ex: borrow(0x0fa8DC6200255Fc3382CDDb4B5358d7713D99c8d, "5000000000000000000", 1, 0, 0xeC310e7cC338f9087CaAcf291ba5023B3326626F)
 * 
 */
export const repayMarket = (dataToken, amount, rateMode = 2) => async (dispatch, getState) => {

    const state = getState();

    const { web3, account, connex } = state.web3;

    if (connex && account && dataToken.assetsAddress && rateMode) {

        const key = randomKeyUUID();

        dispatch(actions.alertActions.loading({
            title: "Waiting For Confirmation",
            description: `Repay ${amount} ${dataToken.assetsChain}`,
          }, key));

        dispatch({ type: marketplaceConstants.MODAL_WITHDRAW_MARKET_REQUEST });

        //let amountRepay = web3.utils.toWei(amount.toString());

        let amountRepay = ethers.utils.parseUnits(amount.toString(), dataToken.assetsDecimals);
        let amountApprove = 999999999;

        // approve Atoken 
        let approveMethod = connex.thor.account(dataToken.assetsAddress).method(approveABI);

        const c1_approve = approveMethod.asClause(ADDRESS_POOL, web3.utils.toWei(amountApprove.toString()));

        const withdrawETH_ABI = ERC20ABI_POOL.find(({ name, type }) => name === "repay" && type === "function");
        const methodRepay = connex.thor.account(ADDRESS_POOL).method(withdrawETH_ABI);
        const c2_repay = methodRepay.asClause(dataToken.assetsAddress, amountRepay, rateMode, account);

        let clauses = [c2_repay];
        if(amount >= amountApprove){
            clauses.push(c1_approve);
        }

        connex.vendor
            .sign('tx', clauses)
            .comment(`transfer ${amount} ${dataToken.assetsChain} to Repay on VeBank`)
            .request()
            .then(transaction => {

                dispatch({
                    type: marketplaceConstants.MODAL_REPAY_MARKET_SUCCESS,
                    transaction: 1
                });

                dispatch(actions.alertActions.update({
                    status: "success",
                    title: "Transaction Submitted",
                    description: `Transfer ${amount} ${dataToken.assetsChain} to Repay VeBank`,
                  }, key));

                return transaction;

            }).catch((e) => {

                console.log("error----", e);
                dispatch({
                    type: marketplaceConstants.MODAL_REPAY_MARKET_ERROR
                });
                dispatch(actions.alertActions.update({
                    status: "warning",
                    title: "Transaction Repay Rejected",
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
export const repayETHMarket = (dataToken, amount, rateMode = 2) => async (dispatch, getState) => {

    const state = getState();

    const { web3, account, connex } = state.web3;

    // let contractGATEWAY = new web3.eth.Contract(ERC20ABI_WETH_GETAWAY, ADDRESS_GATEWAY);
    // console.log("repayETHMarket", connex, account, amount);

    if (connex && account && amount) {

        const key = randomKeyUUID();

        dispatch(actions.alertActions.loading({
            title: "Waiting For Confirmation",
            description: `Repay ${amount} ${dataToken.assetsChain}`,
          }, key));

        dispatch({
            type: marketplaceConstants.MODAL_WITHDRAW_MARKET_REQUEST
        });

        const amountRepay = web3.utils.toWei(amount.toString());
        let amountApprove = 999999999;

        // approve Atoken to move my 1e18 wei VeThor
        const approveABI = ERC20ABI_VARIBLE_DEBT_TOKEN.find(({ name, type }) => (name === "approveDelegation" && type === "function"));
        let approveMethod = connex.thor.account(process.env.REACT_APP_VARIABLE_DEBT_TOKEN_VET).method(approveABI);

        // console.log(process.env.REACT_APP_VARIABLE_DEBT_TOKEN_VET, ADDRESS_GATEWAY, amountRepay);
        const c1_approve = approveMethod.asClause(ADDRESS_GATEWAY, web3.utils.toWei(amountApprove.toString()));

        const repayETH_ABI = ERC20ABI_WETH_GETAWAY.find(({ name, type }) => name === "repayETH" && type === "function");
        const methodRepay = connex.thor.account(ADDRESS_GATEWAY).method(repayETH_ABI);

        methodRepay.value(amountRepay);
        const c2_repay = methodRepay.asClause(ADDRESS_POOL, amountRepay, rateMode, account);

        let clauses = [c2_repay];
        if(amount >= amountApprove){
            clauses.push(c1_approve);
        }

        connex.vendor
            .sign('tx',clauses)
            .comment(`transfer ${amount} VET to Repay on VeBank`)
            .request()
            .then(transaction => {

                dispatch({
                    type: marketplaceConstants.MODAL_REPAY_MARKET_SUCCESS,
                    transaction: 1
                });

                dispatch(actions.alertActions.update({
                    status: "success",
                    title: "Transaction Submitted",
                    description: `Transfer ${amount} VET to repayETH`,
                  }, key));

                return transaction;

            }).catch((e) => {

                console.log("error----", e);
                dispatch({
                    type: marketplaceConstants.MODAL_REPAY_MARKET_ERROR
                });

                dispatch(actions.alertActions.update({
                    status: "warning",
                    title: "Transaction Repay Rejected",
                    description: e.message
                  }, key));

                return e;

            });

    }


};
