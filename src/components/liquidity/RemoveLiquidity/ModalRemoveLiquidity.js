import React, { useCallback, useMemo } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import Modal from "react-modal";
import "./styles.scss";
import * as actions from "../../../actions";

import { selectOpenRemoveLiquidState } from "../../../reducers/liquid.reducer";
import ImgSubmitted from "../../../assets/images/img_up_arrow.svg";
import IcSandClock from "../../../assets/images/img_sand_clock.svg";
import IcCloseWhite from "../../../assets/images/buttons/ic_close.svg";
import IcBackWhite from "../../../assets/images/buttons/ic_back_white.svg";
import IcQuestionCircle from "../../../assets/images/buttons/ic_question_outline.svg";

import useRemoveLiquidFacade from "./useRemoveLiquidFacade";
import GradientStrokeWrapper from "../../partials/GradientStrokeWrapper";
import ProgressBar from "../../partials/ProgressBar";

const ModalRemoveLiquidity = () => {
  const dispatch = useDispatch();
  const isRemoveLiquidModalOpen = useSelector(selectOpenRemoveLiquidState);

  const {
    firstTokenInfo,
    secondTokenInfo,
    removeAvailable,
    enableBtnLabel,
    isEnabled,
    primaryButtonLabel,
    liquidityPool,
    removeValue,
    isRemoving,
    onEnableClicked,
    handlerStepToStep,
    onChangeRemoveValue,
  } = useRemoveLiquidFacade();

  const customStyles = {
    content: {
      top: "30%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -30%)",
      background: "#182233",
      borderWidth: "0px",
      borderRadius: "1rem",
      // borderColor: "#3EE8FF",
      padding: "32px",
      width: "500px",
      position: "relative",
    },
  };

  const onClickMaxButton = () => {
    onChangeRemoveValue(liquidityPool);
  };

  const closeModal = () => {
    dispatch(actions.closeModalRemoveLiquidity());
  };
  
  return (
    <Modal
      isOpen={isRemoveLiquidModalOpen}
      onRequestClose={closeModal}
      ariaHideApp={false}
      style={customStyles}
      // portalClassName="modal-veb"
      // className="modal-remove-liquid w-fit h-fit rounded-2xl fade-in-box"
      overlayClassName="vb-modal-overlay"
    >
      {/*Header*/}
      <GradientStrokeWrapper borderRadius="1rem" className="-z-10" />
      <div className="content-modal">
        <div className="flex flex-row items-center justify-between">
          <span className="font-poppins_bold text-lg text-white">
            Remove Liquidity
          </span>
          <img src={IcCloseWhite} alt="" onClick={closeModal} />
        </div>
        {/* STEP 2 */}
        {<div className="flex flex-col p-8 border border-vbLine rounded-2xl mt-6">
          <div className="flex flex-row items-center justify-between">
            <span className="text-xs text-[#7694DE]">
              Pool
            </span>
            <span className="text-xs text-[#7694DE]">
              Balance: {liquidityPool}
            </span>
          </div>
          <div className="flex flex-row items-center justify-between mt-6">
            <div className="flex flex-row flex-1 items-center">
              <span className="font-poppins_bold text-base text-white">
                {`${firstTokenInfo?.assetsChain || ""}-${secondTokenInfo?.assetsChain || ""}`}
              </span>
              <div className="w-[1px] h-9 bg-[#7694DE] mx-3"></div>
              <button
                className="flex items-center font-poppins_medium px-2 py-2 bg-[#203557] rounded text-[#647BB4] text-sm"
                onClick={onClickMaxButton}
              >
                Max
              </button>
            </div>
            <input
              placeholder="0.0"
              min={0}
              value={removeValue}
              pattern="^[0-9]*\.?[0-9]*$"
              onChange={(e) => onChangeRemoveValue(e.target.value)}
              className="w-[45%] flex-1 px-4 py-1 focus:outline-none placeholder:text-[#4B5C86] font-poppins_semi_bold text-lg text-white text-right bg-transparent"
              type="text"
            />
          </div>
        </div>}
      </div>

      <div className="footer-modal row gap-4 mt-8">
          {!isEnabled && (
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
          {isEnabled && !isRemoving && <button
            onClick={handlerStepToStep}
            className={`btn-modal-veb w-full h-16.5 text-lg font-poppins_medium ${
              removeAvailable ? "bg-btn-veb" : ""
            }`}
            disabled={!removeAvailable}
          >
            {primaryButtonLabel}
          </button>}
        </div>
    </Modal>
  );
};

export default ModalRemoveLiquidity;
