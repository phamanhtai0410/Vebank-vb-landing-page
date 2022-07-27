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
  selectLoadingGetAmountOut,
  selectLoadingGetAmountIn,
  selectAccountApprove,
  selectEmptyAddress,
  selectPoolAddress,
  selectReserveFrom,
  selectReserveTo,
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
  checkTotalSupplyAvailable,
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
  const loadingGetAmountOut = useSelector(selectLoadingGetAmountOut);
  const loadingGetAmountIn = useSelector(selectLoadingGetAmountIn);
  const reserveFrom = useSelector(selectReserveFrom);
  const reserveTo = useSelector(selectReserveTo);
  // const loadingExchangeRate = useSelector(selectLoadingExchangeRate);

  const accountApprove = useSelector(selectAccountApprove);
  const emptyAddress = useSelector(selectEmptyAddress);
  const poolAddress = useSelector(selectPoolAddress);

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

  const [exchangeRate, setExchangeRate] = useState(exchangeRateAB);

  const [sourceTokenChain, setSourceTokenChain] = useState(
    sourceTokenInfo?.assetsChain
  );
  const [desireTokenChain, setDesireTokenChain] = useState(
    desireTokenInfo?.assetsChain
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
            true
          )
        : formatLocaleString(
            inputAmountOut - (inputAmountOut * inputSlippage) / 100,
            PartialConstants.DEFAULT_ASSET_DECIMAL,
            true
          ),
    [desireTokenInfo.assetsAddress, inputAmountOut, inputSlippage]
  );

  const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  const getExchangeRateLoop = async (milliseconds) => {
    await onCheckExchangeRatePool();
    await sleep(milliseconds);
    getExchangeRateLoop(30000);
  };

  useEffect(() => {
    getExchangeRateLoop(30000);
  }, []);

  useEffect(() => {
    onCheckApproveToken();
  }, [sourceTokenInfo, account]);

  useEffect(() => {
    onSwitchExchangeRate();
  }, [exchangeRateAB, exchangeRateBA]);

  useEffect(() => {
    if (pressSwap) {
      amountInRef.current = inputAmountOut;
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
        dispatch(
          checkExchangeRatePool({
            tokenAddressA: sourceTokenAddress,
            tokenAddressB: desireTokenAddress,
            assetsPoolAddress: poolAddress,
          })
        )
          .unwrap()
          .then((originalPromiseResult) => {
            setLoadingExchangeRate(false);
            checkTotalSupplyAvailable(userInputRef.current);
          })
          .catch((rejectedValueOrSerializedError) => {
            setLoadingExchangeRate(false);
          });
        getAmountsInDebounced(userInputRef.current);
      }
      setPressSwap(false);
    } else {
      onCheckAssetExistsPools();
      if (inputAmountIn === userInputRef.current && inputAmountIn !== "") {
        setInputAmountOut("");
        checkBalance(userInputRef.current);
        getAmountOutDebounced(userInputRef.current);
      } else {
        setInputAmountIn("");
      }
      if (inputAmountOut === userInputRef.current && inputAmountOut !== "") {
        setInputAmountIn("");
        getAmountsInDebounced(userInputRef.current);
        checkTotalSupplyAvailable(userInputRef.current);
      } else {
        setInputAmountOut("");
      }
    }
  }, [desireTokenAddress, sourceTokenAddress]);

  const onCountPriceImpact = () => {
    const newTokenTo = Number(constantProduct) / (Number(reserveFrom) + Number(inputAmountIn));
    const tokenToReceived = Number(reserveTo) - newTokenTo;
    const pricePaidPerTokenTo = Number(inputAmountIn) / tokenToReceived;
    const priceImpact =
      ((pricePaidPerTokenTo - Number(marketPrice)) / Number(marketPrice)) * 100;
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
        poolErrRef.current = `Insufficient ${sourceTokenInfo?.assetsChain} balance`;
      } else {
        poolErrRef.current = "";
      }
    },
    [sourceTokenBalance, sourceTokenInfo?.assetsChain]
  );

  const getAmountOutDebounced = useDebouncedCallback((value) => {
    onGetAmountsOut(value);
  }, 1000);

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
        onCheckTotalSupplyAvailable(amountsOutFormat);
        onCountPriceImpact();
      })
      .catch((rejectedValueOrSerializedError) => {});
  };

  const getAmountsInDebounced = useDebouncedCallback((value) => {
    onGetAmountsIn(value);
  }, 1000);

  const onGetAmountsIn = (value) => {
    onCheckTotalSupplyAvailable(value);
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
        onCountPriceImpact();
      })
      .catch((rejectedValueOrSerializedError) => {});
  };

  const onCheckTotalSupplyAvailable = (amountOut) => {
    dispatch(
      checkTotalSupplyAvailable({
        amountOut: amountOut,
      })
    )
      .unwrap()
      .then((originalPromiseResult) => {
        const { isVolumeAvailable } = originalPromiseResult;
        if (!isVolumeAvailable) {
          poolErrRef.current = `Insufficient pool balance`;
        } else {
          poolErrRef.current =
            poolErrRef.current !== "" ? poolErrRef.current : "";
        }
      })
      .catch((rejectedValueOrSerializedError) => {});
  };

  const onChangeSourceInput = useCallback(
    (value) => {
      userInputRef.current = value;
      checkBalance(value);
      if (value !== "") {
        getAmountOutDebounced(value);
      } else {
        setInputAmountOut("");
      }
    },
    [checkBalance, getAmountOutDebounced]
  );

  const onChangeDesireInput = useCallback(
    (value) => {
      userInputRef.current = value;
      setInputAmountOut(value);
      if (value !== "") {
        getAmountsInDebounced(value);
      } else {
        setInputAmountIn("");
      }
    },
    [getAmountsInDebounced]
  );

  const onSwitchExchangeRate = () => {
    setExchangeRate(
      exchangeRate === exchangeRateAB ? exchangeRateBA : exchangeRateAB
    );
    setSourceTokenChain(
      exchangeRate === exchangeRateAB
        ? desireTokenInfo?.assetsChain
        : sourceTokenInfo?.assetsChain
    );
    setDesireTokenChain(
      exchangeRate === exchangeRateAB
        ? sourceTokenInfo?.assetsChain
        : desireTokenInfo?.assetsChain
    );
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

  const onCheckAssetExistsPools = () => {
    poolErrRef.current = "";
    dispatch(
      checkAssetExistsPools({
        tokenAInfo: sourceTokenInfo,
        tokenBInfo: desireTokenInfo,
      })
    )
      .unwrap()
      .then((originalPromiseResult) => {
        const { emptyAddress, assetsPoolAddress } = originalPromiseResult;
        if (!emptyAddress) {
          onGetPairsFee();
          onCheckExchangeRatePool({ assetsPoolAddress: assetsPoolAddress });
        } else {
          poolErrRef.current = `${sourceTokenInfo?.assetsChain} - ${desireTokenInfo?.assetsChain} not existing in pools`;
        }
      })
      .catch((rejectedValueOrSerializedError) => {});
  };

  const onCheckExchangeRatePool = ({ assetsPoolAddress }) => {
    setLoadingExchangeRate(true);
    dispatch(
      checkExchangeRatePool({
        tokenAddressA: sourceTokenAddress,
        tokenAddressB: desireTokenAddress,
        assetsPoolAddress: assetsPoolAddress ? assetsPoolAddress : poolAddress,
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

  return {
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
    exchangeRate,
    sourceTokenChain,
    desireTokenChain,
    poolAddress,
  };
};

export default useSwapFacade;
