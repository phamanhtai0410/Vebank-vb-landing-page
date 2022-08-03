import React from "react";
import { useSelector } from "react-redux";
import { CSSTransition } from "react-transition-group";
import { selectAssetByAddress } from "../../../../reducers/assetsMarket.reducer";

const PopularTokens = ({ id, onTokenSelected }) => {
  const assetInfo = useSelector((state) => selectAssetByAddress(state, id));
  return (
    <CSSTransition
      key={assetInfo?.assetsAddress}
      timeout={500}
      classNames="item_asset"
    >
      <div
        className="flex flex-row justify-between items-center p-[6px_10px] cursor-pointer space-x-[10px] border border-vbDisableText rounded-lg"
        onClick={(_) => onTokenSelected(id)}
      >
        <img src={assetInfo?.icon} alt="" className="w-5 h-5" />
        <div className="flex flex-col">
          <p className="font-poppins_semi_bold text-sm">
            {assetInfo?.assetsChain}
          </p>
        </div>
      </div>
    </CSSTransition>
  );
};

export default React.memo(PopularTokens);
