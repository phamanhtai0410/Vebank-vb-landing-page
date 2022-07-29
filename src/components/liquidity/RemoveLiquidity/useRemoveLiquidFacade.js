import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as actions from "../../../actions";
import { selectAssetByAddress } from "../../../reducers/assetsMarket.reducer";
import { selectPoolAddressToRemove } from "../../../reducers/liquid.reducer";

import {
  selectAddressTokenA,
  selectAddressTokenB,
  selectAmountTokenA,
  selectAmountTokenB,
  selectApprovingState,
  selectFirstTokenExchangeRate,
  selectLiquidityPool,
  selectLoadingState,
  selectPoolApproval,
  selectRemoveTransactionId,
  selectRemovingFinishState,
  selectRemovingState,
  selectSecondTokenExchangeRate,
} from "../../../reducers/removeLiquidity.reducer";
import { selectWeb3 } from "../../../reducers/web3.reducer";

const useRemoveLiquidFacade = () => {
  const dispatch = useDispatch();
  // const { addressPool: poolAddress } = useParams();
  const poolAddress = useSelector(selectPoolAddressToRemove);
  const navigation = useNavigate();

  const web3 = useSelector(selectWeb3);
  const txid = useSelector(selectRemoveTransactionId);
  const isApproving = useSelector(selectApprovingState);
  const approvePoolState = useSelector(selectPoolApproval);
  const isLoadingDetail = useSelector(selectLoadingState);
  const isRemoving = useSelector(selectRemovingState);
  const removePoolSuccessState = useSelector(selectRemovingFinishState);
  const liquidityPool = useSelector(selectLiquidityPool);
  const firstTokenAddress = useSelector(selectAddressTokenA);
  const firstTokenInfo = useSelector((state) =>
    selectAssetByAddress(state, firstTokenAddress)
  );
  const firstTokenAmount = useSelector(selectAmountTokenA);
  const secondTokenAddress = useSelector(selectAddressTokenB);
  const secondTokenInfo = useSelector((state) =>
    selectAssetByAddress(state, secondTokenAddress)
  );
  const secondTokenAmount = useSelector(selectAmountTokenB);

  const firstPerSecondTokenExchangeRate = useSelector(
    selectFirstTokenExchangeRate
  );
  const secondPerFirstTokenExchangeRate = useSelector(
    selectSecondTokenExchangeRate
  );

  const [enableBtnLabel, setEnableBtnLabel] = useState("Enable");
  const [continueAvailable, setContinueAvailable] = useState(false);
  const [primaryButtonLabel, setPrimaryButtonLabel] =
    useState("Enter an amount");
  const [removeValue, setRemoveValue] = useState(0);

  const amountTokenA = useMemo(() => {
    return firstTokenAmount * (removeValue / liquidityPool) || 0;
  }, [firstTokenAmount, removeValue, liquidityPool]);

  const amountTokenB = useMemo(() => {
    return secondTokenAmount * (removeValue / liquidityPool) || 0;
  }, [secondTokenAmount, removeValue, liquidityPool]);

  const isEnabled = useMemo(() => {
    console.log('🐶🐶  ~ isEnabled ~ approvePoolState', approvePoolState)
    return !isApproving && approvePoolState > 0 && approvePoolState >= liquidityPool;
  }, [isApproving, approvePoolState, liquidityPool]);

  const removeAvailable = useMemo(() => {
    return (
      isLoadingDetail === false &&
      removeValue > 0 &&
      approvePoolState >= removeValue &&
      liquidityPool >= removeValue
    );
  }, [removeValue, approvePoolState, isLoadingDetail, liquidityPool]);

  const closeModal = () => {
    navigation(-1);
  };

  const resetFrm = () => {
    setRemoveValue(0);
    setPrimaryButtonLabel("Enter an amount");
  };

  const handlerStepToStep = () => {
    removeLiquidity();
  };

  const removeLiquidity = () => {
    dispatch(
      actions.removeLiquidity({
        amount: removeValue,
        poolAddress,
        amountTokenA,
        amountTokenB,
        tokenAInfo: firstTokenInfo,
        tokenBInfo: secondTokenInfo,
      })
    );
  };

  const onEnableClicked = async () => {
    await dispatch(
      actions.approvePoolLiquidity({
        poolAddress,
        removeValue
      })
    );
  };

  const onChangeRemoveValue = useCallback(
    (value) => {
      // Check matching format and set the other token amount with the relative rate.
      if (value.isMatch?.(/^\d*\.?\d*$/)) {
        setRemoveValue(value);
      }
    },
    []
  );

  useEffect(() => {
    if (isLoadingDetail === true) {
      setContinueAvailable(false);
      setPrimaryButtonLabel("Loading details...");
    } else {
      setPrimaryButtonLabel("Remove Liquidity");
    }
  }, [isLoadingDetail]);

  useEffect(() => {
    console.log("approvePoolState", approvePoolState)
    console.log("isApproving", isApproving)
    if (!isApproving) {
      if (approvePoolState <= 0) {
        setEnableBtnLabel("Enable");
      } else if (isEnabled) {
        setEnableBtnLabel("Enabled");
        setContinueAvailable(true);
      } else {
        setEnableBtnLabel("Enable");
        setContinueAvailable(false);
      }
    } else {
      setEnableBtnLabel("Enabling...");
    }
  }, [isApproving, approvePoolState]);

  useEffect(() => {
    if (poolAddress && web3) {
      dispatch(actions.loadDetailRemoveLiquidity(poolAddress));
    }
    return () => dispatch(actions.clearRemoveLiquidityData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolAddress, web3]);

  useEffect(() => {
    if (!isRemoving) {
      if (removePoolSuccessState === false) {
        // User decline or adding liquidity failed
        // setStep(2);
      } else if (removePoolSuccessState === true) {
        // setPrimaryButtonLabel("Close");
        // setStep(4);
        dispatch(actions.closeModalRemoveLiquidity());
        resetFrm();
      }
    }
  }, [isRemoving, removePoolSuccessState]);

  useEffect(() => {
    console.log("firstTokenAmount", firstTokenAmount);
    console.log("secondTokenAmount", secondTokenAmount);
    console.log("liquidityPool", liquidityPool);
    console.log("amountTokenA", amountTokenA);
    console.log("amountTokenB", amountTokenB);
    if (Number(removeValue) > Number(liquidityPool)) {
      setPrimaryButtonLabel("Amount Too Large");
    }
    else if (Number(removeValue)===0) {
      setPrimaryButtonLabel("Enter an amount");
    }
    else {
      setPrimaryButtonLabel("Remove Liquidity");
    }
  }, [removeValue, liquidityPool]);

  return {
    txid,
    firstTokenInfo,
    secondTokenInfo,
    amountTokenA,
    amountTokenB,
    enableBtnLabel,
    firstPerSecondTokenExchangeRate,
    secondPerFirstTokenExchangeRate,
    removeAvailable,
    isEnabled,
    continueAvailable,
    primaryButtonLabel,
    liquidityPool,
    removeValue,
    isRemoving,
    closeModal,
    onEnableClicked,
    removeLiquidity,
    handlerStepToStep,
    onChangeRemoveValue,
  };
};

export default useRemoveLiquidFacade;
