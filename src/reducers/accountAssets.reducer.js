import { createSelector } from "reselect";
import { marketplaceConstants } from "../constants";
import { selectListAssets } from "./assetsMarket.reducer";
import { selectAssetPrice } from "./assetsPrice.reducer";

const initialState = {
  requesting: false,
  success: false,
  message: null,

  totalSupplied: null,
  totalBorrowed: null,

  accountTotalSupplied: 0,
  accountTotalBorrowed: 0,

  query: {},
  total: 0,
  data: [],
};

export function accountAssetsReducer(state = initialState, payload) {
  switch (payload.type) {
    case marketplaceConstants.FETCH_ACCOUNT_ASSETS_REQUEST:
      return {
        ...state,
        requesting: true,
        query: payload.query ? payload.query : {},
      };
    case marketplaceConstants.FETCH_ACCOUNT_ASSETS_SUCCESS:
      return {
        ...state,
        requesting: false,
        success: true,
        data: payload.data,
        accountBorrowBalance: payload.accountBorrowBalance,
        accountSupplyBalance: payload.accountSupplyBalance,
        total: payload.total,
      };
    case marketplaceConstants.FETCH_ACCOUNT_ASSETS_ERROR:
      return {
        ...state,
        requesting: false,
        message: payload.message,
      };

    default:
      return state;
  }
}

export const selectAccountAssetsReducer = (state) => state.accountAssetsReducer;
export const selectAccountSupplyBalance = (state) =>
  state.accountAssetsReducer.accountSupplyBalance;
export const selectAccountBorrowBalance = (state) =>
  state.accountAssetsReducer.accountBorrowBalance;
  const _selectUserAssets = createSelector(
    [selectListAssets, selectAssetPrice],
    (listAssets, listPrice) => {
      return listAssets && listAssets.length > 0
        ? listAssets.map((asset) => {
            return {
              ...asset,
              balance: listPrice[asset.assetsAddress],
            };
          })
        : [];
    }
  );

  const selectDataAssets = state => state.accountAssetsReducer.data;
//export const selectUserAssets = (state, tokenAddress) => state.accountAssetsReducer.data[tokenAddress]

export const selectUserAssets = (state, tokenAddress) => {
  const items =state.accountAssetsReducer.data.filter(item => item.assetsAddress?.toLocaleString() === tokenAddress?.toLocaleString())
  if(items){
    return items[0];
  }
}
//const selectDataAssets = state => state.accountAssetsReducer.data;
// export const selectItemsByAssets = createSelector(
//   [
//     // Usual first input - extract value from `state`
//     selectDataAssets,
//     // Take the second arg, `category`, and forward to the output selector
//     (state, address) => address
//   ],
//   // Output selector gets (`items, category)` as args
//   (data, address) => data.filter(item => item.assetAddress?.toLocaleString() === address?.toLocaleString())
// )