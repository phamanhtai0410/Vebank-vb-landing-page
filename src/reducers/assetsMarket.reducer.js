import { marketplaceConstants } from "../constants";

import IcVeUSD from "../assets/images/ic_veusd.svg";
import IcVeChain from "../assets/images/ic_vechain.svg";
import IcVeBank from "../assets/images/ic_vebank.svg";
import IcVtho from "../assets/images/ic_vtho.svg";

function getListKeyAssets(dataList){
  let keys = [];
  for (const i of dataList) {
    keys[i.assetsAddress.toLowerCase()] = i;
  }
  return keys;
}

const listAsset = [
  {
    icon: IcVeChain,
    assetsChain: "VET",
    assetNetwork: "VeChain",
    assetsAddress: process.env.REACT_APP_TOKEN_WVET,
    assetsDecimals: 18,
    totalSupplied: 0,
    supplyAPY: 0,
    interestSupply: "1.8",
    borrowAPY: 0,
    interestBorrow: "1.8",
    totalBorrowed: 0,
  },
  {
    icon: IcVeUSD,
    assetsChain: "VEUSD",
    assetNetwork: "VeUSD",
    assetsAddress: process.env.REACT_APP_TOKEN_VEUSD,
    assetsDecimals: 6,
    totalSupplied: 0,
    supplyAPY: 0,
    interestSupply: "1.8",
    borrowAPY: 0,
    interestBorrow: "1.8",
    totalBorrowed: 0,
  },
  {
    icon: IcVtho,
    assetsChain: "VTHO",
    assetNetwork: "VeThor",
    assetsAddress: process.env.REACT_APP_TOKEN_VTHO,
    assetsDecimals: 18,
    totalSupplied: 0,
    supplyAPY: 0,
    interestSupply: "1.8",
    borrowAPY: 0,
    interestBorrow: "1.8",
    totalBorrowed: 0,
  },
  {
    icon: IcVeBank,
    assetsChain: "VB",
    assetNetwork: "VeBank",
    assetsAddress: process.env.REACT_APP_TOKEN_VEBANK,
    assetsDecimals: 18,
    totalSupplied: 0,
    supplyAPY: 0,
    interestSupply: "1.8",
    borrowAPY: 0,
    interestBorrow: "1.8",
    totalBorrowed: 0,
  },
];

const initialState = {
  requesting: false,
  success: false,
  message: null,
  query: {},
  totalSupply: 0,
  totalBorrow: 0,
  total: 0,
  addresses: [
    process.env.REACT_APP_TOKEN_WVET,
    process.env.REACT_APP_TOKEN_VEUSD,
    process.env.REACT_APP_TOKEN_VTHO,
    process.env.REACT_APP_TOKEN_VEBANK,
  ],
  listAsset:listAsset,
  assetEntities: getListKeyAssets(listAsset),
  data: [],
};

export function assetsMarketReducer(state = initialState, payload) {
  switch (payload.type) {
    case marketplaceConstants.FETCH_ASSETS_MARKET_REQUEST:
      return {
        ...state,
        requesting: true,
        query: payload.query ? payload.query : {},
      };

    case marketplaceConstants.FETCH_ASSETS_MARKET_SUCCESS:
      return {
        ...state,
        requesting: false,
        success: true,
        data: payload.data,
        totalSupply: payload.totalSupply,
        totalBorrow: payload.totalBorrow,
        total: payload.total,
      };

    case marketplaceConstants.FETCH_ASSETS_MARKET_ERROR:
      return {
        ...state,
        requesting: false,
        message: payload.message,
      };

    default:
      return state;
  }
}

export const selectListAssets = (state) => state.assetsMarketReducer.listAsset;
export const selectAssetByAddress = (state, address) => {
  if (address) {
    return state.assetsMarketReducer.assetEntities[address.toLowerCase()];
  }
  return null;
};
