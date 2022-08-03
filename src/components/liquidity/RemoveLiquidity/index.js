import React, { useCallback, useMemo } from "react";
import "./styles.scss";

import ImgSubmitted from "../../../assets/images/img_up_arrow.svg";
import IcSandClock from "../../../assets/images/img_sand_clock.svg";
import IcCloseWhite from "../../../assets/images/buttons/ic_close.svg";
import IcBackWhite from "../../../assets/images/buttons/ic_back_white.svg";
import IcQuestionCircle from "../../../assets/images/buttons/ic_question_outline.svg";

import useRemoveLiquidFacade from "./hook";
import GradientStrokeWrapper from "../../partials/GradientStrokeWrapper";
import ProgressBar from "../../partials/ProgressBar";

const ModalRemoveLiquidity = () => {
  const {
    step,
    txid,
    firstTokenInfo,
    secondTokenInfo,
    amountTokenA,
    amountTokenB,
    removeAvailable,
    enableBtnLabel,
    firstPerSecondTokenExchangeRate,
    secondPerFirstTokenExchangeRate,
    amountPercentage,
    isEnabled,
    primaryButtonLabel,
    onSelectMileStone,
    onEnableClicked,
    closeModalAndDashboard,
    handlerStepToStep,
  } = useRemoveLiquidFacade();

  const showMileStone = useCallback(() => {
    const milestones = [];
    for (let i = 25; i <= 100; i += 25) {
      milestones.push(
        <button
          key={i}
          onClick={() => onSelectMileStone(i)}
          className="flex flex-grow items-center justify-center h-8 rounded bg-[#FFFFFF0A] text-grey-1 text-base"
        >
          {i}%
        </button>
      );
    }
    return milestones;
  }, []);

  return (
    <div className="w-full lg:w-[500px] rounded-2xl p-10 bg-[#182233] mx-auto relative z-0">
      {/*Header*/}
      <GradientStrokeWrapper
        borderRadius="1rem"
        className="-z-10"
      />
      {step !== 1 ? (
        <div className="flex flex-row flex-1 items-center justify-between">
          <p className="font-poppins_medium text-white text-3xl">
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
                Remove {firstTokenInfo?.assetsChain}-
                {secondTokenInfo?.assetsChain} liquidity
              </span>
              <div className="flex flex-row items-center space-x-1">
                {step !== 4 && (
                  <img
                    src={IcQuestionCircle}
                    alt=""
                    className="w-4 h-4 cursor-pointer"
                  />
                )}
                <span className="text-grey-1 text-base font-poppins_light">
                  To receive {firstTokenInfo?.assetsChain} and{" "}
                  {secondTokenInfo?.assetsChain}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="content-modal mt-8">
        {/* STEP 1 */}
        <div
          className={`${
            step === 1 ? "" : "hidden"
          } flex flex-1 flex-col justify-center`}
        >
          <div className="col-y-center bg-[#182844] px-4 py-6 rounded-lg gap-4">
            <div className="full-row-between-center">
              <p className="text-xl text-grey-1 font-poppins_semi_bold">
                Amount
              </p>
              <p className="text-xl text-vbLine font-poppins">Detailed</p>
            </div>
            <div className="col-y-center gap-6">
              <p className="text-4xl text-[#2AF4FF] font-poppins_semi_bold">
                {amountPercentage}%
              </p>
              {/* <TransitionGroup>
                <CSSTransition> */}
              <ProgressBar completed={amountPercentage} />
              {/* </CSSTransition>
              </TransitionGroup> */}
              <div className="full-row-between-center gap-2">
                {showMileStone()}
              </div>
            </div>
          </div>
          {firstTokenInfo && secondTokenInfo && (
            <div className="mt-8">
              <p className="text-xl font-poppins_semi_bold text-[#678BCA]">
                YOU WILL RECEIVE
              </p>
              <div className="mt-4 col p-4 gap-4.5 border rounded-lg border-[#4F92A7]">
                <div className="full-row-between-center gap-4">
                  <img src={firstTokenInfo?.icon} alt="" className="w-8 h-8" />
                  <p className="flex flex-grow text-lg font-poppins_semi_bold">
                    {firstTokenInfo?.assetsChain || ""}
                  </p>
                  <p className="flex flex-grow justify-end text-xl">
                    {amountTokenA}
                  </p>
                </div>
                <div className="full-row-between-center gap-4">
                  <img src={secondTokenInfo?.icon} alt="" className="w-8 h-8" />
                  <p className="flex flex-grow text-lg font-poppins_semi_bold">
                    {secondTokenInfo?.assetsChain || ""}
                  </p>
                  <p className="flex flex-grow justify-end text-xl">
                    {amountTokenB}
                  </p>
                </div>
              </div>
            </div>
          )}

          {firstPerSecondTokenExchangeRate && secondPerFirstTokenExchangeRate && (
            <div className="mt-8">
              <p className="text-xl font-poppins_semi_bold text-[#678BCA]">
                PRICES
              </p>
              <div className="mt-4 col p-4 gap-4.5 border rounded-lg border-[#4F92A7]">
                <div className="full-row-between-center">
                  <p className="text-xl font-poppins_semi_bold">
                    1 {firstTokenInfo?.assetsChain || ""} =
                  </p>
                  <p className="text-xl">
                    {firstPerSecondTokenExchangeRate}{" "}
                    {secondTokenInfo?.assetsChain || ""}
                  </p>
                </div>
                <div className="full-row-between-center">
                  <p className="text-xl font-poppins_semi_bold">
                    1 {secondTokenInfo?.assetsChain || ""} =
                  </p>
                  <p className="text-xl">
                    {secondPerFirstTokenExchangeRate}{" "}
                    {firstTokenInfo?.assetsChain || ""}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2 */}
        <div className={`${step === 2 ? "" : "hidden"} flex flex-col gap-4`}>
          <div className="full-row-center gap-4">
            <p className="flex flex-grow text-2xl">{amountTokenA}</p>
            <img src={firstTokenInfo?.icon} alt="" className="w-8 h-8" />
            <p className="text-2xl font-poppins_semi_bold">
              {firstTokenInfo?.assetsChain || ""}
            </p>
          </div>
          <p className="text-2xl">+</p>
          <div className="full-row-center gap-4 mb-4">
            <p className="flex flex-grow text-2xl">{amountTokenB}</p>
            <img src={secondTokenInfo?.icon} alt="" className="w-8 h-8" />
            <p className="text-2xl font-poppins_semi_bold">
              {secondTokenInfo?.assetsChain || ""}
            </p>
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
              Removing {amountTokenA} {firstTokenInfo?.assetsChain} and{" "}
              {amountTokenB} {secondTokenInfo?.assetsChain}
            </p>
            <p className="text-lg text-center text-[#678BCA] cursor-pointer">
              Confirm this transaction in your wallet
            </p>
          </div>
        </div>

        {/* STEP 4 */}
        <div
          className={`${
            step === 4 ? "" : "hidden"
          } flex flex-col items-center mt-4`}
        >
          <img src={ImgSubmitted} alt="" className="w-19 self-center" />
          <p className="text-4xl text-center mt-12">Transaction Submitted</p>
          <a target="_blank" href={`${process.env.REACT_APP_CHECK_TRANSACTION_URL}${txid}#info`} className="mt-4 text-lg font-poppins_medium text-[#22D4EC]" rel="noreferrer">
            View on Explore
          </a>
        </div>
      </div>

      {step === 1 || step === 2 || step === 4 ? (
        <div className="footer-modal row gap-4 mt-8">
          {step === 1 && (
            <button
              onClick={onEnableClicked}
              className={`btn-modal-veb w-full h-16.5 text-lg font-poppins_medium ${
                !isEnabled ? "bg-btn-veb" : ""
              }`}
              disabled={isEnabled}
            >
              {enableBtnLabel}
            </button>
          )}
          <button
            onClick={step !== 4 ? handlerStepToStep : closeModalAndDashboard}
            className={`btn-modal-veb w-full h-16.5 text-lg font-poppins_medium ${
              removeAvailable ? "bg-btn-veb" : ""
            }`}
            disabled={!removeAvailable}
          >
            {primaryButtonLabel}
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ModalRemoveLiquidity;
