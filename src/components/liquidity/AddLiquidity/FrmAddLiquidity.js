import React, { useCallback } from "react";
import "./styles.scss";

import { nFormatter, numberWithCommas } from "../../../utils/lib";
import IcCloseWhite from "../../../assets/images/buttons/ic_close.svg";
import IcBackWhite from "../../../assets/images/buttons/ic_back_white.svg";
import IcSettingWhite from "../../../assets/images/buttons/ic_setting_white.svg";
import IcHistoryWhite from "../../../assets/images/buttons/ic_history_white.svg";
import IcPlusGradient from "../../../assets/images/buttons/ic_plus_gradient.svg";
import IcSandClock from "../../../assets/images/img_sand_clock.svg";
import IcQuestionCircle from "../../../assets/images/buttons/ic_question_outline.svg";

import Asset from "./Asset";
import useAddLiquidFacade from "./hook";
import GradientStrokeWrapper from "../../partials/GradientStrokeWrapper";
import PartialConstants from "../../../constants/partial.constants";

import BtnLiquidityApproveA from "./BtnLiquidityApproveA";
import BtnLiquidityApproveB from "./BtnLiquidityApproveB";

const FrmAddLiquidity = () => {
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
    onSelectFirstCurrency,
    onSelectSecondCurrency,
    closeModalAndDashboard,
    handlerStepToStep,
    onChangeFirstTokenAmount,
    onChangeSecondTokenAmount,
  } = useAddLiquidFacade();

  const showConfirmButton = useCallback(() => {
    if (step === 2) {
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

  // useEffect(() => {
  //   const firstTokenVolumeValue = firstTokenVolume?.current?.value ?? 0;
  //   const secondTokenVolumeValue = secondTokenVolume?.current?.value ?? 0;
  //   if (firstTokenVolumeValue > 0 && secondTokenVolumeValue > 0) {

  //   }
  // }, [firstTokenVolume?.current?.value, secondTokenVolume?.current?.value])

  return (
    <div className="w-[500px] rounded-2xl p-10 bg-[#182233] mx-auto relative z-0">
      {/*Header*/}
      <GradientStrokeWrapper borderRadius="1rem" className="-z-10" />
      {step !== 1 && step !== 4 ? (
        <div className="flex flex-row flex-1 items-center justify-between">
          <p className="font-poppins_bold text-white text-lg">
            You will receive
          </p>
          <img
            src={IcCloseWhite}
            alt=""
            className="cursor-pointer"
            onClick={closeModalAndDashboard}
          />
        </div>
      ) : (
        <div className="flex flex-row flex-1 items-center justify-between">
          {/* <button className="btn-modal-back" onClick={closeModal} /> */}
          <div className="flex flex-row items-center space-x-6">
            {step === 1 && (
              <img
                src={IcBackWhite}
                alt="Back"
                className="cursor-pointer w-12 h-12"
                onClick={closeModalAndDashboard}
              />
            )}
            <div className="flex flex-col space-y-4">
              <span className="text-white text-2xl font-poppins_medium">
                Add Liquidity
              </span>
              <div className="flex flex-row items-center space-x-1">
                {step !== 4 && (
                  <img
                    src={IcQuestionCircle}
                    alt=""
                    className="w-4 h-4 cursor-pointer"
                  />
                )}
                <span className="text-white text-base font-poppins_light">
                  {step !== 4
                    ? "Add liquidity to receive LP tokens"
                    : "Remove liquidity to receive tokens back"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-row space-x-8">
            <img
              src={IcSettingWhite}
              alt="Setting"
              className="w-7 h-7 cursor-pointer"
              // onClick={closeModal}
            />
            <img
              src={IcHistoryWhite}
              alt="History"
              className="w-7 h-7 cursor-pointer"
              // onClick={closeModal}
            />
          </div>
        </div>
      )}

      <div className="content-modal mt-8 z-50">
        {/* STEP 1 */}
        <div
          className={`${
            step === 1 ? "" : "hidden"
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
            <div className="flex flex-1 flex-col mt-8">
              <p className="text-xl text-grey-2">Price and pool share</p>
              <div className="flex flex-1 flex-row justify-between items-center mt-4 px-2 py-5 liquid-wrapper">
                <div className="price-pool-item">
                  <p className="value">
                    {nFormatter(
                      firstPerSecondTokenExchangeRate,
                      PartialConstants.DEFAULT_FORMAT_FLOATING_NUMBER
                    )}
                  </p>
                  <p className="label">{`${secondTokenInfo?.assetsChain} per ${firstTokenInfo?.assetsChain}`}</p>
                </div>
                <div className="price-pool-item">
                  <p className="value">
                    {nFormatter(
                      secondPerFirstTokenExchangeRate,
                      PartialConstants.DEFAULT_FORMAT_FLOATING_NUMBER
                    )}
                  </p>
                  <p className="label">{`${firstTokenInfo?.assetsChain} per ${secondTokenInfo?.assetsChain}`}</p>
                </div>
                <div className="price-pool-item">
                  <p className="value">
                    {shareAPool < 0.01 ? "<0,01" : nFormatter(shareAPool, 8)}%
                  </p>
                  <p className="label">Share of Pool</p>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>

        {/* STEP 2 */}
        <div className={`${step === 2 ? "" : "hidden"} flex flex-col`}>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-row items-center">
              <p className=" text-2xl font-poppins_medium mr-8">
                {/*Minh said only PartialConstants.DEFAULT_FORMAT_FLOATING_NUMBER fractional digit*/}
                {nFormatter(
                  liquidityEstimated,
                  15
                )}
              </p>
              <div className="flex flex-row space-x-3">
                <img src={firstTokenInfo?.icon} alt="" className="w-6 h-6" />
                <img src={secondTokenInfo?.icon} alt="" className="w-6 h-6" />
              </div>
            </div>
            <p className="font-poppins_medium text-base">{`${firstTokenInfo?.assetsChain}/${secondTokenInfo?.assetsChain} Pool Tokens`}</p>
            <p className="text-sm text-justify font-poppins_light text-[#7694DE]">
              Output is estimated. If the price changes by more than 0.5%, your
              transaction will be reverted.
            </p>
          </div>
          <p className="mt-8 font-poppins_bold text-base">Price and pool share</p>
          <div className="flex flex-col mt-4 px-4 py-6 space-y-4 liquid-wrapper">
            <div className="price-pool-share-row">
              <p className="font-poppins_light">{`${firstTokenInfo?.assetsChain} Deposited`}</p>
              <div className="flex flex-row items-center space-x-4">
                <img src={firstTokenInfo?.icon} alt="" className="w-6 h-6" />
                <span className="font-poppins_semi_bold text-base">
                  {firstTokenVolume > 1
                    ? numberWithCommas(
                        nFormatter(
                          firstTokenVolume,
                          PartialConstants.DEFAULT_FORMAT_FLOATING_NUMBER
                        )
                      )
                    : nFormatter(
                        firstTokenVolume,
                        PartialConstants.DEFAULT_FORMAT_FLOATING_NUMBER
                      )}
                </span>
              </div>
            </div>
            <div className="price-pool-share-row">
              <p className="font-poppins_light">{`${secondTokenInfo?.assetsChain} Deposited`}</p>
              <div className="flex flex-row items-center space-x-4">
                <img src={secondTokenInfo?.icon} alt="" className="w-6 h-6" />
                <span className="font-poppins_semi_bold text-base">
                  {secondTokenVolume > 1
                    ? numberWithCommas(
                        nFormatter(
                          secondTokenVolume,
                          PartialConstants.DEFAULT_FORMAT_FLOATING_NUMBER
                        )
                      )
                    : nFormatter(
                        secondTokenVolume,
                        PartialConstants.DEFAULT_FORMAT_FLOATING_NUMBER
                      )}
                </span>
              </div>
            </div>
            <div className="price-pool-share-row items-start">
              <p className="self-start font-poppins_light">Rates</p>
              <div className="flex flex-col justify-end">
                <p className="text-right">{`1 ${
                  firstTokenInfo?.assetsChain
                } = ${nFormatter(
                  firstPerSecondTokenExchangeRate,
                  PartialConstants.DEFAULT_FORMAT_FLOATING_NUMBER
                )} ${secondTokenInfo?.assetsChain}`}</p>
                <p className="text-right">{`1 ${
                  secondTokenInfo?.assetsChain
                } = ${nFormatter(
                  secondPerFirstTokenExchangeRate,
                  PartialConstants.DEFAULT_FORMAT_FLOATING_NUMBER
                )} ${firstTokenInfo?.assetsChain}`}</p>
              </div>
            </div>
            <div className="price-pool-share-row">
              <p>Share a Pool</p>
              <p>
                {shareAPool < 0.01
                  ? "<0,01"
                  : nFormatter(
                      shareAPool,
                      PartialConstants.DEFAULT_FORMAT_FLOATING_NUMBER
                    )}
                %
              </p>
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div
          className={`${
            step === 3 ? "" : "hidden"
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

      {step === 1 || step === 2 || step === 4 ? (
        <div className="footer-modal mt-8">{showConfirmButton()}</div>
      ) : (
        ""
      )}
    </div>
  );
};

export default FrmAddLiquidity;
