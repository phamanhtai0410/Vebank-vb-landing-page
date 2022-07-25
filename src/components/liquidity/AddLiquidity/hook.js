import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as actions from "../../../actions";
import { selectAssetByAddress } from "../../../reducers/assetsMarket.reducer";
import {
  selectAddingLiquidityFinishState,
  selectAddingLiquidityState,
  selectApproveFirstToken,
  selectApproveSecondToken,
  selectFirstToken,
  selectFirstTokenExchangeRate,
  selectTotalSupply,
  selectSecondToken,
  selectSecondTokenExchangeRate,
  selectReserveA,
  selectReserveB,
  selectLiquidityPool,
  selectLoadLiquidityDetail,
} from "../../../reducers/liquid.reducer";
import { selectBalanceById } from "../../../reducers/accountBalance.reducer";
import RouteName from "../../../constants/routeName.constants";
import { selectAccount } from "../../../reducers/web3.reducer";
import { FixedNumber } from "ethers";

const useAddLiquidFacade = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { addressPool: poolAddress } = useParams();
  const firstToken = useSelector(selectFirstToken, shallowEqual);
  const secondToken = useSelector(selectSecondToken, shallowEqual);
  const isLoadingLiquidityDetail = useSelector(selectLoadLiquidityDetail);
  const isAddingLiquidity = useSelector(selectAddingLiquidityState);
  const addLiquidityState = useSelector(selectAddingLiquidityFinishState);
  const approveFirstToken = useSelector(selectApproveFirstToken);
  const approveSecondToken = useSelector(selectApproveSecondToken);
  const firstTokenInfo = useSelector((state) =>
    selectAssetByAddress(state, firstToken)
  );
  const secondTokenInfo = useSelector((state) =>
    selectAssetByAddress(state, secondToken)
  );
  const firstTokenBalance = useSelector((state) =>
    selectBalanceById(state, firstToken)
  );
  const secondTokenBalance = useSelector((state) =>
    selectBalanceById(state, secondToken)
  );

  const account = useSelector(selectAccount);
  const userCurrentLiquidityPool = useSelector(selectLiquidityPool);
  const totalSupply = useSelector(selectTotalSupply);
  const reserveB = useSelector(selectReserveA);
  const reserveA = useSelector(selectReserveB);

  const [step, setStep] = useState(1);
  const [continueAvailable, setContinueAvailable] = useState(false);
  const [firstTokenVolume, setFirstTokenVolume] = useState("");
  const [secondTokenVolume, setSecondTokenVolume] = useState("");
  const [primaryButtonLabel, setPrimaryButtonLabel] = useState("Invalid pair");

  const firstPerSecondTokenExchangeRate =
    useSelector(selectFirstTokenExchangeRate) ??
    secondTokenVolume / firstTokenVolume;

  const secondPerFirstTokenExchangeRate =
    useSelector(selectSecondTokenExchangeRate) ??
    firstTokenVolume / secondTokenVolume;

  const liquidityEstimated = useMemo(() => {
    if (!totalSupply) {
      return (
        Math.sqrt(firstTokenVolume * secondTokenVolume) -
        Number(process.env.REACT_APP_MINIMUM_LIQUIDITY)
      );
    }
    return reserveA !== 0 || reserveB !== 0
      ? Math.min(
          (firstTokenVolume * totalSupply) / reserveA,
          (secondTokenVolume * totalSupply) / reserveB
        )
      : 0; // No reserves => No calculations
  }, [totalSupply, firstTokenVolume, reserveA, secondTokenVolume, reserveB]);

  const shareAPool = useMemo(
    () =>
      ((liquidityEstimated + Number(userCurrentLiquidityPool)) * 100.0) /
      (Number(totalSupply) + liquidityEstimated),
    [liquidityEstimated, totalSupply, userCurrentLiquidityPool]
  );

  const onSelectFirstCurrency = useCallback(
    (e) => {
      // Open the select token modal and let the reducer know that this current process is selecting the first token of the pool
      // A warning dialog will be display if user haven't connect to their wallet
      const action = account
        ? actions.selectFirstToken()
        : actions.alertActions.warning({
            title: "Warning",
            description: "You need to connect to your wallet first",
          });
      dispatch(action);
    },
    [account, dispatch]
  );
  const onSelectSecondCurrency = useCallback(
    (e) => {
      // Open the select token modal and let the reducer know that this current process is selecting the second token of the pool
      // A warning dialog will be display if user haven't connect to their wallet
      const action = account
        ? actions.selectSecondToken()
        : actions.alertActions.warning({
            title: "Warning",
            description: "You need to connect to your wallet first",
          });
      dispatch(action);
    },
    [account, dispatch]
  );

  // Calculate the corresponding amount with the given value
  const getFirstAmount = useCallback(
    (input) =>
      FixedNumber.from(input)
        .mulUnsafe(FixedNumber.from(secondPerFirstTokenExchangeRate.toString()))
        .toString(),
    [secondPerFirstTokenExchangeRate]
  );

  // Calculate the corresponding amount with the given value
  const getSecondAmount = useCallback(
    (input) =>
      FixedNumber.from(input)
        .mulUnsafe(FixedNumber.from(firstPerSecondTokenExchangeRate.toString()))
        .toString(),
    [firstPerSecondTokenExchangeRate]
  );

  const onChangeFirstTokenAmount = useCallback(
    (value) => {
      // Check matching format and set the other token amount with the relative rate.
      if (value.isMatch?.(/^\d*\.?\d*$/)) {
        if (totalSupply === 0) {
          setFirstTokenVolume(value);
        } else if (value !== "") {
          const secondTokenAmount = getSecondAmount(value);
          // if (
          //   value <= firstTokenBalance &&
          //   secondTokenAmount <= secondTokenBalance
          // ) {
          // if (value <= firstTokenBalance) {
          setFirstTokenVolume(value);
          setSecondTokenVolume(secondTokenAmount.toString());
          // }
        } else {
          // Clear inputs from both field
          setFirstTokenVolume(value);
          setSecondTokenVolume(value);
        }
      } else if (value !== "") {
        setFirstTokenVolume(firstTokenVolume);
      }
    },
    [firstTokenVolume, getSecondAmount, totalSupply]
  );

  const onChangeSecondTokenAmount = useCallback(
    (value) => {
      // Check matching format and set the other token amount with the relative rate.
      if (value.isMatch?.(/^\d*\.?\d*$/)) {
        if (totalSupply === 0) {
          setSecondTokenVolume(value);
        } else if (value !== "") {
          const firstTokenAmount = getFirstAmount(value);
          // if (
          //   value <= secondTokenBalance &&
          //   firstTokenAmount <= firstTokenBalance
          // ) {
          // if (value <= secondTokenBalance) {
          setSecondTokenVolume(value);
          setFirstTokenVolume(firstTokenAmount.toString());
          // }
        } else {
          // Clear inputs from both field
          setFirstTokenVolume(value);
          setSecondTokenVolume(value);
        }
      } else if (value !== "") {
        setSecondTokenVolume(secondTokenVolume);
      }
    },
    [totalSupply, getFirstAmount, secondTokenVolume]
  );

  const closeModal = () => {
    navigate(-1);
  };

  const resetFrm = () => {
    setFirstTokenVolume("");
    setSecondTokenVolume("");
    setStep(1);
  };

  const closeModalAndDashboard = () => {
    if (step === 1) {
      closeModal();
      resetFrm();
    } else if (step === 2) {
      setStep(1);
      setPrimaryButtonLabel("Continue");
    } else if (step === 4) {
      setStep(2);
      setPrimaryButtonLabel("Confirm Supply");
    }
  };

  const handlerStepToStep = (e) => {
    if (!account) {
      dispatch(actions.web3Connect(true));
    } else if (
      step === 1 &&
      firstToken &&
      secondToken &&
      firstTokenVolume > 0 &&
      secondTokenVolume > 0
    ) {
      // Check if both token approval is enough for this current add liquidity process
      dispatch(
        actions.checkApproval({
          firstTokenAddress: firstToken,
          secondTokenAddress: secondToken,
        })
      );
      setStep(2);
      setPrimaryButtonLabel("Confirm Supply");
    }

    if (step === 2) {
      setStep(3);
      handleAddLiquidity();
    }
  };

  const handleAddLiquidity = () => {
    dispatch(
      actions.addLiquidity({
        firstAmount: firstTokenVolume,
        secondAmount: secondTokenVolume,
      })
    );
  };

  useEffect(() => {
    // This effect is mainly to update the primary button label while loading detail state is changing
    if (isLoadingLiquidityDetail) {
      setContinueAvailable(false);
      setPrimaryButtonLabel("Loading details...");
    } else {
      // Load detail finished or first initialized
      if (reserveA > 0 && reserveB > 0) {
        // If pair loaded
        if (
          firstTokenVolume !== 0 &&
          firstTokenVolume !== "" &&
          secondTokenVolume !== 0 &&
          secondTokenVolume !== ""
        ) {
          const secondAmount = getSecondAmount(firstTokenVolume);
          if (secondTokenVolume !== secondAmount) {
            setSecondTokenVolume(secondAmount);
          }
          setPrimaryButtonLabel("Supply");
          setContinueAvailable(true);
        } else if (secondTokenVolume === 0 || secondTokenVolume === "") {
          if (firstTokenVolume !== 0 && firstTokenVolume !== "") {
            setSecondTokenVolume(getSecondAmount(firstTokenVolume));
          } else setPrimaryButtonLabel("Enter an amount");
        } else {
          setFirstTokenVolume(getFirstAmount(secondTokenVolume));
          setPrimaryButtonLabel("Supply");
          setContinueAvailable(true);
        }
      }

      if (!firstToken || !secondToken) {
        setPrimaryButtonLabel("Invalid pair");
      }

      if (!account) {
        setContinueAvailable(true);
        setPrimaryButtonLabel("Connect wallet");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingLiquidityDetail]);

  useEffect(() => {
    // This effect is used to update primary button label and disabled state when input and account changed
    switch (step) {
      case 1: {
        if (!account) {
          setContinueAvailable(true);
          setPrimaryButtonLabel("Connect wallet");
        } else if (!firstToken || !secondToken) {
          setPrimaryButtonLabel("Invalid pair");
          setContinueAvailable(false);
        } else if (
          firstTokenVolume.length === 0 ||
          secondTokenVolume.length === 0 ||
          firstTokenVolume <= 0 ||
          secondTokenVolume <= 0
        ) {
          setPrimaryButtonLabel("Enter an amount");
          setContinueAvailable(false);
        } else if (
          firstTokenVolume > firstTokenBalance ||
          secondTokenVolume > secondTokenBalance
        ) {
          setContinueAvailable(false);
          setPrimaryButtonLabel("Balance not available");
        } else {
          setContinueAvailable(true);
          setPrimaryButtonLabel("Supply");
        }
        break;
      }
      case 2: {
        break;
      }
      default: {
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstToken, secondToken, firstTokenVolume, secondTokenVolume, account]);

  useEffect(() => {
    // If user change one or another token, the input fields will be cleared.
    setFirstTokenVolume("");
    setSecondTokenVolume("");
  }, [firstToken, secondToken]);

  useEffect(() => {
    // Process the addLiquidity state if it failed, rejected or success
    if (step === 3 && !isAddingLiquidity) {
      if (addLiquidityState === false) {
        // User decline or adding liquidity failed
        setStep(2);
      } else if (addLiquidityState === true) {
        navigate(RouteName.LIQUIDITY, {replace: true});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddingLiquidity, addLiquidityState, step]);

  useEffect(() => {
    // Fetch the detail when page is first loaded
    dispatch(actions.loadDetailAddLiquidity(poolAddress));
    return () => {
      // When user is leaving this page, this callBack will be triggered to clear the values
      resetFrm();
      dispatch(actions.clearSelectedTokens());
    };
  }, [dispatch, poolAddress]);

  return {
    step,
    shareAPool,
    liquidityEstimated,
    firstToken,
    secondToken,
    continueAvailable,
    firstTokenVolume,
    secondTokenVolume,
    primaryButtonLabel,
    approveFirstToken,
    approveSecondToken,
    firstTokenInfo,
    secondTokenInfo,
    firstPerSecondTokenExchangeRate,
    secondPerFirstTokenExchangeRate,
    closeModal,
    handlerStepToStep,
    closeModalAndDashboard,
    onSelectFirstCurrency,
    onSelectSecondCurrency,
    onChangeFirstTokenAmount,
    onChangeSecondTokenAmount,
  };
};

export default useAddLiquidFacade;
