import { useCallback, useEffect, useState } from "react";
import Modal from "react-modal";
import "../styles.scss";

import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { numberWithCommas } from "../../../../utils/lib";
import IcQuestionOutline from "../../../../assets/images/buttons/ic_question_outline.svg";
import IcCloseWhite from "../../../../assets/images/buttons/ic_close.svg";

import * as actions from "../../../../actions";
import { selectOpenChooseTokenState } from "../../../../reducers/liquid.reducer";
import SearchBar from "../../../partials/SearchBar";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import GradientStrokeWrapper from "../../../partials/GradientStrokeWrapper";
import { selectBalancesIds, selectUserAssetsBalance } from "../../../../reducers/accountBalance.reducer";
import AssetExcerpt from "./AssetExcerpt";

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
    padding: "2.5rem",
    width: "450px",
    position: "relative",
  },
};

const ModalSelectToken = () => {
  const isSelectTokenModalOpen = useSelector(selectOpenChooseTokenState);

  const assetAddressList = useSelector(selectBalancesIds);
  // const assetPriceList = useSelector(selectAssetPrice, shallowEqual);

  const dispatch = useDispatch();

  useEffect(() => fetchUserAssets(), []);

  const fetchUserAssets = async () => {
    // await dispatch(actions.getCurrentAssets());
    // await dispatch(actions.fetchAccountInit());
  };

  const closeModal = () => dispatch(actions.closeSelectToken());
  const handlerStepToStep = (e) => {};

  const onTokenSelected = useCallback(
    async (tokenData) => {
      await dispatch(actions.selectToken(tokenData));
      dispatch(actions.loadDetailAddLiquidity());
    },
    [dispatch]
  );

  return (
    <Modal
      isOpen={isSelectTokenModalOpen}
      ariaHideApp={false}
      style={customStyles}
      portalClassName="modal-veb"
      overlayClassName="overlay"
    >
      <GradientStrokeWrapper
        className="-z-50"
        borderRadius="1rem"
      />
      <div className="header">
        <span className="font-poppins_bold text-xl text-white">Select a token</span>
        <img
          alt=""
          src={IcCloseWhite}
          className="cursor-pointer"
          onClick={closeModal}
        />
      </div>

      <div className="content-modal mt-6">
        {/* STEP 1 */}
        <SearchBar />
        <div className="flex flex-row space-x-2 items-center mt-8">
          <p className="font-poppins_light text-xl">Select a currency</p>
          <img src={IcQuestionOutline} alt="" className="w-4 h-4" />
        </div>

        <TransitionGroup>
          {assetAddressList &&
            assetAddressList.length > 0 &&
            assetAddressList.map((assetAddress) => (
              <AssetExcerpt
                key={assetAddress}
                id={assetAddress}
                onTokenSelected={onTokenSelected}
              />
            ))}
        </TransitionGroup>
      </div>

      <div className="footer-modal mt-8">
        <button
          onClick={(e) => {
            handlerStepToStep(e);
          }}
          className={"w-full h-12 text-[#22D4EC] text-lg font-poppins_medium"}
        >
          Manage Tokens
        </button>
      </div>
    </Modal>
  );
};

export default ModalSelectToken;
