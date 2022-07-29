import { createSelector } from "@reduxjs/toolkit";
import {
  addLiquidity,
  approveFirstTokenAddLiquidity,
  approveSecondTokenAddLiquidity,
  checkApproval,
  loadDetailAddLiquidity,
} from "../actions";
import { poolConstants } from "../constants";
import { selectAssetByAddress } from "./assetsMarket.reducer";

import {compareString} from '../utils/lib';

const initialState = {
  isSelectTokenModalOpen: false,
  isRemoveLiquidModalOpen: false,
  pending: false,

  transaction: null,
  errorCode: null,
  message: null,

  approveTokenA: 0,
  approveTokenB: 0,

  firstToken: null,
  secondToken: null,
  tokenSelecting: "",

  reserveA: 0,
  reserveB: 0,

  isCheckingApproval: false,
  isApproving: false,
  isAddingLiquidity: false,
  isAddingLiquiditySuccess: null,
  isLoadingLiquidityDetail: false,

  dataToken: null,
  data: {},
};

export function liquidReducer(state = initialState, action) {
  switch (action.type) {
    case poolConstants.MODAL_OPEN_ADD_LIQUIDITY:
      return {
        ...state,
        isAddLiquidModalOpen: true,
        pending: false,
        errorCode: null,
        message: null,
        ...action,
      };

    case poolConstants.MODAL_OPEN_SELECT_TOKEN:
      return {
        ...state,
        isSelectTokenModalOpen: true,
        pending: false,
        errorCode: null,
        message: null,
        ...action,
      };

    case poolConstants.MODAL_OPEN_SELECT_FIRST_TOKEN:
      return {
        ...state,
        isSelectTokenModalOpen: true,
        tokenSelecting: poolConstants.FIRST_TOKEN,
        pending: false,
        errorCode: null,
        message: null,
        ...action,
      };

    case poolConstants.MODAL_OPEN_SELECT_SECOND_TOKEN:
      return {
        ...state,
        isSelectTokenModalOpen: true,
        tokenSelecting: poolConstants.SECOND_TOKEN,
        pending: false,
        errorCode: null,
        message: null,
        ...action,
      };

    case poolConstants.SELECT_FIRST_TOKEN: {
      const newFirstToken = action.payload;
      if (state.secondToken === newFirstToken) {
        return {
          ...state,
          firstToken: newFirstToken,
          secondToken: state.firstToken,
        };
      }
      return {
        ...state,
        firstToken: newFirstToken,
      };
    }

    case poolConstants.SELECT_SECOND_TOKEN: {
      const newSecondToken = action.payload;
      if (state.firstToken === newSecondToken) {
        return {
          ...state,
          firstToken: state.secondToken,
          secondToken: newSecondToken,
        };
      }
      return {
        ...state,
        secondToken: newSecondToken,
      };
    }

    case poolConstants.MODAL_SELECT_TOKEN: {
      const newState = {
        ...state,
        isSelectTokenModalOpen: false,
        tokenSelecting: "",
        errorCode: null,
        message: null,
      };
      const newToken = action.payload;
      if (state.tokenSelecting === poolConstants.FIRST_TOKEN) {
        if (newToken === state.secondToken) {
          newState.secondToken = state.firstToken;
          newState.reserveA = state.reserveB;
          newState.reserveB = state.reserveA;
        }
        newState.firstToken = newToken;
      } else {
        if (newToken === state.firstToken) {
          newState.firstToken = state.secondToken;
          newState.reserveA = state.reserveB;
          newState.reserveB = state.reserveA;
        }
        newState.secondToken = newToken;
      }
      return newState;
    }

    case poolConstants.MODAL_CLOSE_SELECT_TOKEN:
      return {
        ...state,
        isSelectTokenModalOpen: false,
        tokenSelecting: "",
        pending: false,
        transaction: null,
        data: {},
        message: null,
      };

      case poolConstants.MODAL_OPEN_REMOVE_LIQUIDITY:
        return {
          ...state,
          isRemoveLiquidModalOpen: true,
          poolAddress: action.poolAddress
        };

      case poolConstants.MODAL_CLOSE_REMOVE_LIQUIDITY:
        return {
          ...state,
          isRemoveLiquidModalOpen: false
        };

    case loadDetailAddLiquidity.pending.type: {
      return {
        ...state,
        isLoadingLiquidityDetail: true,
      };
    }
    case loadDetailAddLiquidity.fulfilled.type: {
      return {
        ...state,
        isAddingLiquidity: false,
        isLoadingLiquidityDetail: false,
        ...action.payload,
      };
    }
    case loadDetailAddLiquidity.rejected.type: {
      return {
        ...state,
        isLoadingLiquidityDetail: false,
      };
    }

    case poolConstants.APPROVE_TOKEN: {
      const data = action.payload;
      if (  compareString(state.firstToken,data?.assetAddress )) {
        return {
          ...state,
          approveTokenA: state.approveTokenA + data?.approveAmount || 0,
          isApproving: false,
        };
      } else if (compareString(state.secondToken ,data?.assetAddress)) {
        return {
          ...state,
          approveTokenB: state.approveTokenB + data?.approveAmount || 0,
          isApproving: false,
        };
      }
      return state;
    }

    // APPROVE_TOKEN 1
    case approveFirstTokenAddLiquidity.pending.type: {
      return {
        ...state,
        isApproving: true,
      };
    }
    case approveFirstTokenAddLiquidity.fulfilled.type: {
      return {
        ...state,
        isApproving: false,
        approveTokenA: action.payload.approveTokenA,
      };
    }
    case approveFirstTokenAddLiquidity.rejected.type: {
      return {
        ...state,
        isApproving: false,
      };
    }

    case approveSecondTokenAddLiquidity.pending.type: {
      return {
        ...state,
        isApproving: true,
      };
    }
    case approveSecondTokenAddLiquidity.fulfilled.type: {
      return {
        ...state,
        isApproving: false,
        approveTokenB: action.payload.approveTokenB,
      };
    }
    case approveSecondTokenAddLiquidity.rejected.type: {
      return {
        ...state,
        isApproving: false,
      };
    }

    case addLiquidity.pending.type: {
      return {
        ...state,
        isAddingLiquidity: true,
      };
    }
    case addLiquidity.fulfilled.type: {
      return {
        ...state,
        isAddingLiquidity: false,
        isAddingLiquiditySuccess: true,
      };
    }
    case addLiquidity.rejected.type: {
      return {
        ...state,
        isAddingLiquidity: false,
        isAddingLiquiditySuccess: false,
      };
    }

    case poolConstants.LIQUIDITY_CLEAR_SELECTED_TOKENS: {
      return {
        ...state,
        firstToken: null,
        secondToken: null,
      };
    }

    case checkApproval.pending.type: {
      return {
        ...state,
        isCheckingApproval: true,
      };
    }
    case checkApproval.fulfilled.type: {
      return {
        ...state,
        isCheckingApproval: false,
        ...action.payload,
      };
    }
    case checkApproval.rejected.type: {
      return {
        ...state,
        isCheckingApproval: false,
      };
    }

    default:
      return state;
  }
}

export const selectLiquidReducer = (state) => state.liquidReducer;
export const selectOpenChooseTokenState = (state) =>
  state.liquidReducer.isSelectTokenModalOpen;
export const selectOpenAddLiquidState = (state) =>
  state.liquidReducer.isAddLiquidModalOpen;
export const selectOpenRemoveLiquidState = (state) =>
  state.liquidReducer.isRemoveLiquidModalOpen;
export const selectPoolAddressToRemove = (state) =>
  state.liquidReducer.poolAddress;
export const selectFirstTokenExchangeRate = (state) =>
  state.liquidReducer.abExchangeRate;
export const selectSecondTokenExchangeRate = (state) =>
  state.liquidReducer.baExchangeRate;
export const selectFirstToken = (state) => state.liquidReducer.firstToken;
export const selectSecondToken = (state) => state.liquidReducer.secondToken;
export const selectApproveFirstToken = (state) =>
  state.liquidReducer.approveTokenA;
export const selectApproveSecondToken = (state) =>
  state.liquidReducer.approveTokenB;
export const selectApproveState = (state) => state.liquidReducer.isApproving;
export const selectAddingLiquidityState = (state) =>
  state.liquidReducer.isAddingLiquidity;
export const selectAddingLiquidityFinishState = (state) =>
  state.liquidReducer.isAddingLiquiditySuccess;
export const selectCheckApprovalState = (state) =>
  state.liquidReducer.isCheckingApproval;
export const selectLoadLiquidityDetail = (state) =>
  state.liquidReducer.isLoadingLiquidityDetail;

export const selectTotalSupply = (state) => state.liquidReducer.totalSupply;
export const selectLiquidityPool = (state) => state.liquidReducer.liquidityPool;
export const selectReserveA = (state) => state.liquidReducer.reserveA;
export const selectReserveB = (state) => state.liquidReducer.reserveB;
