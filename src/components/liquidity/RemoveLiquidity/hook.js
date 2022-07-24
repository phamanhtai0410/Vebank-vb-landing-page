import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as actions from "../../../actions";
import { selectAssetByAddress } from "../../../reducers/assetsMarket.reducer";
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
  const { addressPool: poolAddress } = useParams();
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

  const [step, setStep] = useState(1);
  const [enableBtnLabel, setEnableBtnLabel] = useState("Enable");
  const [amountPercentage, setAmountPercentage] = useState(0);
  const [continueAvailable, setContinueAvailable] = useState(false);
  const [primaryButtonLabel, setPrimaryButtonLabel] =
    useState("Enter an amount");

  const amountTokenA = useMemo(() => {
    return firstTokenAmount * (amountPercentage / 100.0) || 0;
  }, [firstTokenAmount, amountPercentage]);

  const amountTokenB = useMemo(() => {
    return secondTokenAmount * (amountPercentage / 100.0) || 0;
  }, [secondTokenAmount, amountPercentage]);

  const removeAmount = useMemo(
    () => (liquidityPool * amountPercentage) / 100,
    [amountPercentage, liquidityPool]
  );

  const isEnabled = useMemo(() => {
    console.log('🐶🐶  ~ isEnabled ~ approvePoolState', approvePoolState)
    return !isApproving && approvePoolState > 0 && approvePoolState >= removeAmount;
  }, [isApproving, removeAmount, approvePoolState]);

  const removeAvailable = useMemo(() => {
    return (
      isLoadingDetail === false &&
      amountPercentage > 0 &&
      approvePoolState >= removeAmount
    );
  }, [amountPercentage, approvePoolState, isLoadingDetail, removeAmount]);

  const closeModal = () => {
    navigation(-1);
  };

  const resetFrm = () => {
    setStep(1);
    setContinueAvailable(false);
    setAmountPercentage(0);
    setPrimaryButtonLabel("Enter an amount");
  };

  const closeModalAndDashboard = () => {
    if (step === 1 || step === 4) {
      closeModal();
      resetFrm();
    } else if (step === 2) {
      setStep(1);
      setPrimaryButtonLabel("Continue");
    }
  };

  const handlerStepToStep = () => {
    if (step === 1) {
      setStep(2);
      setPrimaryButtonLabel("Confirm");
    }

    if (step === 2) {
      setStep(3);
      removeLiquidity();
    }
  };

  const removeLiquidity = () => {
    dispatch(
      actions.removeLiquidity({
        amount: amountPercentage,
        poolAddress,
        amountTokenA,
        amountTokenB,
        tokenAInfo: firstTokenInfo,
        tokenBInfo: secondTokenInfo,
      })
    );
  };

  const onSelectMileStone = (percentage) => {
    setAmountPercentage(percentage);
  };

  const onEnableClicked = async () => {
    await dispatch(
      actions.approvePoolLiquidity({
        poolAddress,
        removeAmount
      })
    );
  };

  useEffect(() => {
    if (isLoadingDetail === true) {
      setContinueAvailable(false);
      setPrimaryButtonLabel("Loading details...");
    } else {
      setPrimaryButtonLabel("Remove");
    }
  }, [isLoadingDetail]);

  useEffect(() => {
    if (amountPercentage !== 0) {
      setPrimaryButtonLabel("Remove");
      setEnableBtnLabel(isEnabled ? "Enabled" : "Enable")
    } else {
      setPrimaryButtonLabel("Enter an amount");
    }
  }, [amountPercentage]);

  useEffect(() => {
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
    if (step === 3 && !isRemoving) {
      if (removePoolSuccessState === false) {
        // User decline or adding liquidity failed
        setStep(2);
      } else if (removePoolSuccessState === true) {
        setPrimaryButtonLabel("Close");
        setStep(4);
      }
    }
  }, [isRemoving, removePoolSuccessState, step]);

  return {
    step,
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
    amountPercentage,
    continueAvailable,
    primaryButtonLabel,
    closeModal,
    onEnableClicked,
    removeLiquidity,
    onSelectMileStone,
    handlerStepToStep,
    closeModalAndDashboard,
  };
};

export default useRemoveLiquidFacade;
