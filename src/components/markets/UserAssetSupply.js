import { useSelector, useDispatch, shallowEqual } from "react-redux";

import BtnOpenBorrow from './BtnOpenBorrow';
import BtnOpenWithdraw from './BtnOpenWithdraw';
import BtnOpenSupply from './BtnOpenSupply';
import BtnOpenRepay from './BtnOpenRepay';
import { nFormatter } from '../../utils/lib';
import { selectBalanceById } from "../../reducers/accountBalance.reducer";


const UserAssetSupply = ({ assetsAddress }) => {

    const accountBalance = useSelector((state) =>
        selectBalanceById(state, assetsAddress)
    );

    if (!assetsAddress) {
        return <></>;
    }

    console.log("accountBalance",accountBalance);
    return (

        <input
            className="bg-transparent rounded focus:outline-none placeholder-slate-300 appearance-none text-base w-full mr-4"
            type="text"
            placeholder={"0"}
            disabled={true}
            value={nFormatter(accountBalance,2)}
        />
    )

}

export default UserAssetSupply;