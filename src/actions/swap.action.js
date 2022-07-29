import { swapConstants } from "../constants";
import * as actions from "../actions";
import { ethers } from "ethers";

import ERC20ABI_FACTORY from "../_contracts/pool/VeBankV1Factory.json";
import ERC20ABI_ROUTER from "../_contracts/pool/VeBankV1Router02.json";
import ERC20ABI_PAIR from "../_contracts/pool/VeBankV1Pair.json";

import ERC20ABI_VB from "../_contracts/assets/VB.json";

import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addressWalletCompact,
  compareString,
  getDeadline,
  getDecimalForAsset,
  isContainVET,
  nFormatter,
  randomKeyUUID,
} from "../utils/lib";

import { selectAssetByAddress } from "../reducers/assetsMarket.reducer";
import { getSymbolPairs } from "../reducers/swap.reducer";
import PartialConstants from "../constants/partial.constants";

// const ADDRESS_GATEWAY = process.env.REACT_APP_ADDRESS_GATEWAY; // WETHGateway (chinh là VET Asset)
const ADDRESS_ROUTER = process.env.REACT_APP_ADDRESS_ROUTER;
const ADDRESS_FACTORY = process.env.REACT_APP_ADDRESS_FACTORY;

// ------------------------ SWAP ------------------------ //

export { swapTokenDesire } from "../reducers/swap.reducer";

export const checkAssetExistsPools = createAsyncThunk(
  swapConstants.checkAssetExistsPools,
  async ({ tokenAInfo, tokenBInfo }, { dispatch, getState }) => {
    const state = getState();
    // const assetsPoolName = `${tokenAInfo?.assetsChain} - ${tokenBInfo?.assetsChain}`;

    const addressTokenA = tokenAInfo?.assetsAddress || "";
    const addressTokenB = tokenBInfo?.assetsAddress || "";

    const { web3, account } = state.web3;
    if (web3 && ADDRESS_FACTORY) {
      let contractFactory = new web3.eth.Contract(
        ERC20ABI_FACTORY,
        ADDRESS_FACTORY
      );
      //"getPair(address tokenA, address tokenB),
      const assetsPoolAddress = await contractFactory.methods
        .getPair(addressTokenA, addressTokenB)
        .call();

      const emptyAddress = /^0x0+$/.test(assetsPoolAddress); // true chưa có

      // dispatch(
      //   checkExchangeRatePool({
      //     tokenAddressA: addressTokenA,
      //     tokenAddressB: addressTokenB,
      //     assetsPoolAddress: assetsPoolAddress,
      //   })
      // );

      if (!emptyAddress && assetsPoolAddress) {
        const contractPair = new web3.eth.Contract(
          ERC20ABI_PAIR,
          assetsPoolAddress
        );

        if (account) {
          contractPair.events.Swap({}).on("data", async (data) => {
            const { event } = data;
            if (event === "Swap") {
              dispatch(
                checkExchangeRatePool({
                  tokenAddressA: addressTokenA,
                  tokenAddressB: addressTokenB,
                  assetsPoolAddress: assetsPoolAddress,
                })
              );
            }
          });
        }
      } else {
        // const key = randomKeyUUID();
        // dispatch(
        //   actions.alertActions.warning(
        //     {
        //       title: "Warning",
        //       description: `${assetsPoolName} not existing in pools`,
        //     },
        //     key
        //   )
        // );
      }
      return {
        assetsPoolAddress: assetsPoolAddress,
        emptyAddress: emptyAddress,
      };
    }
  }
);

export const checkExchangeRatePool = createAsyncThunk(
  swapConstants.checkExchangeRatePool,
  async (
    { tokenAddressA, tokenAddressB, assetsPoolAddress },
    { dispatch, getState }
  ) => {
    const state = getState();
    const { web3 } = state.web3;
    if (web3 && ADDRESS_FACTORY) {
      const contractPair = new web3.eth.Contract(
        ERC20ABI_PAIR,
        assetsPoolAddress
      );
      const reserves = await contractPair.methods.getReserves().call();
      const addressToken1 = await contractPair.methods.token0().call();
      const addressToken2 = await contractPair.methods.token1().call();
      const reserves1 = ethers.utils.formatUnits(
        compareString(addressToken1, tokenAddressA)
          ? reserves?.[0]
          : reserves?.[1],
        getDecimalForAsset(tokenAddressA)
      );
      const reserves2 = ethers.utils.formatUnits(
        compareString(addressToken2, tokenAddressB)
          ? reserves?.[1]
          : reserves?.[0],
        getDecimalForAsset(tokenAddressB)
      );

      let contractFactory = new web3.eth.Contract(
        ERC20ABI_ROUTER,
        ADDRESS_ROUTER
      );

      const amountInUint = web3.utils.toWei(
        "1",
        getDecimalForAsset(tokenAddressA) === PartialConstants.VEUSD_DECIMAL
          ? "mwei"
          : "ether"
      );

      const amountsOut = await contractFactory.methods
        .getAmountsOut(amountInUint, [tokenAddressA, tokenAddressB])
        .call();
      const exchangeRateFormatAB = ethers.utils.formatUnits(
        amountsOut[1],
        getDecimalForAsset(tokenAddressB)
      );

      const amountOutUint = web3.utils.toWei(
        "1",
        getDecimalForAsset(tokenAddressB) === PartialConstants.VEUSD_DECIMAL
          ? "mwei"
          : "ether"
      );

      const amountsIn = await contractFactory.methods
        .getAmountsIn(amountOutUint, [tokenAddressA, tokenAddressB])
        .call();

      const exchangeRateFormatBA = ethers.utils.formatUnits(
        amountsIn[0],
        getDecimalForAsset(tokenAddressA)
      );

      return {
        reserves1,
        reserves2,
        exchangeRateFormatAB,
        exchangeRateFormatBA,
      };
    }
  }
);

export const checkTotalSupplyAvailable = createAsyncThunk(
  swapConstants.checkTotalSupplyAvailable,
  async ({ amountOut }, { dispatch, getState }) => {
    const state = getState();
    const { web3 } = state.web3;
    const { reserves2, poolAddress, sourceTokenAddress, desireTokenAddress } =
      state.swapAsset;

    if (web3 && ADDRESS_FACTORY) {
      let assetsDecimals = 18;
      if (
        sourceTokenAddress === process.env.REACT_APP_TOKEN_VEUSD ||
        desireTokenAddress === process.env.REACT_APP_TOKEN_VEUSD
      ) {
        assetsDecimals = 12;
      }
      const contractPair = new web3.eth.Contract(ERC20ABI_PAIR, poolAddress);

      let totalSupply = await contractPair.methods.totalSupply().call();
      if (totalSupply) {
        totalSupply = ethers.utils.formatUnits(totalSupply, assetsDecimals);
        if (totalSupply < PartialConstants.MIN_AMOUNT_TO_FORMAT) {
          totalSupply = nFormatter(totalSupply);
        }
      }

      if (
        parseFloat(amountOut) > parseFloat(reserves2) ||
        parseFloat(totalSupply) <= 0.0
      ) {
        return {
          totalSupply: totalSupply,
          isVolumeAvailable: false,
        };
      } else {
        return { totalSupply: totalSupply, isVolumeAvailable: true };
      }
    }
  }
);

export const getPairsFee = createAsyncThunk(
  swapConstants.getPairsFee,
  async ({ tokenAInfo, tokenBInfo }, { dispatch, getState }) => {
    // const state = getState();

    // const addressTokenA = tokenAInfo?.assetsAddress || "";
    // const addressTokenB = tokenBInfo?.assetsAddress || "";

    // const { web3 } = state.web3;
    // if (web3 && ADDRESS_FACTORY) {
    //   let contractFactory = new web3.eth.Contract(
    //     ERC20ABI_FACTORY,
    //     ADDRESS_FACTORY
    //   );

    //   //"getPair(address tokenA, address tokenB),
    //   const assetsPoolAddress = await contractFactory.methods
    //     .getPair(addressTokenA, addressTokenB)
    //     .call();
    //   const emptyAddress = /^0x0+$/.test(assetsPoolAddress); // true chưa có
    //   let pairFee = 0;
    //   if (!emptyAddress && assetsPoolAddress) {
    //     pairFee = await contractFactory.methods
    //       .getPairsFee(assetsPoolAddress)
    //       .call();
    //   }
    //   return pairFee;
    // }
    return 3;
  }
);

export const getAmountsOut = createAsyncThunk(
  swapConstants.getAmountsOut,
  async ({ inputAmountIn, tokenAInfo, tokenBInfo }, { dispatch, getState }) => {
    const state = getState();

    // const addressTokenA = tokenAInfo?.assetsAddress || "";
    // const addressTokenB = tokenBInfo?.assetsAddress || "";

    // const { web3 } = state.web3;
    // if (web3 && ADDRESS_FACTORY) {
    //   let contractFactory = new web3.eth.Contract(
    //     ERC20ABI_ROUTER,
    //     ADDRESS_ROUTER
    //   );

    //   const amountInUint = web3.utils.toWei(
    //     inputAmountIn.toString(),
    //     getDecimalForAsset(addressTokenA) === PartialConstants.VEUSD_DECIMAL
    //       ? "mwei"
    //       : "ether"
    //   );

    //   const amountsOut = await contractFactory.methods
    //     .getAmountsOut(amountInUint, [addressTokenA, addressTokenB])
    //     .call();
    //   const amountsOutFormat = ethers.utils.formatUnits(
    //     amountsOut[1],
    //     getDecimalForAsset(addressTokenB)
    //   );
    //   return { inputAmountIn, amountsOutFormat };
    // }

    const { reserves1, reserves2, pairFee } = state.swapAsset;
    const up =
      Number(reserves2) * Number(inputAmountIn) * (1 - Number(pairFee) / 1000);
    const down =
      Number(reserves1) + Number(inputAmountIn) * (1 - Number(pairFee) / 1000);
    const amountsOutFormat = up / down;
    return { inputAmountIn, amountsOutFormat };
  }
);

export const getAmountsIn = createAsyncThunk(
  swapConstants.getAmountsIn,
  async (
    { inputAmountOut, tokenAInfo, tokenBInfo },
    { dispatch, getState }
  ) => {
    const state = getState();

    // const addressTokenA = tokenAInfo?.assetsAddress || "";
    // const addressTokenB = tokenBInfo?.assetsAddress || "";

    // const { web3 } = state.web3;
    // if (web3 && ADDRESS_FACTORY) {
    //   let contractFactory = new web3.eth.Contract(
    //     ERC20ABI_ROUTER,
    //     ADDRESS_ROUTER
    //   );

    //   const amountOutUint = web3.utils.toWei(
    //     inputAmountOut.toString(),
    //     getDecimalForAsset(addressTokenB) === PartialConstants.VEUSD_DECIMAL
    //       ? "mwei"
    //       : "ether"
    //   );

    //   const amountsIn = await contractFactory.methods
    //     .getAmountsIn(amountOutUint, [addressTokenA, addressTokenB])
    //     .call();
    //   const amountsInFormat = ethers.utils.formatUnits(
    //     amountsIn[0],
    //     getDecimalForAsset(addressTokenA)
    //   );
    //   return { amountsInFormat, inputAmountOut };
    // }

    const { reserves1, reserves2, pairFee } = state.swapAsset;

    const up = Number(reserves1) * Number(inputAmountOut);
    const down =
      (Number(reserves2) - Number(inputAmountOut)) *
      (1 - Number(pairFee) / 1000);

    const amountsInFormat = up / down;

    return { amountsInFormat, inputAmountOut };
  }
);

export const checkApproveToken = createAsyncThunk(
  swapConstants.checkApproveToken,
  async ({ tokenInfo }, { dispatch, getState }) => {
    const state = getState();
    const { web3, account } = state.web3;
    let accountApprove = 0;
    let contractSwap;

    const addressToken = tokenInfo?.assetsAddress || "";

    contractSwap = new web3.eth.Contract(ERC20ABI_VB, addressToken);

    // get the approved coin MSP account
    accountApprove = await contractSwap.methods
      .allowance(account, ADDRESS_ROUTER)
      .call();
    accountApprove = ethers.utils.formatEther(accountApprove);
    accountApprove = Number(accountApprove);

    return { contractSwap: contractSwap, accountApprove: accountApprove };
  }
);

export const onApproveTokenForAccount = createAsyncThunk(
  swapConstants.onApproveTokenForAccount,
  async ({ tokenInfo }, { dispatch, getState }) => {
    const state = getState();
    const { web3, account, connex } = state.web3;
    const { contractSwap } = state.swapAsset;
    let amountMax = 1000000000;

    const addressToken = tokenInfo?.assetsAddress || "";

    if (account && contractSwap && addressToken) {
      const key = randomKeyUUID();
      dispatch(
        actions.alertActions.loading(
          {
            title: "Waiting For Approve",
            description: `Approve ${tokenInfo.assetsChain} on VeBank`,
          },
          key
        )
      );
      const approveABI = {
        constant: false,
        inputs: [
          { name: "_spender", type: "address" },
          { name: "_value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "success", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      };
      const approveMethod = connex.thor
        .account(addressToken)
        .method(approveABI);

      try {
        const res = await approveMethod
          .transact(ADDRESS_ROUTER, web3.utils.toWei(amountMax.toString()))
          .comment(`Approve ${tokenInfo.assetsChain} on VeBank`)
          .request();

        if (res) {
          amountMax = 1000000000;
          dispatch(
            actions.alertActions.update(
              {
                status: "success",
                title: "Approve successfully",
                description: `Approve ${tokenInfo.assetsChain} successfully`,
              },
              key
            )
          );
          return { accountApprove: amountMax };
        }
      } catch (error) {
        amountMax = 0;
        dispatch(
          actions.alertActions.update(
            {
              status: "warning",
              title: "Approve failed",
              description: `Approve ${tokenInfo.assetsChain} failed`,
            },
            key
          )
        );
        return { accountApprove: amountMax };
      }
    }
  }
);

export const swapAsset = createAsyncThunk(
  swapConstants.swapToken,
  async (
    { amountInToSwap, minAmountOut, tokenAInfo, tokenBInfo },
    { dispatch, getState }
  ) => {
    const currentState = getState();

    const { amountsOut } = currentState.swapAsset;
    const { connex, account, web3 } = currentState.web3;
    const assetsPoolName = `${tokenAInfo?.assetsChain} - ${tokenBInfo?.assetsChain}`;
    const key = randomKeyUUID();
    dispatch(
      actions.alertActions.loading(
        {
          title: "Waiting For Confirmation",
          description: `Swapping ${amountInToSwap} ${tokenAInfo.assetsChain} for ${amountsOut} ${tokenBInfo.assetsChain}`,
        },
        key
      )
    );

    const addressTokenA = tokenAInfo?.assetsAddress || "";
    const addressTokenB = tokenBInfo?.assetsAddress || "";

    const isPairContainVET = isContainVET(addressTokenA, addressTokenB);

    // const y = minAmountOut;
    // const x = amountInToSwap;
    // const m = amountInToSwap;
    // const amountToOut =
    //   (y * (1000 * m - pairFee * m)) / (1000 * x + (1000 * m - pairFee * m));

    const amountOutMin = web3.utils.toWei(
      minAmountOut.toString(),
      getDecimalForAsset(addressTokenB) === PartialConstants.VEUSD_DECIMAL
        ? "mwei"
        : "ether"
    );
    const deadline = getDeadline();
    const amountIn = web3.utils.toWei(
      amountInToSwap.toString(),
      getDecimalForAsset(addressTokenA) === PartialConstants.VEUSD_DECIMAL
        ? "mwei"
        : "ether"
    );

    let functionName = "";
    let pathAddress = [];
    if (addressTokenA === process.env.REACT_APP_TOKEN_WVET) {
      // Đổi VET sang token khác
      pathAddress = pathAddress.concat([addressTokenA, addressTokenB]);
      functionName = "swapExactVETForTokens";
    } else if (addressTokenB === process.env.REACT_APP_TOKEN_WVET) {
      // Đổi token sang VET khác
      pathAddress = pathAddress.concat([addressTokenA, addressTokenB]);
      functionName = "swapExactTokensForVET";
    } else {
      // Token to Token
      pathAddress = pathAddress.concat([addressTokenA, addressTokenB]);
      functionName = "swapExactTokensForTokens";
    }

    const swapABI = ERC20ABI_ROUTER.find(
      ({ name, type }) => name === functionName && type === "function"
    );

    const methodSwapToken = connex.thor.account(ADDRESS_ROUTER).method(swapABI);

    console.table([
      ["method", functionName],
      ["addressTokenA", addressTokenA],
      ["addressTokenB", addressTokenB],
      ["amountOutMin", amountOutMin],
      ["amountIn", amountIn],
    ]);

    // if (poolAddress && account) {
    //   const contractPair = new web3.eth.Contract(ERC20ABI_PAIR, poolAddress);
    //   contractPair.events.Swap({}).on("data", async (data) => {
    //     const { event, returnValues } = data;
    //     if (event === "Swap" && compareString(returnValues.to, account)) {
    //       dispatch(
    //         actions.alertActions.success({
    //           status: "success",
    //           title: "Swap successfully",
    //           description: `Received ${amountsOut} ${tokenBInfo.assetsChain}`,
    //           details: {
    //             message: "View on VeChain Stats",
    //             txid: data.meta.txID,
    //           },
    //         }),
    //         randomKeyUUID()
    //       );
    //     }
    //   });
    // }

    let transaction;
    if (isPairContainVET) {
      if (functionName === "swapExactVETForTokens") {
        // swap VET to another tokens
        console.table([
          ["method", functionName],
          ["addressTokenA", addressTokenA],
          ["addressTokenB", addressTokenB],
          ["amountOutMin", amountOutMin],
        ]);

        methodSwapToken.value(amountIn);

        transaction = await methodSwapToken
          .transact(amountOutMin, pathAddress, account, deadline)
          .comment(`transaction swap ${assetsPoolName} from VeBank`)
          .request()
          .then((transaction) => {
            dispatch(
              actions.alertActions.update(
                {
                  status: "success",
                  title: "Transaction Submitted",
                  description: `Swapping ${amountInToSwap} ${tokenAInfo.assetsChain} for ${amountsOut} ${tokenBInfo.assetsChain}`,
                  details: {
                    message: "View on VeChain Stats",
                    txid: transaction.txid,
                  },
                },
                key
              )
            );
            return transaction;
          })
          .catch((e) => {
            dispatch(
              actions.alertActions.update(
                {
                  status: "warning",
                  title: "Transaction Rejected",
                  description: `Wallets ${addressWalletCompact(account)}`,
                },
                key
              )
            );
          });
      } else {
        console.table([
          ["method", functionName],
          ["addressTokenA", addressTokenA],
          ["addressTokenB", addressTokenB],
          ["amountIn", amountIn],
          ["amountOutMin", amountOutMin],
        ]);
        //swap another token to VET token
        transaction = await methodSwapToken
          .transact(amountIn, amountOutMin, pathAddress, account, deadline)
          .comment(`transaction swap ${assetsPoolName} from VeBank`)
          .request()
          .then((transaction) => {
            dispatch(
              actions.alertActions.update(
                {
                  status: "success",
                  title: "Transaction Submitted",
                  description: `Swapping ${amountInToSwap} ${tokenAInfo.assetsChain} for ${amountsOut} ${tokenBInfo.assetsChain}`,
                  details: {
                    message: "View on VeChain Stats",
                    txid: transaction.txID,
                  },
                },
                key
              )
            );
            return transaction;
          })
          .catch((e) => {
            dispatch(
              actions.alertActions.update(
                {
                  status: "warning",
                  title: "Transaction Rejected",
                  description: `Wallets ${addressWalletCompact(account)}`,
                },
                key
              )
            );
          });
      }
    } else {
      // swap token to token
      transaction = await methodSwapToken
        .transact(
          amountIn,
          amountOutMin,
          [addressTokenA, addressTokenB],
          account,
          deadline
        )
        .comment(`transaction swap ${assetsPoolName} from VeBank`)
        .request()
        .then((transaction) => {
          dispatch(
            actions.alertActions.update(
              {
                status: "success",
                title: "Transaction Submitted",
                description: `Swapping ${amountInToSwap} ${tokenAInfo.assetsChain} for ${amountsOut} ${tokenBInfo.assetsChain}`,
                details: {
                  message: "View on VeChain Stats",
                  txid: transaction.txID,
                },
              },
              key
            )
          );
          return transaction;
        })
        .catch((e) => {
          dispatch(
            actions.alertActions.update(
              {
                status: "warning",
                title: "Transaction Rejected",
                description: `Wallets ${addressWalletCompact(account)}`,
              },
              key
            )
          );
          return null;
        });
    }
    return transaction;
  }
);

export const getAllPairs = () => async (dispatch, getState) => {
  const state = getState();

  const { web3, account } = state.web3;

  let dataSymbolPair = [];

  if (web3 && ADDRESS_FACTORY) {
    const contractFactory = new web3.eth.Contract(
      ERC20ABI_FACTORY,
      ADDRESS_FACTORY
    );
    const allPairsLength = await contractFactory.methods
      .allPairsLength()
      .call();
    for (let index = 0; index < allPairsLength; index++) {
      const poolAddress = await contractFactory.methods.allPairs(index).call();
      let addressTokenA = "";
      let addressTokenB = "";
      if (poolAddress && account) {
        const contractPair = new web3.eth.Contract(ERC20ABI_PAIR, poolAddress);
        addressTokenA = await contractPair.methods.token0().call();
        addressTokenB = await contractPair.methods.token1().call();
        let symbolTokenA = selectAssetByAddress(
          state,
          addressTokenA
        ).assetsChain;
        let symbolTokenB = selectAssetByAddress(
          state,
          addressTokenB
        ).assetsChain;
        dataSymbolPair.push({
          symbolTokenA: symbolTokenA,
          symbolTokenB: symbolTokenB,
        });
      }
    }
    dispatch(getSymbolPairs(dataSymbolPair));
  }
};
