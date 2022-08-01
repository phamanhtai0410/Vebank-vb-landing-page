import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectDesireToken,
  selectSourceToken,
  // swapTokenDesire,
  openModalSelectToken,
  selectExchangeRateAB,
  selectExchangeRateBA,
  selectPairsFee,
  selectLoadingFee,
  selectAccountApprove,
  selectEmptyAddress,
  selectPoolAddress,
  selectReserveFrom,
  selectReserveTo,
  switchReserves,
} from "../../reducers/swap.reducer";
import { selectAssetByAddress } from "../../reducers/assetsMarket.reducer";
import { selectPriceByTokenAddress } from "../../reducers/assetsPrice.reducer";
import { useMemo } from "react";
import { selectBalanceById } from "../../reducers/accountBalance.reducer";
import { selectAccount } from "../../reducers/web3.reducer";
import * as actions from "../../actions";
import {
  checkApproveToken,
  checkAssetExistsPools,
  checkExchangeRatePool,
  getAmountsIn,
  getAmountsOut,
  getPairsFee,
  onApproveTokenForAccount,
} from "../../actions";
import { useDebouncedCallback } from "use-debounce";
import PartialConstants from "../../constants/partial.constants";
import { formatLocaleString, getDecimalForAsset } from "../../utils/lib";

const useSwapFacade = () => {
  const dispatch = useDispatch();
  const [loadingExchangeRate, setLoadingExchangeRate] = useState(false);
  const account = useSelector(selectAccount);
  const [inputAmountIn, setInputAmountIn] = useState("");
  const [inputAmountOut, setInputAmountOut] = useState("");
  const [inputSlippage, setInputSlippage] = useState(0.5);
  const [pressSwap, setPressSwap] = useState(false);
  const [showDetailInfo, setShowDetailInfo] = useState(true);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [pricePaidPerA, setPricePaidPerA] = useState(0);
  const [pricePaidPerB, setPricePaidPerB] = useState(0);
  const [isSwitch, setIsSwitch] = useState(false);

  const defaultErr = "Enter an amount to see more trading details.";
  const slippageErr = "Slippage no smaller than 0.5% or no greater than 50%";
  const [error, setError] = useState(defaultErr);
  const poolErrRef = useRef("");

  const userInputRef = useRef("");
  const amountInRef = useRef(inputAmountIn);
  const amountOutRef = useRef(inputAmountOut);

  const sourceTokenAddress = useSelector(selectSourceToken);
  const desireTokenAddress = useSelector(selectDesireToken);

  const exchangeRateAB = useSelector(selectExchangeRateAB);
  const exchangeRateBA = useSelector(selectExchangeRateBA);
  const fee = useSelector(selectPairsFee);
  const loadingFee = useSelector(selectLoadingFee);
  const [loadingGetAmountOut, selectLoadingGetAmountOut] = useState(false);
  const [loadingGetAmountIn, selectLoadingGetAmountIn] = useState(false);
  // const loadingGetAmountOut = useSelector(selectLoadingGetAmountOut);
  // const loadingGetAmountIn = useSelector(selectLoadingGetAmountIn);
  const reserveFrom = useSelector(selectReserveFrom);
  const reserveTo = useSelector(selectReserveTo);

  const accountApprove = useSelector(selectAccountApprove);
  const emptyAddress = useSelector(selectEmptyAddress);
  const poolAddress = useSelector(selectPoolAddress);

  const poolAddressRef = useRef("");

  const sourceTokenInfo = useSelector((state) =>
    selectAssetByAddress(state, sourceTokenAddress)
  );
  const desireTokenInfo = useSelector((state) =>
    selectAssetByAddress(state, desireTokenAddress)
  );
  const sourceTokenPrice = useSelector((state) =>
    selectPriceByTokenAddress(state, sourceTokenAddress)
  );
  const desireTokenPrice = useSelector((state) =>
    selectPriceByTokenAddress(state, desireTokenAddress)
  );
  const sourceTokenBalance = useSelector((state) =>
    selectBalanceById(state, sourceTokenAddress)
  );
  const desireTokenBalance = useSelector((state) =>
    selectBalanceById(state, desireTokenAddress)
  );
  const vthoBalance = useSelector((state) =>
    selectBalanceById(state, process.env.REACT_APP_TOKEN_VTHO)
  );

  const swapFee = useMemo(
    () => (inputAmountIn * (fee / 10)) / 100,
    [fee, inputAmountIn]
  );

  const sourcePerDesireTokenPrice = useMemo(
    () => sourceTokenPrice / desireTokenPrice,
    [sourceTokenPrice, desireTokenPrice]
  );
  const desireTokenAmount = useMemo(
    () => inputAmountIn * exchangeRateAB,
    [inputAmountIn, exchangeRateAB]
  );

  const desirePerSourceTokenPrice = useMemo(
    () => desireTokenPrice / sourceTokenPrice,
    [sourceTokenPrice, desireTokenPrice]
  );
  const sourceTokenAmount = useMemo(
    () => inputAmountOut * desirePerSourceTokenPrice,
    [inputAmountOut, desirePerSourceTokenPrice]
  );

  const constantProduct = useMemo(
    () => reserveFrom * reserveTo,
    [reserveFrom, reserveTo]
  );

  const marketPrice = useMemo(
    () => reserveFrom / reserveTo,
    [reserveFrom, reserveTo]
  );

  const amountOutMin = useMemo(
    () =>
      getDecimalForAsset(desireTokenInfo.assetsAddress) ===
      PartialConstants.VEUSD_DECIMAL
        ? formatLocaleString(
            inputAmountOut - (inputAmountOut * inputSlippage) / 100,
            PartialConstants.VEUSD_DECIMAL,
            false
          )
        : formatLocaleString(
            inputAmountOut - (inputAmountOut * inputSlippage) / 100,
            PartialConstants.DEFAULT_ASSET_DECIMAL,
            false
          ),
    [desireTokenInfo.assetsAddress, inputAmountOut, inputSlippage]
  );

  const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  const getExchangeRateLoop = async (assetsPoolAddress) => {
    onCheckExchangeRatePool(
      assetsPoolAddress ? assetsPoolAddress : poolAddressRef.current
    );
    await sleep(30000);
    getExchangeRateLoop(poolAddressRef.current);
  };

  useEffect(() => {
    dispatch(
      checkAssetExistsPools({
        tokenAInfo: sourceTokenInfo,
        tokenBInfo: desireTokenInfo,
      })
    )
      .unwrap()
      .then((originalPromiseResult) => {
        const { emptyAddress, assetsPoolAddress } = originalPromiseResult;
        poolAddressRef.current = assetsPoolAddress;
        if (!emptyAddress) {
          getExchangeRateLoop(assetsPoolAddress);
        }
      })
      .catch((rejectedValueOrSerializedError) => {});
  }, []);

  useEffect(() => {
    onCheckApproveToken();
    onGetPairsFee();
  }, [sourceTokenInfo, account]);

  useEffect(() => {
    if (userInputRef.current !== "") {
      if (pressSwap) {
        dispatch(switchReserves());
        amountInRef.current = inputAmountOut;
        const isBalanceInAvailable = checkBalance(amountInRef.current);
        if (isBalanceInAvailable) {
          if (inputAmountIn === "" && inputAmountOut === "") {
            setError(emptyAddress ? "Not existed liquidity." : defaultErr);
          } else {
            if (
              amountInRef.current === userInputRef.current &&
              amountInRef.current !== ""
            ) {
              setInputAmountOut("");
              checkBalance(userInputRef.current);
              setInputAmountIn(userInputRef.current);
              getAmountOutDebounced(userInputRef.current);
            }
            amountOutRef.current = inputAmountIn;

            if (
              amountOutRef.current === userInputRef.current &&
              amountOutRef.current !== ""
            ) {
              setInputAmountIn("");
              setInputAmountOut(userInputRef.current);
              getAmountsInDebounced(userInputRef.current);
            }
          }
        } else {
          setInputAmountOut("");
        }
        setPressSwap(false);
      } else {
        dispatch(
          checkAssetExistsPools({
            tokenAInfo: sourceTokenInfo,
            tokenBInfo: desireTokenInfo,
          })
        )
          .unwrap()
          .then((originalPromiseResult) => {
            const { emptyAddress, assetsPoolAddress } = originalPromiseResult;
            poolAddressRef.current = assetsPoolAddress;
            if (!emptyAddress) {
              if (inputAmountIn === "" && inputAmountOut === "") {
                setError(defaultErr);
              }
              setLoadingExchangeRate(true);
              if (
                inputAmountIn === userInputRef.current &&
                inputAmountIn !== ""
              ) {
                selectLoadingGetAmountOut(true);
              }
              if (
                inputAmountOut === userInputRef.current &&
                inputAmountOut !== ""
              ) {
                selectLoadingGetAmountIn(true);
              }
              dispatch(
                checkExchangeRatePool({
                  tokenAddressA: sourceTokenAddress,
                  tokenAddressB: desireTokenAddress,
                  assetsPoolAddress: assetsPoolAddress,
                })
              )
                .unwrap()
                .then((originalPromiseResult) => {
                  setLoadingExchangeRate(false);
                  if (
                    inputAmountIn === userInputRef.current &&
                    inputAmountIn !== ""
                  ) {
                    setInputAmountOut("");
                    selectLoadingGetAmountOut(false);
                    const isBalanceInAvailable = checkBalance(
                      userInputRef.current
                    );
                    if (isBalanceInAvailable) {
                      getAmountOutDebounced(userInputRef.current);
                    }
                  }
                  if (
                    inputAmountOut === userInputRef.current &&
                    inputAmountOut !== ""
                  ) {
                    selectLoadingGetAmountIn(false);
                    setInputAmountIn("");
                    getAmountsInDebounced(userInputRef.current);
                  }
                })
                .catch((rejectedValueOrSerializedError) => {
                  setLoadingExchangeRate(false);
                  if (
                    inputAmountIn === userInputRef.current &&
                    inputAmountIn !== ""
                  ) {
                    selectLoadingGetAmountOut(true);
                  }
                  if (
                    inputAmountOut === userInputRef.current &&
                    inputAmountOut !== ""
                  ) {
                    selectLoadingGetAmountIn(true);
                  }
                });
            } else {
              setError("Not existed liquidity.");
              userInputRef.current = "";
              setInputAmountIn("");
              setInputAmountOut("");
              poolErrRef.current = "Not existed liquidity.";
            }
          })
          .catch((rejectedValueOrSerializedError) => {});
      }
    }
  }, [desireTokenAddress, sourceTokenAddress]);

  const onCountPriceImpact = (amountIn) => {
    const newTokenTo =
      Number(constantProduct) / (Number(reserveFrom) + Number(amountIn));
    const tokenToReceived = Number(reserveTo) - newTokenTo;
    const pricePaidPerTokenFrom = tokenToReceived / Number(amountIn);
    const pricePaidPerTokenTo = Number(amountIn) / tokenToReceived;
    setPricePaidPerA(pricePaidPerTokenFrom);
    setPricePaidPerB(pricePaidPerTokenTo);

    const amountInWithFee = Number(amountIn) * (1 - fee / 100);
    const priceImpact =
      (amountInWithFee / (Number(reserveFrom) + amountInWithFee)) * 100;
    // const priceImpact =
    //   ((pricePaidPerTokenTo - Number(marketPrice)) / Number(marketPrice)) * 100;
    setPriceImpact(priceImpact);
  };

  const onSwapDesireToken = () => {
    setPressSwap(true);
    dispatch(actions.swapTokenDesire());
  };

  const onSwapAssetToken = () => {
    setLoadingSwap(true);
    dispatch(
      actions.swapAsset({
        amountInToSwap: inputAmountIn,
        minAmountOut: amountOutMin,
        tokenAInfo: sourceTokenInfo,
        tokenBInfo: desireTokenInfo,
      })
    )
      .unwrap()
      .then((originalPromiseResult) => {
        if (originalPromiseResult) {
          onReloadPage();
        }
        setLoadingSwap(false);
      })
      .catch((rejectedValueOrSerializedError) => {
        setLoadingSwap(false);
      });
  };

  const onReloadPage = () => {
    setInputAmountIn("");
    setInputAmountOut("");
    poolErrRef.current = "";
    userInputRef.current = "";
    setError(defaultErr);
  };

  const onApproveToken = () => {
    setLoadingApprove(true);
    dispatch(
      onApproveTokenForAccount({
        tokenInfo: sourceTokenInfo,
      })
    )
      .unwrap()
      .then((originalPromiseResult) => {
        setLoadingApprove(false);
      })
      .catch((rejectedValueOrSerializedError) => {
        setLoadingApprove(false);
      });
  };

  const onShowModalSelectToken = (nameToken) => {
    dispatch(openModalSelectToken(nameToken));
  };

  const onShowDetailInfo = () => {
    setShowDetailInfo(!showDetailInfo);
  };

  const checkBalance = useCallback(
    (amount) => {
      setInputAmountIn(amount);
      if (parseFloat(amount) > sourceTokenBalance) {
        setError(`Insufficient ${sourceTokenInfo?.assetsChain} balance`);
        poolErrRef.current = `Insufficient ${sourceTokenInfo?.assetsChain} balance`;
        return false;
      } else {
        setError("");
        poolErrRef.current = "";
        return true;
      }
    },
    [sourceTokenBalance, sourceTokenInfo?.assetsChain]
  );

  const getAmountOutDebounced = useDebouncedCallback((value) => {
    onGetAmountsOut(value);
  }, 0);

  const onGetAmountsOut = (value) => {
    dispatch(
      getAmountsOut({
        inputAmountIn: value,
        tokenAInfo: sourceTokenInfo,
        tokenBInfo: desireTokenInfo,
      })
    )
      .unwrap()
      .then((originalPromiseResult) => {
        const { amountsOutFormat } = originalPromiseResult;
        setInputAmountOut(amountsOutFormat);
        // onCheckTotalSupplyAvailable(amountsOutFormat);
        onCountPriceImpact(value);
      })
      .catch((rejectedValueOrSerializedError) => {});
  };

  const getAmountsInDebounced = useDebouncedCallback((value) => {
    onGetAmountsIn(value);
  }, 0);

  const onGetAmountsIn = async (value) => {
    try {
      if (Number(value) < Number(reserveTo)) {
        setError("");
        poolErrRef.current = "";
        dispatch(
          getAmountsIn({
            inputAmountOut: value,
            tokenAInfo: sourceTokenInfo,
            tokenBInfo: desireTokenInfo,
          })
        )
          .unwrap()
          .then((originalPromiseResult) => {
            const { amountsInFormat } = originalPromiseResult;
            checkBalance(amountsInFormat);
            onCountPriceImpact(amountsInFormat);
          })
          .catch((rejectedValueOrSerializedError) => {});
      } else {
        setInputAmountIn("");
        setError(`Insufficient liquidity for this trade.`);
        poolErrRef.current = `Insufficient liquidity for this trade.`;
      }
    } catch (rejectedValueOrSerializedError) {}
  };

  const onChangeSourceInput = useCallback(
    (value) => {
      userInputRef.current = value;
      if (value === "") {
        setInputAmountOut("");
        setInputAmountIn("");
        setError("Enter an amount to see more trading details.");
      } else {
        let pattern = /^\d+\.?\d*$/;
        if (pattern.test(value)) {
          if (
            value === "0" ||
            value === "00" ||
            value === "0." ||
            value === "0.0"
          ) {
            if (value === "00") {
              setInputAmountIn("0");
            } else if (value === "0.0") {
              setInputAmountIn("0.");
            } else {
              setInputAmountIn(value);
            }
            setInputAmountOut("");
            setError("Enter an amount to see more trading details.");
          } else {
            checkBalance(value);
            getAmountOutDebounced(value);
          }
        }
      }
    },
    [checkBalance, getAmountOutDebounced]
  );

  const onChangeDesireInput = useCallback(
    (value) => {
      userInputRef.current = value;
      if (value === "") {
        setInputAmountIn("");
        setInputAmountOut("");
        setError("Enter an amount to see more trading details.");
      } else {
        let pattern = /^\d+\.?\d*$/;
        if (pattern.test(value)) {
          setInputAmountOut(value);
          if (
            value === "0" ||
            value === "00" ||
            value === "0." ||
            value === "0.0"
          ) {
            if (value === "00") {
              setInputAmountOut("0");
            } else if (value === "0.0") {
              setInputAmountOut("0.");
            }
            setInputAmountIn("");
            setError("Enter an amount to see more trading details.");
          } else {
            getAmountsInDebounced(value);
          }
        }
      }
    },
    [getAmountsInDebounced]
  );

  const onSwitchExchangeRate = () => {
    setIsSwitch(!isSwitch);
  };

  const onCheckApproveToken = () => {
    dispatch(
      checkApproveToken({
        tokenInfo: sourceTokenInfo,
      })
    )
      .unwrap()
      .then((originalPromiseResult) => {})
      .catch((rejectedValueOrSerializedError) => {});
  };

  const onCheckExchangeRatePool = (assetsPoolAddress) => {
    setLoadingExchangeRate(true);
    dispatch(
      checkExchangeRatePool({
        tokenAddressA: sourceTokenAddress,
        tokenAddressB: desireTokenAddress,
        assetsPoolAddress: assetsPoolAddress
          ? assetsPoolAddress
          : poolAddressRef.current,
      })
    )
      .unwrap()
      .then((originalPromiseResult) => {
        setLoadingExchangeRate(false);
      })
      .catch((rejectedValueOrSerializedError) => {
        setLoadingExchangeRate(false);
      });
  };

  const onGetPairsFee = () => {
    dispatch(
      getPairsFee({
        tokenAInfo: sourceTokenInfo,
        tokenBInfo: desireTokenInfo,
      })
    )
      .unwrap()
      .then((originalPromiseResult) => {})
      .catch((rejectedValueOrSerializedError) => {});
  };

  const onChangeSlippage = (value) => {
    if (value === "") {
      setInputSlippage("");
    }

    if (value === "00" || value === "0") {
      setError(slippageErr);
      setInputSlippage("0");
      return;
    }
    if (
      value === "0.0" ||
      value === "0." ||
      value === "0.1" ||
      value === "0.2" ||
      value === "0.3" ||
      value === "0.4"
    ) {
      setError(slippageErr);
      setInputSlippage("0.");
      return;
    }

    if (value > 50) {
      setError(slippageErr);
      return;
    }

    let regex = /^((?!0)\d{1,10}|0|\.\d{1,2})($|\.$|\.\d{1,2}$)/gm;
    if (!regex.test(value)) {
      setError(slippageErr);
      return;
    }

    let pattern = /^\d+\.?\d*$/;
    if (pattern.test(value)) {
      setError("");
      setInputSlippage(value);
    }
  };

  return {
    error,
    priceImpact,
    swapFee,
    account,
    loadingFee,
    amountOutMin,
    userInputRef,
    inputAmountOut,
    sourceTokenAddress,
    desireTokenAddress,
    sourceTokenInfo,
    desireTokenInfo,
    sourceTokenPrice,
    desireTokenPrice,
    sourceTokenBalance,
    desireTokenBalance,
    vthoBalance,
    sourcePerDesireTokenPrice,
    exchangeRateAB,
    exchangeRateBA,
    desireTokenAmount,
    setInputAmountOut,
    onSwapAssetToken,
    onSwapDesireToken,
    onShowModalSelectToken,
    inputSlippage,
    setInputSlippage,
    inputAmountIn,
    setInputAmountIn,
    sourceTokenAmount,
    onChangeDesireInput,
    onChangeSourceInput,
    loadingGetAmountIn,
    loadingGetAmountOut,
    accountApprove,
    onApproveToken,
    loadingSwap,
    onShowDetailInfo,
    showDetailInfo,
    loadingExchangeRate,
    poolErrRef,
    emptyAddress,
    loadingApprove,
    onCheckExchangeRatePool,
    onSwitchExchangeRate,
    poolAddress,
    isSwitch,
    pricePaidPerA,
    pricePaidPerB,
    onChangeSlippage,
  };
};

export default useSwapFacade;
