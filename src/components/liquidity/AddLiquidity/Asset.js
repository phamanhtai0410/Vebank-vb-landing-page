import "./styles.scss";
import React, { useMemo } from "react";
import IcDropDown from "../../../assets/images/ic_dropdown.svg";
import { useSelector } from "react-redux";
import { selectBalanceById } from "../../../reducers/accountBalance.reducer";
import { selectAssetByAddress } from "../../../reducers/assetsMarket.reducer";

const Asset = ({
  assetAddress,
  volume = "",
  className = "",
  onClickSelectCurrency = () => {},
  onVolumeChange = () => {},
}) => {

  const assetBalance = useSelector(state => selectBalanceById(state, assetAddress));
  const assetInfo = useSelector(state => selectAssetByAddress(state, assetAddress));

  const onClickMaxButton = () => {
    onVolumeChange(assetBalance.toString());
  };

  const isBalanceAvailable = useMemo(
    () => assetBalance || assetBalance === 0,
    [assetBalance]
  );
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex flex-row flex-1 justify-between">
        <div
          onClick={onClickSelectCurrency}
          className="flex flex-row items-center space-x-2 cursor-pointer"
        >
          {assetInfo?.icon && (
            <img src={assetInfo?.icon} alt="" className="mr-1.5 w-8 h-8" />
          )}
          {assetInfo?.assetsChain ? (
            <span className="text-[#FAFAFA] text-base font-poppins_semi_bold">
              {assetInfo?.assetsChain}
            </span>
          ) : (
            <span className="text-[#FAFAFA] text-lg">Select a currency</span>
          )}
          <img src={IcDropDown} alt={"Dropdown"} className="w-2 h-2" />
        </div>
        <div className="flex flex-row space-x-1 items-center">
          <span className="text-grey-6 font-poppins_light text-lg mr-1.5">
            {isBalanceAvailable ? "Balance" : "_"}
          </span>
          {isBalanceAvailable && (
            <span className="font-poppins_semi_bold text-lg text-grey-1 ml-2">
              {assetBalance || "0"}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col justify-center mt-4 relative">
        <input
          placeholder="0.0"
          min={0}
          value={volume}
          pattern="^[0-9]*\.?[0-9]*$"
          onChange={(e) => onVolumeChange(e.target.value)}
          className="flex flex-1 pl-4 pr-20 py-6 focus:outline-none placeholder:text-vbDisableText font-poppins_medium text-2xl border-2 border-[#4F92A7] rounded-lg bg-transparent"
          type="text"
        />
        {assetInfo && (
          <button
            className="absolute right-3 self-center font-poppins_semi_bold text-[#A0D911] text-2xl"
            onClick={onClickMaxButton}
          >
            MAX
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(Asset);
