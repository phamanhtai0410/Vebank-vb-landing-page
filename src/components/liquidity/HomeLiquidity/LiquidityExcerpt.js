import React, { Fragment, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectPoolInfoByAddress } from "../../../reducers/assetsPool.reducer";
import {
  selectUserAmountAByPoolAddress,
  selectUserAmountBByPoolAddress,
  selectUserLiquidityPoolByPoolAddress,
  selectUserPoolAssetByPoolAddress,
} from "../../../reducers/userAssetPools.reducer";
import { nFormatter, numberWithCommas } from "../../../utils/lib";
import LiquidPairIcon from "../../partials/LiquidPairIcon";
import IcCollapse from "../../../assets/images/buttons/ic_collapse.svg";
import { useNavigate } from "react-router-dom";
import RouteName from "../../../constants/routeName.constants";
import GradientStrokeWrapper from "../../partials/GradientStrokeWrapper";
import * as actions from "../../../actions";

const LiquidityExcerpt = ({ poolAddress, poolSelect, setPoolSelect }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const poolInfo = useSelector((state) =>
    selectPoolInfoByAddress(state, poolAddress)
  );
  const userLiquidity = useSelector((state) =>
    selectUserLiquidityPoolByPoolAddress(state, poolAddress)
  );
  const amountTokenA = useSelector((state) =>
    selectUserAmountAByPoolAddress(state, poolAddress)
  );
  const amountTokenB = useSelector((state) =>
    selectUserAmountBByPoolAddress(state, poolAddress)
  );

  const shareAPool = useMemo(
    () => (userLiquidity / poolInfo?.liquidity) * 100.0,
    [poolInfo?.liquidity, userLiquidity]
  );

  const removeLiquidity = () => {
    // navigate(`${RouteName.REMOVE_LIQUIDITY}/${poolAddress}`);
    dispatch(actions.openModalRemoveLiquidity(poolAddress));
  };

  const handleAddLiquidity = () => {
    navigate(`${RouteName.ADD_LIQUIDITY}/${poolAddress}`);
  };

  const onClickPool = (poolAddress) => {
    if (poolAddress === poolSelect) {
      setPoolSelect("");
    } else {
      setPoolSelect(poolAddress);
    }
  };

  return (
    <div className="liquid-wrapper px-4 py-3 col-y-center bg-[#0E1B31]">
      <div
        className="flex flex-row justify-between items-center cursor-pointer"
        onClick={() => onClickPool(poolAddress)}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex flex-row items-center space-x-4">
            <LiquidPairIcon
              iconAsset1={poolInfo?.iconOrigin}
              iconAsset2={poolInfo?.iconAssets}
              iconSize="6"
            />
            <p className="font-poppins_semi_bold text-xl">{`${poolInfo?.assetsChainA}-${poolInfo?.assetsChainB}`}</p>
          </div>
          {/* <p className="w-2/3 text-xl text-grey-2 font-poppins_light">
            {nFormatter(userLiquidity, 8)}
          </p> */}
        </div>
        <img
          src={IcCollapse}
          alt=""
          className={`w-11 h-11 transition-transform delay-350 ${
            poolAddress !== poolSelect ? "rotate-180" : ""
          }`}
        />
      </div>
      {
        <div
          className={`${
            poolAddress === poolSelect ? "flex" : "hidden"
          } fade-in-box flex-col mt-3`}
        >
          <div className="w-full h-[1px] bg-vbDisableText"></div>
          <div className="col mt-[20px] space-y-[14px]">
            <div className="full-row-between-center space-x-4">
              {/* <img src={poolInfo?.iconOrigin} alt="" className="w-8 h-8" /> */}
              <p className="text-xs text-white">Pool (Base)</p>
              <p className="text-xs font-poppins_medium text-white">
                {nFormatter(amountTokenA, 5)} {poolInfo?.assetsChainA}
              </p>
            </div>
            <div className="full-row-between-center space-x-4">
              {/* <img src={poolInfo?.iconAssets} alt="" className="w-8 h-8" /> */}
              <p className="text-xs text-white">Pool (Quote)</p>
              <p className="text-xs font-poppins_medium text-white">
                {nFormatter(amountTokenB, 5)} {poolInfo?.assetsChainB}
              </p>
            </div>
            <div className="full-row-between-center">
              <p className="text-xs text-white">Your share</p>
              {poolInfo?.liquidity ? (
                <p className="text-xs font-poppins_medium text-white">{`${
                  shareAPool < 0.01 ? "<0.01" : nFormatter(shareAPool, 5)
                }%`}</p>
              ) : (
                <div className="loading" />
              )}
            </div>
          </div>
          <div className="flex flex-row items-center w-full mt-[20px] space-x-4 pb-2">
            <button
              onClick={handleAddLiquidity}
              className="w-full text-lg font-poppins_medium bg-btn-veb py-3 rounded-lg"
            >
              Add Liquidity
            </button>
            <div
              className="flex items-center justify-center px-4 py-6 cursor-pointer border border-[#02A4FF] rounded"
              onClick={removeLiquidity}
            >
              <div className="w-4 h-[2px] bg-white"></div>
            </div>
            {/* <div
              className="relative flex items-center justify-center px-4 py-6 cursor-pointer"
              onClick={removeLiquidity}
            >
              <GradientStrokeWrapper borderRadius="0.25rem" className="z-10" />
              <div className="relative w-4 h-[2px] bg-white"></div>
            </div> */}
          </div>
          {/* <button
            onClick={removeLiquidity}
            className="btn-modal-veb w-full h-16.5 mt-10 text-lg font-poppins_medium bg-btn-veb"
          >
            Remove
          </button>
          <p
            onClick={handleAddLiquidity}
            className="flex flex-1 self-center text-[#22D4EC] mt-6 text-lg font-poppins_medium text-center cursor-pointer"
          >
            + Add liquidity instead
          </p> */}
        </div>
      }
    </div>
  );
};

export default React.memo(LiquidityExcerpt);
