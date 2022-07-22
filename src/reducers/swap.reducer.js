import { createSlice } from "@reduxjs/toolkit";
import {
  checkApproveToken,
  checkAssetExistsPools,
  checkExchangeRatePool,
  checkTotalSupplyAvailable,
  getAmountsIn,
  getAmountsOut,
  getPairsFee,
  onApproveTokenForAccount,
  swapAsset,
} from "../actions";
import { swapConstants } from "../constants";

const initialState = {
  sourceTokenAddress: process.env.REACT_APP_TOKEN_WVET,
  desireTokenAddress: process.env.REACT_APP_TOKEN_VEBANK,
  isModalSelectTokenOpen: false,
  nameToken: swapConstants.FIRST_TOKEN,
  symbolPairs: [],
  exchangeRateAB: 0,
  exchangeRateBA: 0,
  isSwap: true,
  loadingFee: false,
  loadingSwap: false,
  loadingApprove: false,
  pairFee: 0,
  loadingGetAmountOut: false,
  loadingGetAmountIn: false,
  loadingExchangeRate: false,
  amountsOut: "",
  amountsIn: "",
  userInput: "",
  accountApprove: 0,
  contractSwap: "",
  poolAddress: "",
  reserves1: null,
  reserves2: null,
  totalSupply: null,
  swapSuccess: false,
  poolErr: "",
  emptyAddress: false,
};

const swapAssetSlice = createSlice({
  name: "swapAsset",
  initialState,
  reducers: {
    selectSourceTokenFromModal: (state, action) => {
      if (action.payload) {
        state.sourceTokenAddress = action.payload;
        state.isModalSelectTokenOpen = false;
      }
    },
    selectDesireTokenFromModal: (state, action) => {
      if (action.payload) {
        state.desireTokenAddress = action.payload;
        state.isModalSelectTokenOpen = false;
      }
    },
    swapTokenDesire: (state, action) => {
      state.isModalSelectTokenOpen = false;
      const sourceAddress = state.sourceTokenAddress;
      const desireAddress = state.desireTokenAddress;
      state.sourceTokenAddress = desireAddress;
      state.desireTokenAddress = sourceAddress;
    },
    openModalSelectToken: (state, action) => {
      state.isModalSelectTokenOpen = true;
      state.nameToken = action.payload;
    },
    closeModalSelectToken: (state, action) => {
      state.isModalSelectTokenOpen = false;
    },
    getSymbolPairs: (state, action) => {
      state.symbolPairs = action.payload;
    },
    refreshDataSwap: (state) => {
      state.amountsIn = "";
      state.amountsOut = "";
      state.swapSuccess = true;
      state.loadingSwap = false;
    },
    approveSuccess: (state, action) => {
      state.loadingApprove = false;
      state.accountApprove = action.payload.accountApprove;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPairsFee.pending, (state, action) => {
        state.loadingFee = true;
      })
      .addCase(getPairsFee.fulfilled, (state, action) => {
        state.loadingFee = false;
        state.pairFee = action.payload;
      })
      .addCase(getPairsFee.rejected, (state, action) => {
        state.loadingFee = false;
      })
      .addCase(getAmountsOut.pending, (state, action) => {
        state.loadingGetAmountOut = true;
        state.amountsOut = "";
      })
      .addCase(getAmountsOut.fulfilled, (state, action) => {
        state.loadingGetAmountOut = false;
        state.userInput = action.payload.inputAmountIn;
        state.amountsIn = action.payload.inputAmountIn;
        state.amountsOut = action.payload.amountsOutFormat;
        state.swapSuccess = false;
        state.isSwap = true;
      })
      .addCase(getAmountsOut.rejected, (state, action) => {
        state.loadingGetAmountOut = false;
        state.isSwap = false;
      })
      .addCase(getAmountsIn.pending, (state, action) => {
        state.loadingGetAmountIn = true;
        state.amountsIn = "";
      })
      .addCase(getAmountsIn.fulfilled, (state, action) => {
        state.loadingGetAmountIn = false;
        state.userInput = action.payload.inputAmountOut;
        state.amountsIn = action.payload.amountsInFormat;
        state.amountsOut = action.payload.inputAmountOut;
        state.swapSuccess = false;
        state.isSwap = true;
      })
      .addCase(getAmountsIn.rejected, (state, action) => {
        state.loadingGetAmountIn = false;
        state.isSwap = false;
      })
      .addCase(checkApproveToken.fulfilled, (state, action) => {
        state.accountApprove = action.payload.accountApprove;
        state.contractSwap = action.payload.contractSwap;
      })
      .addCase(onApproveTokenForAccount.pending, (state, action) => {
        state.loadingApprove = true;
      })
      .addCase(onApproveTokenForAccount.fulfilled, (state, action) => {
        state.loadingApprove = false;
        state.accountApprove = action.payload.accountApprove;
      })
      .addCase(onApproveTokenForAccount.rejected, (state, action) => {
        state.loadingApprove = false;
      })
      .addCase(checkAssetExistsPools.fulfilled, (state, action) => {
        state.poolAddress = action.payload.assetsPoolAddress;
        state.emptyAddress = action.payload.emptyAddress;
        state.poolErr = action.payload.poolErr;
        state.isSwap = action.payload.isSwap;
      })
      .addCase(swapAsset.pending, (state) => {
        state.loadingSwap = true;
      })
      .addCase(swapAsset.fulfilled, (state) => {
        state.loadingSwap = false;
      })
      .addCase(swapAsset.rejected, (state) => {
        state.loadingSwap = false;
      })
      .addCase(checkExchangeRatePool.pending, (state) => {
        state.loadingExchangeRate = true;
      })
      .addCase(checkExchangeRatePool.fulfilled, (state, action) => {
        state.loadingExchangeRate = false;
        state.reserves1 = action.payload.reserves1;
        state.reserves2 = action.payload.reserves2;
        state.exchangeRateAB = action.payload.exchangeRateFormat;
      })
      .addCase(checkExchangeRatePool.rejected, (state) => {
        state.loadingExchangeRate = false;
        state.reserves1 = "";
        state.reserves2 = "";
      })
      .addCase(checkTotalSupplyAvailable.fulfilled, (state, action) => {
        state.totalSupply = action.payload.totalSupply;
        state.isSwap = action.payload.isSwap;
        state.poolErr = action.payload.poolErr;
      });
  },
});

export default swapAssetSlice.reducer;

export const {
  swapTokenDesire,
  openModalSelectToken,
  closeModalSelectToken,
  selectSourceTokenFromModal,
  selectDesireTokenFromModal,
  getSymbolPairs,
  refreshDataSwap,
  approveSuccess,
} = swapAssetSlice.actions;

export const selectSourceToken = (state) => state.swapAsset.sourceTokenAddress;
export const selectDesireToken = (state) => state.swapAsset.desireTokenAddress;
export const selectNameTokenState = (state) => state.swapAsset.nameToken;
export const selectOpenChooseTokenState = (state) =>
  state.swapAsset.isModalSelectTokenOpen;
export const selectSymbolPairs = (state) => state.swapAsset.symbolPairs;
export const selectExchangeRate = (state) => state.swapAsset.exchangeRateAB;
export const selectIsSwap = (state) => state.swapAsset.isSwap;
export const selectLoadingFee = (state) => state.swapAsset.loadingFee;
export const selectPairsFee = (state) => state.swapAsset.pairFee;
export const selectLoadingGetAmountOut = (state) =>
  state.swapAsset.loadingGetAmountOut;
export const selectAmountsOut = (state) => state.swapAsset.amountsOut;
export const selectLoadingGetAmountIn = (state) =>
  state.swapAsset.loadingGetAmountIn;
export const selectAmountsIn = (state) => state.swapAsset.amountsIn;
export const selectAccountApprove = (state) => state.swapAsset.accountApprove;
export const selectLoadingSwap = (state) => state.swapAsset.loadingSwap;
export const selectLoadingApprove = (state) => state.swapAsset.loadingApprove;
export const selectSwapSuccess = (state) => state.swapAsset.swapSuccess;
export const selectLoadingExchangeRate = (state) =>
  state.swapAsset.loadingExchangeRate;
export const selectPoolErr = (state) => state.swapAsset.poolErr;
export const selectEmptyAddress = (state) => state.swapAsset.emptyAddress;
export const selectUserInput = (state) => state.swapAsset.userInput;
