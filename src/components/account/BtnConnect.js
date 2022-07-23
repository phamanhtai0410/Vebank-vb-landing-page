import { useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";

import * as actions from "../../actions";
import IcWallet from "../../assets/images/ic_wallet.svg";
import IcUp from "../../assets/images/up.svg";
import IcDown from "../../assets/images/down.svg";
import GradientStrokeWrapper from "../partials/GradientStrokeWrapper";
import { addressWalletCompact, copyTextToClipboard } from "../../utils/lib";
import ModalWallet from "./ModalWallet";

const BtnConnect = () => {
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModalWallet, setShowModalWallet] = useState(false);

  const account = useSelector((state) => state.web3.account, shallowEqual);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const connectWalletHandler = async () => {
    if (!isConnecting) {
      setIsConnecting(true);
      await dispatch(actions.web3Connect(true))
        .then((res) => {
          console.log("connectWalletHandler res",res);
          setIsConnecting(false);
        })
        .catch((e) => {
          console.log("connectWalletHandler err",e);
          setIsConnecting(false);
        });
    }
  };

  const refreshPage = () => {
    navigate(0);
  }

  const disConnectWallet = async () => {
    await dispatch(actions.web3Disconnect());
    setShowModalWallet(false);
    setTimeout(async () => {                  
      refreshPage();
    },500);
  };

  const onCopy = () => {
    copyTextToClipboard(account)
      .then(() => {
        // If successful, update the isCopied state value
        dispatch(
          actions.alertActions.success({
            title: "Copied"
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      {account ? (
        <>
          <button
            className="flex flex-row items-center justify-center rounded-full bg-transparent px-4 py-[10px] font-poppins text-sm leading-5 relative"
            type="submit"
            onClick={() => setShowModalWallet(!showModalWallet)}
          >
            <GradientStrokeWrapper
              borderRadius="1.25rem"
              className="z-[1]"
            />
            <img
              className="mr-[10px] w-4 h-4"
              src={IcWallet}
              alt="icon Wallet"
            />
            {addressWalletCompact(account)}
            <img
              src={showModalWallet ? IcUp : IcDown}
              alt="icon up"
              className="w-5 h-5 ml-1"
            />
            <ModalWallet
              onCopy={onCopy}
              account={account}
              isOpen={showModalWallet}
              disConnectWallet={disConnectWallet}
            />
          </button>
          {showModalWallet && (
            <div
              className="fixed top-0 left-0 w-screen h-screen bg-transparent z-[1]"
              onClick={() => setShowModalWallet(false)}
            />
          )}

          {/* <button
            onClick={disConnectWallet}
            className="rounded-full border-2 border-solid border-[#2A9F89]"
          >
            <img
              className="p-[10px] w-10 h-10"
              src={IcLogout}
              alt="icon logout"
            />
          </button> */}
        </>
      ) : (
        <button
          onClick={connectWalletHandler}
          className="btn-connect-wallet h-12"
          type="submit"
        >
          {isConnecting ? "Connecting..." : "Connect wallet"}
        </button>
      )}
    </>
  );
};

export default BtnConnect;
