import { useSelector, useDispatch, shallowEqual } from "react-redux";

import BtnOpenBorrow from './BtnOpenBorrow';
import BtnOpenWithdraw from './BtnOpenWithdraw';
import BtnOpenSupply from './BtnOpenSupply';
import BtnOpenRepay from './BtnOpenRepay';
import { nFormatter } from '../../utils/lib';
import { selectUserAssets } from "../../reducers/accountAssets.reducer";


const UserAssetSupplied = ({ assetsAddress }) => {

    const accountPool = useSelector((state) =>
        selectUserAssets(state, assetsAddress)
    );

    if (!assetsAddress) {
        return <></>;
    }

    return (

        <input
            className="bg-transparent rounded focus:outline-none placeholder-slate-300 appearance-none text-base w-full mr-4"
            type="text"
            placeholder={"0"}
            disabled={true}
            value={nFormatter(accountPool?.totalSupplied,2)}
        />
    )


}

export default UserAssetSupplied;