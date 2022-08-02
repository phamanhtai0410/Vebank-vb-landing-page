import { createSelector, createSlice } from "@reduxjs/toolkit";
import { shallowEqual } from "react-redux";

const initialState = {
  addresses: [],
  data: {},
  userAddedPoolsAddresses: [],
};

const userAssetPools = createSlice({
  name: "userAssetPools",
  initialState,
  reducers: {
    updateLiquidityPool: (state, action) => {
      const { poolAddress, liquidityPool } = action.payload;
      if (poolAddress && liquidityPool) {
        state.data[poolAddress] = liquidityPool;
      }
    },
    updateUserAssets: (state, action) => {
      const { assetsPoolAddress, liquidityPool, amountTokenA, amountTokenB } =
        action.payload;
      if (!state.addresses.includes(assetsPoolAddress)) {
        state.addresses.push(assetsPoolAddress);
      }

      if (
        (state.data[assetsPoolAddress]?.liquidityPool ?? 0) === 0 &&
        liquidityPool > 0 && !state.userAddedPoolsAddresses.includes(assetsPoolAddress)
      ) {
        // User add pool first time.
        state.userAddedPoolsAddresses.push(assetsPoolAddress);
      } else if (
        state.data[assetsPoolAddress]?.liquidityPool > 0 &&
        liquidityPool === 0
      ) {
        // User remove all asset from this pool
        const indexOfAsset =
          state.userAddedPoolsAddresses.indexOf(assetsPoolAddress);
        state.userAddedPoolsAddresses.splice(indexOfAsset, 1);
      }
      console.log("assetsPoolAddress",assetsPoolAddress);

      state.data[assetsPoolAddress] = {
        ...state.data[assetsPoolAddress],
        liquidityPool,
        amountTokenA,
        amountTokenB,
      };
    },
    updateLoadingLiquidPoolState: (state, action) => {
      state.isLoadingLiquidPoolState = action.payload.isLoading;
    },
  },
});

export default userAssetPools.reducer;

export const { updateLiquidityPool, updateUserAssets, updateLoadingLiquidPoolState } = userAssetPools.actions;

export const selectAllAddresses = (state) => state.userAssetPools.addresses;
export const selectAllPoolBalance = (state) => state.userAssetPools.data;

export const selectUserAddedPoolsAddresses = (state) =>
  state.userAssetPools.userAddedPoolsAddresses;

export const selectIsLoadingPoolAddresses = (state) =>
  state.userAssetPools.isLoadingLiquidPoolState;

export const selectUserPoolAssetByPoolAddress = (state, poolAddress) =>
  state.userAssetPools.data[poolAddress];
export const selectUserLiquidityPoolByPoolAddress = (state, poolAddress) =>
  state.userAssetPools.data[poolAddress]?.liquidityPool;
export const selectUserAmountAByPoolAddress = (state, poolAddress) =>
  state.userAssetPools.data[poolAddress]?.amountTokenA;
export const selectUserAmountBByPoolAddress = (state, poolAddress) =>
  state.userAssetPools.data[poolAddress]?.amountTokenB;
