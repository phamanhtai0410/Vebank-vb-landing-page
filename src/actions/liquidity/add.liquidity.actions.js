import { ethers, FixedNumber } from "ethers";

import { poolConstants } from "../../constants";

import ERC20ABI_ROUTER from "../../_contracts/pool/VeBankV1Router02.json";
import ERC20ABI_FACTORY from "../../_contracts/pool/VeBankV1Factory.json";
import ERC20ABI_PAIR from "../../_contracts/pool/VeBankV1Pair.json";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { selectAssetByAddress } from "../../reducers/assetsMarket.reducer";
import {
  selectFirstToken as _selectFirstToken,
  selectSecondToken as _selectSecondToken,
} from "../../reducers/liquid.reducer";
import assetAbi from "../../_contracts/asset-abi";
import {
  getAmountInWeiFormatted,
  getDecimalForAsset,
  isContainVET,
} from "../../utils/lib";
import assert from "assert";
import PartialConstants from "../../constants/partial.constants";
import * as actions from "../index";

const ADDRESS_ROUTER = process.env.REACT_APP_ADDRESS_ROUTER;
const ADDRESS_FACTORY = process.env.REACT_APP_ADDRESS_FACTORY;

// ------------------------ ADD LIQUIDITY ------------------------ //

export const loadSelectToken = (dataToken) => ({
  type: poolConstants.MODAL_OPEN_SELECT_TOKEN,
  dataToken,
});

export const setFirstToken = (firstToken) => ({
  type: poolConstants.SELECT_FIRST_TOKEN,
  payload: firstToken,
});

export const setSecondToken = (secondToken) => ({
  type: poolConstants.SELECT_SECOND_TOKEN,
  payload: secondToken,
});

export const selectFirstToken = () => ({
  type: poolConstants.MODAL_OPEN_SELECT_FIRST_TOKEN,
});

export const selectSecondToken = () => ({
  type: poolConstants.MODAL_OPEN_SELECT_SECOND_TOKEN,
});

export const selectToken = (dataToken) => ({
  type: poolConstants.MODAL_SELECT_TOKEN,
  payload: dataToken,
});

export const selectDefaultFirstToken = (dataToken) => ({
  type: poolConstants.MODAL_DEFAULT_FIRST_TOKEN,
  payload: dataToken,
});

export const selectDefaultSecondToken = (dataToken) => ({
  type: poolConstants.MODAL_DEFAULT_SECOND_TOKEN,
  payload: dataToken,
});

export const closeSelectToken = () => ({
  type: poolConstants.MODAL_CLOSE_SELECT_TOKEN,
});

export const clearSelectedTokens = () => ({
  type: poolConstants.LIQUIDITY_CLEAR_SELECTED_TOKENS,
});

export const approveFirstTokenAddLiquidity = createAsyncThunk(
  poolConstants.APPROVE_FIRST_TOKEN,
  async (tokenAddress, { getState }) => {
    if (!tokenAddress) return;

    const state = getState();

    const { web3, account, connex } = state.web3;

    const tokenAbi = assetAbi[tokenAddress];
    const contractAddLiquidity = new web3.eth.Contract(tokenAbi, tokenAddress);

    const tokenInfo = selectAssetByAddress(state, tokenAddress);

    const amountMax = 1_000_000_000;

    if (account && contractAddLiquidity && tokenAddress) {
      const approveABI = tokenAbi.find(
        ({ name, type }) => name === "approve" && type === "function"
      );

      const approveMethod = connex.thor
        .account(tokenAddress)
        .method(approveABI);

      const result = await approveMethod
        .transact(ADDRESS_ROUTER, web3.utils.toWei(amountMax.toString()))
        .comment(
          `approve ${tokenInfo.assetsChain} on Pool router ${ADDRESS_ROUTER}`
        )
        .request();

      return { result, approveTokenA: amountMax };
      
    }
  }
);

export const approveSecondTokenAddLiquidity = createAsyncThunk(
  poolConstants.APPROVE_SECOND_TOKEN,
  async (tokenAddress, { getState }) => {
    if (!tokenAddress) return;

    const state = getState();

    const { web3, account, connex } = state.web3;
    const tokenAbi = assetAbi[tokenAddress];
    const contractAddLiquidity = new web3.eth.Contract(tokenAbi, tokenAddress);

    const tokenInfo = selectAssetByAddress(state, tokenAddress);

    const amountMax = 1_000_000_000;

    if (account && contractAddLiquidity && tokenAddress) {
      const approveABI = tokenAbi.find(
        ({ name, type }) => name === "approve" && type === "function"
      );
      const approveMethod = connex.thor
        .account(tokenAddress)
        .method(approveABI);

      const result = await approveMethod
        .transact(ADDRESS_ROUTER, web3.utils.toWei(amountMax.toString()))
        .comment(
          `approve ${tokenInfo.assetsChain} on Pool router ${ADDRESS_ROUTER}`
        )
        .request();

      return { result, approveTokenB: amountMax };
    }
  }
);

export const checkApproval = createAsyncThunk(
  "addLiquidity/checkApproval",
  async ({ firstTokenAddress, secondTokenAddress }, { getState }) => {
    assert(firstTokenAddress, "Missing first token address");
    assert(secondTokenAddress, "Missing second token address");

    const currentState = getState();
    const { web3, account } = currentState.web3;

    let approveTokenA = 0;
    let approveTokenB = 0;

    const contractTokenA = new web3.eth.Contract(
      assetAbi[firstTokenAddress],
      firstTokenAddress
    );

    approveTokenA = await contractTokenA.methods
      .allowance(account, ADDRESS_ROUTER)
      .call();
    approveTokenA = ethers.utils.formatUnits(
      approveTokenA,
      getDecimalForAsset(firstTokenAddress)
    );
    approveTokenA = Number(approveTokenA);

    const contractTokenB = new web3.eth.Contract(
      assetAbi[secondTokenAddress],
      secondTokenAddress
    );

    approveTokenB = await contractTokenB.methods
      .allowance(account, ADDRESS_ROUTER)
      .call();
    approveTokenB = ethers.utils.formatUnits(
      approveTokenB,
      getDecimalForAsset(secondTokenAddress)
    );
    approveTokenB = Number(approveTokenB);

    return { approveTokenA, approveTokenB };
  }
);

export const loadDetailAddLiquidity = createAsyncThunk(
  poolConstants.LOAD_DETAIL_ADD_LIQUIDITY,
  async (poolAddress, { getState, dispatch }) => {
    const currentState = getState();
    const { web3, account } = currentState.web3;
    let firstTokenAddress, secondTokenAddress, contractPair;

    if (poolAddress) {
      contractPair = new web3.eth.Contract(ERC20ABI_PAIR, poolAddress);
      firstTokenAddress = await contractPair.methods.token0().call();
      secondTokenAddress = await contractPair.methods.token1().call();
      firstTokenAddress && dispatch(setFirstToken(firstTokenAddress));
      secondTokenAddress && dispatch(setSecondToken(secondTokenAddress));
    } else {
      console.log("No pool address");
      firstTokenAddress = _selectFirstToken(currentState);
      secondTokenAddress = _selectSecondToken(currentState);
    }

    // let approveTokenA = 0;
    // let approveTokenB = 0;
    let reserveA = 0;
    let reserveB = 0;
    let totalSupply = 0;
    let liquidityPool = 0;
    let abExchangeRate, baExchangeRate;

    if (firstTokenAddress && secondTokenAddress) {
      const assetsDecimal = PartialConstants.DEFAULT_ASSET_DECIMAL;
      // getDecimalForAssetPair(
      //   firstTokenAddress,
      //   secondTokenAddress
      // );

      let contractFactory = new web3.eth.Contract(
        ERC20ABI_FACTORY,
        ADDRESS_FACTORY
      );

      if (!poolAddress) {
        poolAddress = await contractFactory.methods
          .getPair(firstTokenAddress, secondTokenAddress)
          .call();
      }

      const emptyAddress = /^0x0+$/.test(poolAddress); // true chưa có

      if (emptyAddress === false && !contractPair) {
        contractPair = new web3.eth.Contract(ERC20ABI_PAIR, poolAddress);
      }

      if (emptyAddress === false && contractPair) {
        const reserves = await contractPair.methods?.getReserves().call();
        const _firstTokenAddress = await contractPair.methods.token0().call();
        const _secondTokenAddress = await contractPair.methods.token1().call();
        reserveA = ethers.utils.formatUnits(
          reserves?.[firstTokenAddress === _firstTokenAddress ? 0 : 1], // the position is swap
          getDecimalForAsset(firstTokenAddress)
        );
        reserveB = ethers.utils.formatUnits(
          reserves?.[secondTokenAddress === _secondTokenAddress ? 1 : 0], // the position is swap
          getDecimalForAsset(secondTokenAddress)
        );

        // If pool has been removed by all provider
        if (reserveA == 0) abExchangeRate = 0;
        else
          abExchangeRate = FixedNumber.from(reserveB).divUnsafe(
            FixedNumber.from(reserveA)
          );
        // If pool has been removed by all provider
        if (reserveB == 0) baExchangeRate = 0;
        else
          baExchangeRate = FixedNumber.from(reserveA).divUnsafe(
            FixedNumber.from(reserveB)
          );

        if (account) {
          const balanceBigN = await contractPair.methods
            .balanceOf(account)
            .call();
          liquidityPool = ethers.utils.formatUnits(balanceBigN, assetsDecimal);
        }

        totalSupply = await contractPair.methods?.totalSupply().call();
        if (totalSupply) {
          totalSupply = ethers.utils.formatUnits(totalSupply, assetsDecimal);
        }
      }
    }

    return {
      abExchangeRate,
      baExchangeRate,
      reserveB,
      reserveA,
      totalSupply,
      liquidityPool,
    };
  }
);

export const addLiquidity = createAsyncThunk(
  poolConstants.ADD_LIQUIDITY,
  async ({ firstAmount, secondAmount }, { getState, dispatch }) => {
    const currentState = getState();
    const { firstToken, secondToken } = currentState.liquidReducer;
    const { connex, account, web3 } = currentState.web3;

    const firstTokenInfo = selectAssetByAddress(currentState, firstToken);
    const secondTokenInfo = selectAssetByAddress(currentState, secondToken);

    let isPoolAddressExist = false;
    const contractFactory = new web3.eth.Contract(
      ERC20ABI_FACTORY,
      ADDRESS_FACTORY
    );
    const contractRouter = new web3.eth.Contract(
      ERC20ABI_ROUTER,
      ADDRESS_ROUTER
    );

    let reserveA, reserveB;

    if (contractFactory) {
      const addressPair = await contractFactory.methods
        .getPair(firstToken, secondToken)
        .call();
      isPoolAddressExist = !/^0x0+$/.test(addressPair);

      if (isPoolAddressExist) {
        const contractPair = new web3.eth.Contract(ERC20ABI_PAIR, addressPair);
        const reserves = await contractPair.methods?.getReserves().call();
        const _firstTokenAddress = await contractPair.methods.token0().call();
        const _secondTokenAddress = await contractPair.methods.token1().call();
        reserveA = reserves?.[firstToken === _firstTokenAddress ? 0 : 1]; // the position is swap
        reserveB = reserves?.[secondToken === _secondTokenAddress ? 1 : 0]; // the position is swap
      } else {
        // First user add pool
        reserveA = secondAmount / firstAmount;
        reserveB = firstAmount / secondAmount;
      }
    }

    const amountA = getAmountInWeiFormatted(
      web3,
      firstAmount,
      firstTokenInfo?.assetsDecimals
    );

    const amountB = getAmountInWeiFormatted(
      web3,
      secondAmount,
      secondTokenInfo?.assetsDecimals
    );

    const transactionFee = "3"; // 0.3%

    // Calculate amountMin to send to smart contract
    const amountAMin = isPoolAddressExist
      ? await contractRouter.methods.quote?.(amountB, reserveB, reserveA).call()
      : amountA; // chua có người add pool

    const amountBMin = isPoolAddressExist
      ? await contractRouter.methods.quote?.(amountA, reserveA, reserveB).call()
      : amountB; // chua có người add pool

    const deadline = Math.round(new Date().getTime() / 1000) + 3600;

    console.table([
      ["tokenA", firstToken],
      ["tokenB", secondToken],
      ["transactionFee", transactionFee],
      ["amountA", amountA],
      ["amountB", amountB],
      ["amountAMin", amountAMin],
      ["amountBMin", amountBMin],
      ["account", account],
      ["deadline", deadline]
    ] );

    let transaction;

    if (isContainVET(firstToken, secondToken)) {
      const addLiquidityVETABI = ERC20ABI_ROUTER.find(
        ({ name, type }) => name === "addLiquidityVET" && type === "function"
      );

      const methodAddLiquidityVET = connex.thor
        .account(ADDRESS_ROUTER)
        .method(addLiquidityVETABI);

      let tokenDesired;
      if (firstToken === process.env.REACT_APP_TOKEN_WVET) {
        tokenDesired = {
          address: secondToken,
          amountTokenDesired: amountB,
          amountTokenMin: amountBMin,
          amountVET: amountA,
          amountVETMin: amountAMin,
        };
      } else {
        tokenDesired = {
          address: firstToken,
          amountTokenDesired: amountA,
          amountTokenMin: amountAMin,
          amountVET: amountB,
          amountVETMin: amountBMin,
        };
      }

      console.log("tokenDesired",tokenDesired);

      methodAddLiquidityVET.value(tokenDesired.amountVET);

      transaction = await methodAddLiquidityVET
        .transact(
          tokenDesired.address,
          tokenDesired.amountTokenDesired,
          tokenDesired.amountTokenMin,
          tokenDesired.amountVETMin,
          account,
          deadline
        )
        .comment(
          `Transaction add ${firstTokenInfo.assetsChain}-${secondTokenInfo.assetsChain} pool to VeBank`
        )
        .request();
    } else {
      const addLiquidityABI = ERC20ABI_ROUTER.find(
        ({ name, type }) => name === "addLiquidity" && type === "function"
      );
      const methodAddLiquidity = connex.thor
        .account(ADDRESS_ROUTER)
        .method(addLiquidityABI);

      transaction = await methodAddLiquidity
        .transact(
          firstToken,
          secondToken,
          amountA,
          amountB,
          amountAMin,
          amountBMin,
          account,
          deadline
        )
        .comment(
          `Transaction add ${firstTokenInfo.assetsChain}-${secondTokenInfo.assetsChain} pool to VeBank`
        )
        .request();
    }

    transaction &&
      dispatch(
        actions.alertActions.success({
          title: "Add liquidity success",
          details: {
            txid: transaction.txid,
            message: "View on Chain",
          },
        })
      );

    return transaction;
  }
);
