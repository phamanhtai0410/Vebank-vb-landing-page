import { useMemo } from "react";
import { useSelector } from "react-redux";
import ImgRemove from "../../assets/images/buttons/img_remove_btn.svg";

import { useNavigate } from "react-router-dom";
import { selectUserLiquidityPoolByPoolAddress } from "../../reducers/userAssetPools.reducer";
import RouteName from "../../constants/routeName.constants";
import { selectAccount } from "../../reducers/web3.reducer";

const BtnOpenRemoveLiquidity = ({ assetsPoolAddress = "" }) => {
  const navigate = useNavigate();

  const account = useSelector(selectAccount);
  const liquidityPool = useSelector((state) =>
    selectUserLiquidityPoolByPoolAddress(state, assetsPoolAddress ?? "")
  );

  const disabledRule = useMemo(() => {
    return !liquidityPool || liquidityPool == 0 || !account;
  }, [account, liquidityPool]);

  const handlerOpenModal = async () => {
    // if (item && item.assetsAddress && disabledRule === false) {
    navigate(`${RouteName.REMOVE_LIQUIDITY}/${assetsPoolAddress ?? ""}`);
    // }
  };

  return (
    <>
      {disabledRule || (
        <img
          src={ImgRemove}
          alt=""
          className="w-12 h-12 cursor-pointer"
          onClick={handlerOpenModal}
        />
      )}
    </>
  );
};

export default BtnOpenRemoveLiquidity;
