import { marketplaceConstants } from '../constants';

const initialState = {

  requesting: false,
  success: false,
  message: null,

  accountTotalSupplied: null,
  accountTotalBorrowed: null,
  
  healthFactor: null,
  netAPY:null,

  query: {},
  total: 0,
  data: []

}

export function accountOverviewReducer(state = initialState, payload) {

  switch (payload.type) {
    case marketplaceConstants.FETCH_ACCOUNT_OVERVIEW_REQUEST:
      return {
        ...state,
        requesting: true,
        query: payload.query ? payload.query : {},
      };
    case marketplaceConstants.FETCH_ACCOUNT_OVERVIEW_SUCCESS:
      return {
        ...state,
        requesting: false,
        success: true,
        ...payload.data
      };
    case marketplaceConstants.FETCH_ACCOUNT_OVERVIEW_ERROR:
      return {
        ...state,
        requesting: false,
        message: payload.message
      };

    default:
      return state;
  }
}