import { BigNumber, ethers } from "ethers";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { poolConstants } from "../../constants";
import ERC20ABI_ROUTER from "../../_contracts/router.json";
import { selectPoolInfoByAddress } from "../../reducers/assetsPool.reducer";
import { getAmountInWeiFormatted, isContainVET } from "../../utils/lib";
import ERC20ABI_PAIR from "../../_contracts/pair.json";
import { selectLiquidityPool } from "../../reducers/removeLiquidity.reducer";
import { getUserTokenAmounts } from "../pool.action";
import PartialConstants from "../../constants/partial.constants";
import * as actions from "../index";

const ADDRESS_ROUTER = process.env.REACT_APP_ADDRESS_ROUTER;

export const loadDetailRemoveLiquidity = createAsyncThunk(
  poolConstants.LOAD_DETAIL_REMOVE_LIQUIDITY,
  async (poolAddress, { getState }) => {
    const currentState = getState();
    const { web3, account } = currentState.web3;
    let approvePool = 0;

    let balanceAccount = 0;
    let amountTokenA = 0;
    let amountTokenB = 0;

    let addressTokenA = "";
    let addressTokenB = "";

    let abExchangeRate, baExchangeRate;

    if (poolAddress && account) {

      const contractPair = new web3.eth.Contract(ERC20ABI_PAIR, poolAddress);
      addressTokenA = await contractPair.methods.token0().call();
      addressTokenB = await contractPair.methods.token1().call();

      if (account) {
        approvePool = await contractPair.methods
          .allowance(account, ADDRESS_ROUTER)
          .call();
        const poolInfo = selectPoolInfoByAddress(currentState, poolAddress);
        approvePool = ethers.utils.formatUnits(
          approvePool,
          poolInfo?.assetsDecimals
        );
        approvePool = Number(approvePool);
      }

      const {
        amountTokenA: _amountTokenA,
        amountTokenB: _amountTokenB,
        reserve1,
        reserve2,
        liquidityPool,
      } = await getUserTokenAmounts({
        contractPair,
        account,
        addressTokenA,
        addressTokenB,
      });
      amountTokenA = _amountTokenA;
      amountTokenB = _amountTokenB;

      abExchangeRate = reserve2 / reserve1;
      baExchangeRate = reserve1 / reserve2;

      balanceAccount = liquidityPool;
    }
    return {
      addressTokenA,
      addressTokenB,
      approvePool,
      amountTokenA,
      amountTokenB,
      liquidityPool: balanceAccount,
      abExchangeRate,
      baExchangeRate,
    };
  }
);

export const approvePoolLiquidity = createAsyncThunk(
  poolConstants.APPROVE_POOL_ADDRESS,
  async ({ poolAddress }, { getState }) => {
    if (!poolAddress) return;

    const state = getState();

    const { web3, account, connex } = state.web3;

    const contractPair = new web3.eth.Contract(ERC20ABI_PAIR, poolAddress);

    const poolInfo = selectPoolInfoByAddress(state, poolAddress);

    const amountMax = 1_000_000_000;

    if (account && contractPair && poolAddress) {
      const approveABI = ERC20ABI_PAIR.find(
        ({ name, type }) => name === "approve" && type === "function"
      );

      const approveMethod = connex.thor.account(poolAddress).method(approveABI);

      const result = await approveMethod
        .transact(ADDRESS_ROUTER, web3.utils.toWei(amountMax.toString()))
        .comment(`approve ${poolInfo?.assetsPoolName} on VeBank`)
        .request();

      // The result currently is ignored. The approve type will be updated when the
      // Approve event from the token's contract will trigger the approve token
      // successfully state and it will be captured in the removeLiquidity.reducer

      return { result };
    }
  }
);

export const removeLiquidity = createAsyncThunk(
  poolConstants.REMOVE_LIQUIDITY,
  async (
    { amount, amountTokenA, amountTokenB, tokenAInfo, tokenBInfo },
    { getState, dispatch }
  ) => {
    const currentState = getState();

    const { connex, account, web3 } = currentState.web3;

    const assetsPoolName = `${tokenAInfo?.assetsChain} - ${tokenBInfo?.assetsChain}`;

    const addressTokenA = tokenAInfo?.assetsAddress || "";
    const addressTokenB = tokenBInfo?.assetsAddress || "";
    const liquidityPool = selectLiquidityPool(currentState);

    const isPairContainVET = isContainVET(addressTokenA, addressTokenB);
    const functionName = isPairContainVET
      ? "removeLiquidityETH"
      : "removeLiquidity";

    const removeLiquidityABI = ERC20ABI_ROUTER.find(
      ({ name, type }) => name === functionName && type === "function"
    );
    const methodRemoveLiquidity = connex.thor
      .account(ADDRESS_ROUTER)
      .method(removeLiquidityABI);

    console.log("liquidityPool", liquidityPool);

    const amountAMin = getAmountInWeiFormatted(
      web3,
      amountTokenA,
      tokenAInfo?.assetsDecimals
    );

    const amountBMin = getAmountInWeiFormatted(
      web3,
      amountTokenB,
      tokenBInfo?.assetsDecimals
    );

    const deadline = Math.round(new Date().getTime() / 1000) + 3600;

    let removeAmount = getAmountInWeiFormatted(
      web3,
      liquidityPool,
      PartialConstants.DEFAULT_ASSET_DECIMAL
    );
    // Calculate this way to prevent rounding from float type of JS
    removeAmount = BigNumber.from(removeAmount)
      .mul(BigNumber.from(amount))
      .div(BigNumber.from(100))
      .toString();

    let transaction;
    if (isPairContainVET) {
      const assetDesired =
        addressTokenA === process.env.REACT_APP_TOKEN_WVET
          ? {
              address: addressTokenB,
              amountTokenMin: amountBMin,
              amountETHMin: amountAMin,
            }
          : {
              address: addressTokenA,
              amountTokenMin: amountAMin,
              amountETHMin: amountBMin,
            };

      // console.table([
      //   ["address", assetDesired.address],
      //   ["removeAmount", removeAmount],
      //   ["amountTokenMin", assetDesired.amountTokenMin],
      //   ["amountETHMin", assetDesired.amountETHMin],
      //   ["account", account],
      //   ["deadline", deadline],
      // ]);

      transaction = await methodRemoveLiquidity
        .transact(
          assetDesired.address,
          removeAmount,
          "0",
          "0",
          account,
          deadline
        )
        .comment(`transaction remove pool ${assetsPoolName} from VeBank`)
        .request();
    } else {
      // console.table([
      //   ["addressTokenA", addressTokenA],
      //   ["addressTokenB", addressTokenB],
      //   ["removeAmount", removeAmount],
      //   ["amountAMin", "0"],
      //   ["amountBMin", "0"],
      //   ["account", account],
      //   ["deadline", deadline],
      // ]);

      transaction = await methodRemoveLiquidity
        .transact(
          addressTokenA,
          addressTokenB,
          removeAmount,
          "0",
          "0",
          account,
          deadline
        )
        .comment(`transaction remove pool ${assetsPoolName} from VeBank`)
        .request();
    }

    transaction &&
      dispatch(
        actions.alertActions.success({
          title: "Remove liquidity success",
          details: {
            txid: transaction.txid,
            message: "View on Chain",
          },
        })
      );
    return transaction;
  }
);
