import React from "react";

// import IcSwap from "../../assets/images/ic_swap.svg";
import IcGas from "../../assets/images/gas.svg";
import IcBtnSwap from "../../assets/images/swap_btn.svg";
import IcDown from "../../assets/images/down_fill.svg";
import IcUp from "../../assets/images/up_fill.svg";
import IcDropDown from "../../assets/images/ic_dropdown.svg";
import IcReload from "../../assets/images/ic_reload.svg";
import IcLoading from "../../assets/images/loading_swap.svg";
import IcSetting from "../../assets/images/buttons/ic_setting_outline.svg";
// import IcQuestionCircle from "../../assets/images/ic_question_circle.svg";
import IcQuestionCircleYellow from "../../assets/images/question_circle_yellow.svg";
// import IcSwapWhiteNoBackground from "../../assets/images/ic_swap_white_no_background.svg";

import BtnConnectInPage from "../account/BtnConnectInPage";
// import BtnOpenSwap from "./BtnOpenSwap";

import useSwapFacade from "./hooks";
import HighlightedAssetIcon from "./HighlightedAssetIcon";
import { swapConstants } from "../../constants";
import { svgSymbolConfig } from "../../_helpers/param";
import "./styles.scss";

const Swap = () => {
  const {
    poolErr,
    isSwap,
    swapFee,
    showErr,
    account,
    loadingFee,
    userInputRef,
    exchangeRate,
    inputAmountIn,
    amountOutMin,
    inputAmountOut,
    inputSlippage,
    sourceTokenInfo,
    desireTokenInfo,
    // sourceTokenPrice,
    // desireTokenPrice,
    sourceTokenBalance,
    desireTokenBalance,
    vthoBalance,
    // sourcePerDesireTokenPrice,
    // desireTokenAmount,
    // setInputAmount,
    setInputSlippage,
    onSwapAssetToken,
    onSwapDesireToken,
    onShowModalSelectToken,
    onChangeDesireInput,
    onChangeSourceInput,
    loadingGetAmountIn,
    loadingGetAmountOut,
    accountApprove,
    onApproveToken,
    loadingSwap,
    loadingExchangeRate,
    onShowDetailInfo,
    showDetailInfo,
    isSwapSuccess,
    emptyAddress,
    loadingApprove,
  } = useSwapFacade();

  const renderTitleButton = () => {
    if (accountApprove === 0) {
      if (poolErr !== "") {
        return poolErr;
      } else {
        if (loadingApprove) {
          return "Approving...";
        } else {
          return "Approve";
        }
      }
    } else {
      if (showErr || poolErr !== "") {
        if (showErr) {
          return `Insufficient ${sourceTokenInfo?.assetsChain} balance `;
        } else {
          return poolErr;
        }
      } else if (loadingSwap) {
        return "Swapping...";
      } else {
        return "Swap";
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between w-full">
        <h2 className="font-poppins_semi_bold text-xl">Swap</h2>
        <div className="flex space-x-2 items-center">
          {loadingExchangeRate ? (
            <div className="loading__exchange__rate" />
          ) : (
            <img src={IcLoading} alt="Refresh" />
          )}
          <img className="cursor-pointer" src={IcSetting} alt="" />
        </div>
      </div>

      {/* From section */}
      <div className="bg-itemForm rounded-lg p-4 space-y-4 text-hint border-vbDisableText border-[1px]">
        <div className="full-row-between-center">
          <p className="text-sm">From</p>
          <p className="text-sm">Balance: {sourceTokenBalance}</p>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row w-full justify-between">
            <div className="flex flex-row w-full items-center">
              <button
                className="flex flex-row items-center space-x-[10px]"
                onClick={() =>
                  onShowModalSelectToken(swapConstants.FIRST_TOKEN)
                }
              >
                <HighlightedAssetIcon
                  icon={sourceTokenInfo?.icon}
                  svgConfig={svgSymbolConfig}
                />
                <h1 className="font-bold text-grey-1">
                  {sourceTokenInfo?.assetsChain}
                </h1>
                <img className="w-[16px]" src={IcDropDown} alt="" />
              </button>
              <div className="w-[1px] h-full bg-[#7694DE] ml-8"></div>
              <div className="flex flex-row text-[#647BB4] space-x-1 ml-4">
                <button
                  onClick={() => onChangeSourceInput(sourceTokenBalance)}
                  className={`${
                    !account ? "bg-vbDisabled" : "bg-[#203557]"
                  } w-[57px] h-[28px] bg-[#203557] rounded flex flex-row items-center justify-center`}
                  disabled={!account}
                >
                  Max
                </button>
                <button
                  onClick={() => onChangeSourceInput(sourceTokenBalance / 2.0)}
                  className={`${
                    !account ? "bg-vbDisabled" : "bg-[#203557]"
                  } w-[57px] h-[28px] rounded bg-[#203557]" flex flex-row items-center justify-center`}
                  disabled={!account}
                >
                  Half
                </button>
              </div>
            </div>
            <div className="relative flex flex-col w-full justify-center ml-4 items-end">
              {loadingGetAmountIn ? (
                <div className="loading" />
              ) : (
                <input
                  className="bg-transparent w-full focus:outline-none placeholder-vbDisableText font-poppins_medium text-base text-grey-1 text-right"
                  type="number"
                  min={1}
                  value={inputAmountIn}
                  onChange={(event) => onChangeSourceInput(event.target.value)}
                  placeholder="0.0"
                />
              )}
            </div>
          </div>
          {/* <p className="self-end">${inputAmountIn * sourceTokenPrice}</p> */}
        </div>
      </div>

      {/* Swap button */}
      <div className="flex flex-row items-center justify-center">
        <img
          onClick={onSwapDesireToken}
          className="cursor-pointer w-6 h-6"
          src={IcBtnSwap}
          alt="Swap"
        />
      </div>
      {/* <div className="full-row-between-center px-7">
        <div className="row-center space-x-4">
          <img
            onClick={onSwapDesireToken}
            className="cursor-pointer"
            src={IcSwap}
            alt="Swap"
          />
          <div>
            <div className="row-center space-x-4">
              <p>
                1 {sourceTokenInfo?.assetsChain} = {exchangeRate}{" "}
                {desireTokenInfo?.assetsChain}
              </p>
              <img src={IcSwapWhiteNoBackground} alt="Swap" />
            </div>
            <p className="text-vbLine text-sm">Low Price Impact</p>
          </div>
        </div>
      </div> */}

      {/* To section */}
      <div className="bg-itemForm rounded-lg p-4 space-y-4 text-hint border-vbDisableText border-[1px]">
        <div className="full-row-between-center">
          <p className="text-sm">To</p>
          <p className="text-sm">Balance: {desireTokenBalance}</p>
        </div>
        <div>
          <div className="full-row-between-center">
            <button
              className="flex space-x-[10px] w-1/2 items-center"
              onClick={() => onShowModalSelectToken(swapConstants.SECOND_TOKEN)}
            >
              <HighlightedAssetIcon
                icon={desireTokenInfo?.icon}
                svgConfig={svgSymbolConfig}
              />
              <h1 className="font-bold text-grey-1">
                {desireTokenInfo?.assetsChain}
              </h1>
              <img className="w-4" src={IcDropDown} alt="" />
            </button>
            {/* <p
              className={`flex bg-transparent focus:outline-none ${
                desireTokenAmount ? "text-grey-1" : "text-vbDisableText"
              } font-poppins appearance-none text-base text-right`}
            >
              {desireTokenAmount || 0.0}
            </p> */}
            <div className="relative flex flex-col w-full items-end">
              {loadingGetAmountOut ? (
                <div className="loading" />
              ) : (
                <input
                  className="w-full bg-transparent focus:outline-none placeholder-vbDisableText font-poppins_medium text-base text-grey-1 text-right"
                  type="number"
                  min={1}
                  value={inputAmountOut}
                  onChange={(event) => onChangeDesireInput(event.target.value)}
                  placeholder="0.0"
                />
              )}
            </div>
          </div>
          {/* <p className="float-right">${inputAmountOut * desireTokenPrice}</p> */}
        </div>
      </div>

      <div className="col-x-center justify-center space-y-4">
        {userInputRef.current !== "" && !isSwapSuccess && !emptyAddress && (
          <div className="flex flex-col w-full space-y-2">
            <button
              onClick={onShowDetailInfo}
              className="px-4 h-12 text-sm w-full rounded-lg bg-transparent border-[1px] border-vbDisableText"
            >
              <div className="flex flex-row justify-start items-center">
                {loadingGetAmountOut || loadingGetAmountIn ? (
                  <div className="loading mr-2" />
                ) : (
                  <img src={IcReload} alt="Refresh" className="w-4 h-4 mr-2" />
                )}
                {loadingGetAmountOut || loadingGetAmountIn ? (
                  <p>Fetching price...</p>
                ) : (
                  <div className="w-full flex flex-row items-center justify-between">
                    <div className="row-center space-x-2 w-fit group relative">
                      <p>
                        1 {sourceTokenInfo?.assetsChain} ={" "}
                        {exchangeRate.toString().length >= 6
                          ? `${parseFloat(exchangeRate).toFixed(6)}`
                          : exchangeRate}{" "}
                        {desireTokenInfo?.assetsChain}
                      </p>
                      <div class="absolute bottom-0 right-[-24px] flex-col items-center hidden mb-6 group-hover:flex">
                        <span class="relative z-10 px-2 py-3 text-xs leading-none text-white whitespace-no-wrap border-[1px] border-vbDisableText bg-itemForm rounded-lg shadow-lg">
                          {exchangeRate} {desireTokenInfo?.assetsChain}
                        </span>
                        <div class="w-3 h-3 -mt-2 rotate-45 bg-itemForm  border-[1px] border-vbDisableText"></div>
                      </div>
                      {/* <p>{`($${(exchangeRate * desireTokenPrice).toFixed(
                        3
                      )})`}</p> */}
                    </div>
                    <div className="sm:max-w-[156px] w-fit max-w-[162px] flex flex-row items-center justify-end">
                      {!showDetailInfo && (
                        <div className="bg-itemForm rounded-lg p-2 flex flex-row items-center w-fit group relative">
                          <img src={IcGas} alt="gas" className="w-4" />
                          <p className="ml-1">
                            {swapFee.toFixed(6)} {sourceTokenInfo?.assetsChain}
                          </p>
                          <div class="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                            <span class="relative z-10 px-2 py-3 text-xs leading-none text-white whitespace-no-wrap border-[1px] border-vbDisableText bg-itemForm rounded-lg shadow-lg">
                              {swapFee} {sourceTokenInfo?.assetsChain}
                            </span>
                            <div class="w-3 h-3 -mt-2 rotate-45 bg-itemForm  border-[1px] border-vbDisableText"></div>
                          </div>
                        </div>
                      )}
                      <img
                        src={showDetailInfo ? IcUp : IcDown}
                        alt="IcDown"
                        className="w-4 ml-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            </button>
            <div
              className={`${
                showDetailInfo ? "more__info__show" : "more__info__hidden"
              } h-fit w-full overflow-hidden`}
            >
              <div className="px-4 py-5 space-y-4 rounded-lg border border-vbDisableText my-2">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <p className="text-grey-3">Minimum receive</p>
                    {/* <img src={IcQuestionCircle} alt="" /> */}
                  </div>
                  <p>
                    {amountOutMin} {desireTokenInfo?.assetsChain}
                  </p>
                </div>
                {/* <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <p className="text-vbLine">Price Impact</p>
                    <img src={IcQuestionCircle} alt="" />
                  </div>
                  <p className="text-vbLine">
                    {" "}
                    {`-0.01% / -0.1 ${sourceTokenInfo?.assetsChain}`}{" "}
                  </p>
                  <p className="text-vbLine"> &lt; 0.01% </p>
                </div> */}
                <div className="flex justify-between flex-row w-full items-center">
                  <div className="flex space-x-2 w-full">
                    <p className="text-grey-3 min-w-fit">Slippage tolerance</p>
                    {/* <img className="w-5" src={IcQuestionCircle} alt="" /> */}
                  </div>
                  <div className="w-20 flex flex-row justify-evenly items-center bg-itemForm rounded border-vbDisableText border px-2 py-[0.0625rem]">
                    <input
                      className="bg-transparent w-6 rounded focus:outline-none placeholder-vbDisableText font-poppins_medium text-base text-grey-1"
                      type="number"
                      min={0.1}
                      max={50}
                      value={inputSlippage}
                      onChange={(event) => {
                        if (event.target.value >= 50) {
                          setInputSlippage(50);
                        } else {
                          setInputSlippage(event.target.value);
                        }
                      }}
                      placeholder="0.1"
                    />
                    <p className="ml-1">%</p>
                  </div>
                  {/* <p className="px-4 py-[0.0625rem] rounded bg-item">
                  {" "}
                  &lt; 0.5%{" "}
                </p> */}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <p className="text-grey-3">Swap fee</p>
                    {/* <img src={IcQuestionCircle} alt="" /> */}
                  </div>
                  {loadingFee ? (
                    <div className="loading" />
                  ) : (
                    <p>
                      {`0.30% /`} {swapFee} {sourceTokenInfo?.assetsChain}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {account && (
              <button
                disabled={!isSwap || loadingSwap || loadingApprove || showErr || poolErr !== ""}
                onClick={
                  accountApprove === 0 ? onApproveToken : onSwapAssetToken
                }
                className={`w-full ${
                  isSwap && !loadingSwap && !loadingApprove && !showErr && poolErr === ""
                    ? "btn-veb"
                    : "bg-btn-veb-disabled rounded-lg"
                }  h-12`}
              >
                {renderTitleButton()}
                {/* {accountApprove === 0
                  ? "Approve"
                  : showErr || poolErr !== ""
                  ? showErr
                    ? `Your ${sourceTokenInfo?.assetsChain} balance is not enough`
                    : poolErr
                  : loadingSwap
                  ? "Swapping..."
                  : "Swap"} */}
              </button>
            )}
          </div>
        )}
        {!account && <BtnConnectInPage className="w-full btn-veb h-12" />}
        {/* (
          <button
            className="btn-veb h-12 text-sm bg-btn-veb-disabled border-[1px] border-[#4B5C86]"
            disabled={true}
          >
            Enter an amount to see more trading details.
          </button>
        ) */}
        <div className="flex space-x-2">
          <p className="text-balanceVTHO">VTHO balance: {vthoBalance}</p>
          <img src={IcQuestionCircleYellow} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Swap;
