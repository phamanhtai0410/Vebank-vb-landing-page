import { useCallback, useEffect } from "react";
import Modal from "react-modal";

import { useSelector, useDispatch, shallowEqual } from "react-redux";

// import * as actions from "../../actions";
import { TransitionGroup } from "react-transition-group";

import {
  closeModalSelectToken,
  selectDesireToken,
  selectDesireTokenFromModal,
  selectNameTokenState,
  selectOpenChooseTokenState,
  selectSourceToken,
  selectSourceTokenFromModal,
  swapTokenDesire,
} from "../../reducers/swap.reducer";
import { selectUserAssetsBalance } from "../../reducers/accountBalance.reducer";
import GradientStrokeWrapper from "../partials/GradientStrokeWrapper";
import { iconsModalSelectToken } from "../../assets";
import SearchBar from "../partials/SearchBar";
import AssetExcerpt from "../liquidity/AddLiquidity/selectToken/AssetExcerpt";
import { swapConstants } from "../../constants";

const customStyles = {
  content: {
    top: "40%",
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
    position: "absolute",
  },
};

const ModalSelectToken = () => {
  const nameToken = useSelector(selectNameTokenState);
  const isSelectTokenModalOpen = useSelector(selectOpenChooseTokenState);

  const sourceTokenAddress = useSelector(selectSourceToken);
  const desireTokenAddress = useSelector(selectDesireToken);

  const assetList = useSelector(selectUserAssetsBalance, shallowEqual);
  // const assetPriceList = useSelector(selectAssetPrice, shallowEqual);

  const dispatch = useDispatch();

  useEffect(() => fetchUserAssets(), []);

  const fetchUserAssets = async () => {
    // await dispatch(actions.getCurrentAssets());
    // await dispatch(actions.fetchAccountInit());
  };

  const closeModal = () => dispatch(closeModalSelectToken());
  const handlerStepToStep = (e) => {};

  const onTokenSelected = useCallback(
    async (tokenData) => {
      if (nameToken === swapConstants.FIRST_TOKEN) {
        await dispatch(
          tokenData !== desireTokenAddress
            ? selectSourceTokenFromModal(tokenData)
            : swapTokenDesire()
        );
      } else {
        await dispatch(
          tokenData !== sourceTokenAddress
            ? selectDesireTokenFromModal(tokenData)
            : swapTokenDesire()
        );
      }
    },
    [desireTokenAddress, dispatch, nameToken, sourceTokenAddress]
  );

  return (
    <Modal
      isOpen={isSelectTokenModalOpen}
      ariaHideApp={false}
      style={customStyles}
      portalClassName="modal-veb"
      overlayClassName="overlay"
    >
      <GradientStrokeWrapper className="-z-50" borderRadius="1rem" />
      <div className="header">
        <h2>Select a token</h2>
        <img
          alt=""
          src={iconsModalSelectToken.IcCloseWhite}
          className="cursor-pointer"
          onClick={closeModal}
        />
      </div>

      <div className="content-modal mt-12">
        {/* STEP 1 */}
        <SearchBar />
        <div className="flex flex-row space-x-2 items-center mt-8">
          <p className="font-poppins_light text-xl">Select a currency</p>
          <img
            src={iconsModalSelectToken.IcQuestionOutline}
            alt=""
            className="w-4 h-4"
          />
        </div>

        <TransitionGroup>
          {assetList &&
            assetList.length > 0 &&
            assetList.map((item) => (
              <AssetExcerpt
                key={item.assetsAddress}
                id={item.assetsAddress}
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
