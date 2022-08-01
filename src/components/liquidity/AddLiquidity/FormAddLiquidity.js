import React, { useCallback, useState } from "react";
import "./styles.scss";

import { nFormatter, numberWithCommas } from "../../../utils/lib";
import IcCloseWhite from "../../../assets/images/buttons/ic_close.svg";
import IcBackWhite from "../../../assets/images/buttons/ic_back_white.svg";
import IcSettingWhite from "../../../assets/images/buttons/ic_setting_white.svg";
import IcHistoryWhite from "../../../assets/images/buttons/ic_history_white.svg";
import IcPlusGradient from "../../../assets/images/buttons/ic_plus_gradient.svg";
import IcSandClock from "../../../assets/images/img_sand_clock.svg";
import IcQuestionCircle from "../../../assets/images/buttons/ic_question_outline.svg";
import IcTransfer from "../../../assets/images/ic_transfer.svg";
import IcDown from "../../../assets/images/down_fill.svg";

import Asset from "./Asset";
import useAddLiquidFacade from "./useAddLiquidFacade";
import GradientStrokeWrapper from "../../partials/GradientStrokeWrapper";
import PartialConstants from "../../../constants/partial.constants";

import BtnLiquidityApproveA from "./BtnLiquidityApproveA";
import BtnLiquidityApproveB from "./BtnLiquidityApproveB";
import { useSelector } from "react-redux";
import { selectReserveA, selectReserveB } from "../../../reducers/liquid.reducer";
import { formatBalanceString } from "../../../utils/lib";

const FormAddLiquidity = () => {
  const {
    step,
    firstToken,
    secondToken,
    shareAPool,
    liquidityEstimated,
    firstTokenVolume,
    continueAvailable,
    secondTokenVolume,
    primaryButtonLabel,
    approveFirstToken,
    approveSecondToken,
    firstTokenInfo,
    secondTokenInfo,
    firstPerSecondTokenExchangeRate,
    secondPerFirstTokenExchangeRate,
    slippage,
    onChangeSlippage,
    onSelectFirstCurrency,
    onSelectSecondCurrency,
    closeModalAndDashboard,
    handlerStepToStep,
    onChangeFirstTokenAmount,
    onChangeSecondTokenAmount,
  } = useAddLiquidFacade();

  const [expand, setExpand] = useState(true);
  const reserveA = useSelector(selectReserveA);
  const reserveB = useSelector(selectReserveB);

  const showMaxAmount = () => {
    return formatBalanceString(Number(secondTokenVolume) + (Number(secondTokenVolume)*(slippage/100)));
  }
  const showConfirmButton = useCallback(() => {
    console.log("approveFirstToken", approveFirstToken)
    console.log("approveSecondToken", approveSecondToken)
    console.log("firstTokenVolume", firstTokenVolume)
    console.log("secondTokenVolume", secondTokenVolume)
    if (step === 1) {
      if (approveFirstToken < firstTokenVolume) {
        return <BtnLiquidityApproveA tokenAddress={firstToken} />;
      } else if (approveSecondToken < secondTokenVolume) {
        return <BtnLiquidityApproveB tokenAddress={secondToken} />;
      }
    }

    return (
      <button
        onClick={(e) => {
          handlerStepToStep(e);
        }}
        className={`btn-modal-veb w-full ${
          continueAvailable ? "bg-btn-veb" : ""
        }`}
        disabled={!continueAvailable}
      >
        {primaryButtonLabel}
      </button>
    );
  }, [
    step,
    continueAvailable,
    primaryButtonLabel,
    approveFirstToken,
    firstTokenVolume,
    approveSecondToken,
    secondTokenVolume,
    firstToken,
    secondToken,
    handlerStepToStep,
  ]);

  return (
    <div className="w-[550px] rounded-2xl p-10 bg-[#182233] mx-auto relative z-0">
      {/*Header*/}
      <GradientStrokeWrapper borderRadius="1rem" className="-z-10" />
      <div className="flex flex-row flex-1 items-center justify-between">
          <div className="flex flex-row items-center space-x-6">
            {step === 1 && (
              <img
                src={IcBackWhite}
                alt="Back"
                className="cursor-pointer w-12 h-12"
                onClick={closeModalAndDashboard}
              />
            )}
            <div className="flex flex-col">
              <span className="text-white text-2xl font-poppins_medium">
                Add Liquidity
              </span>
            </div>
          </div>
        </div>

      <div className="content-modal mt-8 z-50">
        {/* STEP 1 */}
        <div
          className={`${
            (step === 1 || step === 3) ? "" : "hidden"
          } flex flex-1 flex-col justify-center`}
        >
          <Asset
            assetAddress={firstToken}
            volume={firstTokenVolume}
            onVolumeChange={onChangeFirstTokenAmount}
            onClickSelectCurrency={onSelectFirstCurrency}
          />
          <img
            src={IcPlusGradient}
            alt="Add"
            className="w-7 h-7 mt-4 self-center"
          />
          <Asset
            assetAddress={secondToken}
            volume={secondTokenVolume}
            onVolumeChange={onChangeSecondTokenAmount}
            onClickSelectCurrency={onSelectSecondCurrency}
            className="mt-8"
          />

          {firstToken &&
          secondToken &&
          firstTokenVolume &&
          secondTokenVolume &&
          firstPerSecondTokenExchangeRate &&
          secondPerFirstTokenExchangeRate ? (
            <div className="flex flex-col">
              <div className="flex flex-row justify-between px-3 py-4 border border-vbDisableText rounded-lg mt-6"
                onClick={() => setExpand(!expand)}
              >
                <div className="flex flex-row item-center">
                  <img className="w-4 h-4" src={IcTransfer} alt=""/>
                  <div className="flex flex-row items-center ml-3">
                    <span className="font-poppins text-sm text-white">{`1 ${firstTokenInfo?.assetsChain} ≈ ${firstPerSecondTokenExchangeRate.toString()} ${secondTokenInfo?.assetsChain}`}</span>
                  </div>
                </div>
                <img className={`${expand ? "rotate-180" : ""} transition-transform delay-350 w-4`} src={IcDown} alt=""/>
              </div>
              {expand && 
              <div className="fade-in-box flex flex-col px-3 py-4 border border-vbDisableText rounded-lg mt-6 space-y-3">
                <div className="flex flex-row item-center justify-between py-1">
                  <span className="text-xs text-white">Base</span>
                  <span className="font-poppins_medium text-xs text-white">{firstTokenInfo?.assetsChain}</span>
                </div>
                <div className="flex flex-row item-center justify-between py-1">
                  <span className="text-xs text-white">Max Amount</span>
                  <span className="font-poppins_medium text-xs text-white">{showMaxAmount()} {secondTokenInfo?.assetsChain}</span>
                </div>
                <div className="flex flex-row item-center justify-between py-1">
                  <span className="text-xs text-white">Pool liquidity ({firstTokenInfo?.assetsChain})</span>
                  <span className="font-poppins_medium text-xs text-white">{`${formatBalanceString(reserveA)} ${firstTokenInfo?.assetsChain}`}</span>
                </div>
                <div className="flex flex-row item-center justify-between py-1">
                  <span className="text-xs text-white">Pool liquidity ({secondTokenInfo?.assetsChain})</span>
                  <span className="font-poppins_medium text-xs text-white">{`${reserveB} ${secondTokenInfo?.assetsChain}`}</span>
                </div>
                <div className="flex flex-row item-center justify-between py-1">
                  <span className="text-xs text-white">Share of pool</span>
                  <span className="font-poppins_medium text-xs text-white">{shareAPool < 0.01 ? "<0,01" : nFormatter(shareAPool, 8)}%</span>
                </div>
                <div className="flex flex-row item-center justify-between py-1">
                  <span className="text-xs text-white">Slippage Tolerance</span>
                  <div className="flex flex-row item-center border border-vbDisableText rounded px-2 py-1">
                    <input
                      value={slippage}
                      onChange={(e) => onChangeSlippage(e.target.value)}
                      className="font-poppins_medium text-xs text-white text-right bg-transparent focus:outline-none w-[50px]"
                      type="text"
                    />
                    <span className="font-poppins_medium text-xs text-white ml-[2px]">%</span>
                  </div>
                </div>
              </div>}
            </div>
            
          ) : (
            ""
          )}
        </div>

        {/* STEP 3 */}
        <div
          className={`${
            step === 2 ? "" : "hidden"
          } flex flex-col justify-center -mt-8`}
        >
          <img
            src={IcSandClock}
            alt=""
            className="transition delay-500 animate-[spin_1.5s_ease-in-out_infinite] w-55 h-55 self-center my-12"
          />
          <div className="flex flex-col space-y-4">
            <p className="text-4xl text-center">Waiting For Confirmation</p>
            <p className="text-lg text-center">
              Supplying {firstTokenVolume} {firstTokenInfo?.assetsChain} and{" "}
              {secondTokenVolume} {secondTokenInfo?.assetsChain}
            </p>
            <p className="text-lg text-center text-[#678BCA] cursor-pointer">
              Confirm this transaction in your wallet
            </p>
          </div>
        </div>
      </div>
      {step!==2 && <div className="footer-modal mt-8">{showConfirmButton()}</div>}
    </div>
  );
};

export default FormAddLiquidity;
