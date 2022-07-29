import "./styles.scss";
import React, { useMemo } from "react";
import IcDropDown from "../../../assets/images/ic_dropdown.svg";
import IcDefaultSymbol from "../../../assets/images/ic_default_symbol.svg";
import { useSelector } from "react-redux";
import { selectBalanceById } from "../../../reducers/accountBalance.reducer";
import { selectAssetByAddress } from "../../../reducers/assetsMarket.reducer";
import HighlightedAssetIcon from "../../swap/HighlightedAssetIcon";
import { svgSymbolConfig } from "../../../_helpers/param";
import { formatBalanceString } from "../../../utils/lib";

const Asset = ({
  assetAddress,
  volume = "",
  className = "",
  onClickSelectCurrency = () => {},
  onVolumeChange = () => {},
}) => {
  const assetBalance = useSelector((state) =>
    selectBalanceById(state, assetAddress)
  );
  const assetInfo = useSelector((state) =>
    selectAssetByAddress(state, assetAddress)
  );

  const onClickMaxButton = () => {
    onVolumeChange(assetBalance.toString());
  };

  const onClickHalfButton = () => {
    onVolumeChange((assetBalance / 2).toString());
  };

  const isBalanceAvailable = useMemo(
    () => assetBalance || assetBalance === 0,
    [assetBalance]
  );
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex flex-col border border-solid border-vbDisableText rounded-lg bg-[#0E1B31] py-4 px-6">
        {/* <div
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
        </div> */}
        <div className="flex items-center justify-end">
          {isBalanceAvailable && (
            <span className="text-hint font-poppins text-xs">
              Balance: {assetBalance ? formatBalanceString(assetBalance) : "--"}
            </span>
          )}
        </div>
        <div className="flex flex-row w-full items-center justify-between">
          <div className="flex flex-row w-[55%] items-center">
            <button
              className="flex flex-row w-full items-center space-x-[10px]"
              onClick={onClickSelectCurrency}
            >
              <HighlightedAssetIcon
                icon={assetInfo?.icon || IcDefaultSymbol}
                svgConfig={svgSymbolConfig}
              />
              <span className="font-poppins_bold text-base text-grey-1">
                {assetInfo?.assetsChain || "SELECT"}
              </span>
              <img className="w-[10px] h-[8px]" src={IcDropDown} alt="" />
            </button>

            <div className="flex text-[#647BB4] space-x-1 ml-3">
              {assetInfo && (
                <div className="flex flex-row w-full items-center space-x-1">
                  <div className="w-[1px] h-8 bg-hint mr-2"></div>
                  <button
                    className="flex flex-row items-center justify-center sm:w-[40px] w-[36px] h-[28px] rounded bg-[#203557] text-xs"
                    onClick={onClickMaxButton}
                  >
                    Max
                  </button>
                  <button
                    className="flex flex-row items-center justify-center sm:w-[40px] w-[36px] h-[28px] rounded bg-[#203557] text-xs"
                    onClick={onClickHalfButton}
                  >
                    Half
                  </button>
                </div>
              )}
            </div>
          </div>
          <input
            placeholder="0.0"
            min={0}
            value={volume}
            pattern="^[0-9]*\.?[0-9]*$"
            onChange={(e) => onVolumeChange(e.target.value)}
            className="w-[45%] pl-4 py-1 focus:outline-none placeholder:text-white font-poppins_semi_bold text-lg text-right rounded-lg bg-transparent"
            type="text"
          />
        </div>
      </div>
      {/* <div className="flex flex-col justify-center mt-4 relative">
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
      </div> */}
    </div>
  );
};

export default React.memo(Asset);
