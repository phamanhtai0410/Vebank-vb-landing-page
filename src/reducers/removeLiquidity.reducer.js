import { createSlice } from "@reduxjs/toolkit";
import {
  approvePoolLiquidity,
  loadDetailRemoveLiquidity,
  removeLiquidity,
} from "../actions";
import { poolConstants } from "../constants";

const initialState = {
  poolApproval: 0,
  amountTokenA: 0,
  amountTokenB: 0,
  liquidityPool: 0,

  addressTokenA: "",
  addressTokenB: "",

  isLoadingDetail: false,
  isApproving: false,
  isRemoving: false,
  isRemoveSuccess: null,
};

const removeLiquiditySlice = createSlice({
  name: "removeLiquidity",
  initialState,
  reducers: {
    clearRemoveLiquidityData: (state, _) => {
      state.poolApproval = 0;
      state.amountTokenA = 0;
      state.amountTokenB = 0;
      state.liquidityPool = 0;

      state.addressTokenA = "";
      state.addressTokenB = "";

      state.isApproving = false;
      state.isRemoving = false;
      state.isRemoveSuccess = null;

      state.abExchangeRate = null;
      state.baExchangeRate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(approvePoolLiquidity.pending, (state, _) => {
        state.isApproving = true;
      })
      .addCase(approvePoolLiquidity.rejected, (state, _) => {
        state.isApproving = false;
      })
      .addCase(approvePoolLiquidity.fulfilled, (state, action) => {
        const data = action.payload;
        if (data) {
          state.poolApproval = data.poolApproval;
          state.isApproving = false;
        }
      })
      .addCase(loadDetailRemoveLiquidity.pending, (state, _) => {
        state.isLoadingDetail = true;
      })
      .addCase(loadDetailRemoveLiquidity.fulfilled, (state, action) => {
        state.addressTokenA = action.payload.addressTokenA;
        state.addressTokenB = action.payload.addressTokenB;
        state.poolApproval = action.payload.approvePool;
        state.amountTokenA = action.payload.amountTokenA;
        state.amountTokenB = action.payload.amountTokenB;
        state.liquidityPool = action.payload.liquidityPool;
        state.abExchangeRate = action.payload.abExchangeRate;
        state.baExchangeRate = action.payload.baExchangeRate;
        state.isLoadingDetail = false;
      })
      .addCase(loadDetailRemoveLiquidity.rejected, (state, _) => {
        state.isLoadingDetail = false;
      })
      .addCase(removeLiquidity.pending, (state, _) => {
        state.isRemoving = true;
      })
      .addCase(removeLiquidity.fulfilled, (state, action) => {
        state.isRemoving = false;
        state.isRemoveSuccess = true;
        if (action.payload) {
          state.txid = action.payload.txid;
        }
      })
      .addCase(removeLiquidity.rejected, (state, _) => {
        state.isRemoving = false;
        state.isRemoveSuccess = false;
      })
      .addCase(poolConstants.APPROVE_LP_TOKEN, (state, action) => {
        // Update the current approve LP token process
        const data = action.payload;
        if (data) {
          state.poolApproval = data.approveAmount;
          state.isApproving = false;
        }
      });
  },
});

export default removeLiquiditySlice.reducer;

export const selectApprovingState = (state) =>
  state.removeLiquidity.isApproving;
export const selectRemovingState = (state) => state.removeLiquidity.isRemoving;
export const selectRemovingFinishState = (state) =>
  state.removeLiquidity.isRemoveSuccess;
export const selectLoadingState = state => state.removeLiquidity.isLoadingDetail;
export const selectPoolApproval = (state) => state.removeLiquidity.poolApproval;
export const selectAddressTokenA = (state) =>
  state.removeLiquidity.addressTokenA;
export const selectAddressTokenB = (state) =>
  state.removeLiquidity.addressTokenB;
export const selectAmountTokenA = (state) => state.removeLiquidity.amountTokenA;
export const selectAmountTokenB = (state) => state.removeLiquidity.amountTokenB;
export const selectLiquidityPool = (state) =>
  state.removeLiquidity.liquidityPool;
export const selectFirstTokenExchangeRate = (state) =>
  state.removeLiquidity.abExchangeRate;
export const selectSecondTokenExchangeRate = (state) =>
  state.removeLiquidity.baExchangeRate;

export const selectRemoveTransactionId = (state) => state.removeLiquidity.txid;

export const { clearRemoveLiquidityData } = removeLiquiditySlice.actions;
