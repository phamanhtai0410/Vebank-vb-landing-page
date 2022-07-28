import { memo } from "react";
import { useSelector } from "react-redux";
import { selectPoolInfoByAddress } from "../../reducers/assetsPool.reducer";
import {
  selectUserAmountAByPoolAddress,
  selectUserAmountBByPoolAddress,
  selectUserLiquidityPoolByPoolAddress,
} from "../../reducers/userAssetPools.reducer";
import { nFormatter } from "../../utils/lib";
import BtnOpenAddLiquidity from "./BtnOpenAddLiquidity";
import BtnOpenRemoveLiquidity from "./BtnOpenRemoveLiquidity";

const PoolRowAction = ({ assetsPoolAddress = "" }) => {

  const userLiquidity = useSelector((state) =>
    selectUserLiquidityPoolByPoolAddress(state, assetsPoolAddress ?? "")
  ) ?? 0;
  const amountTokenA = useSelector((state) =>
    selectUserAmountAByPoolAddress(state, assetsPoolAddress ?? "")
  );
  const amountTokenB = useSelector((state) =>
    selectUserAmountBByPoolAddress(state, assetsPoolAddress ?? "")
  );
  const poolInfo = useSelector((state) =>
    selectPoolInfoByAddress(state, assetsPoolAddress)
  );

  const showAmountUSD = () => {
    if (amountTokenA > 0 && amountTokenB > 0) {
      return (amountTokenA / amountTokenB).toFixed(4);
    }
    return 0;
  };

  return (
    <div className="bg-[#182844] p-6 mt-2 fade-in-box">
      <div className="bg-[#26355A] p-6 rounded flex flex-row justify-between rounded space-x-4">
        <div>
          <label className="font-poppins text-[14px] text-[#678BCA]">
            Your Liquidity
          </label>
          <div className="font-montserrat text-[16px] text-[#3EE8FF]">
            ${nFormatter(showAmountUSD(), 2)}
          </div>
          {/* <div className="font-montserrat text-[16px] text-[#3EE8FF]">
            {userLiquidity || 0} LP
          </div> */}
        </div>

        <div>
          <label className="text-[#678BCA] font-poppins text-[14px]">
            Assets Pooled
          </label>
          <div className="font-montserrat text-[16px] text-[#3EE8FF]">
            {amountTokenA || 0} {poolInfo.assetsChainA}
          </div>
          <div className="font-montserrat text-[16px] text-[#3EE8FF]">
            {amountTokenB || 0} {poolInfo.assetsChainB}
          </div>
        </div>

        <div>
          <label className="text-[#678BCA] font-poppins text-[14px]">
            Your Share
          </label>
          <div className="font-montserrat text-[16px] text-[#3EE8FF]">
            {poolInfo?.liquidity > 0
              ? (userLiquidity * 100) / poolInfo?.liquidity
              : 0}
            %
          </div>
        </div>

        <div className="flex flex-row space-x-6 justify-center items-center">
          <BtnOpenRemoveLiquidity assetsPoolAddress={assetsPoolAddress} />
          <BtnOpenAddLiquidity assetsPoolAddress={assetsPoolAddress} />
        </div>
      </div>
    </div>
  );
};

export default memo(PoolRowAction);
