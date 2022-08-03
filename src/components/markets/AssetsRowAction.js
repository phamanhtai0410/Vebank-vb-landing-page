import { useSelector, useDispatch, shallowEqual } from "react-redux";

import BtnOpenBorrow from './BtnOpenBorrow';
import BtnOpenWithdraw from './BtnOpenWithdraw';
import BtnOpenSupply from './BtnOpenSupply';
import BtnOpenRepay from './BtnOpenRepay';
import { nFormatter } from '../../utils/lib';
import { selectUserAssets } from "../../reducers/accountAssets.reducer";
import UserAssetSupplied from "./UserAssetSupplied";
import UserAssetBorrowed from "./UserAssetBorrowed";
import UserAssetSupply from "./UserAssetSupply";


const AssetsRowAction = ({ openRowAssets, item }) => {

    // console.log("item.assetsAddress",item.assetsAddress);
    // const accountPool = useSelector((state) =>
    //     selectUserAssets(state, item.assetsAddress)
    // );

    // // const poolAccount = useSelector(state => selectUserAssets(state,item.assetsAddress),shallowEqual);
    // console.log("accountPool",accountPool);
    // const itemAsset = useSelector(state => state.accountAssetsReducer.data[item?.assetsAddress], shallowEqual);
    
    if (openRowAssets.indexOf(item.assetsAddress) === -1) {
        return <></>;
    }
  

    return (

        <div className='bg-[#293A55] rounded-b-lg p-6 mt-2 flex flex-row justify-between space-x-6 fade-in-box' >

            <div className='bg-[#182233] p-4 rounded-lg font-montserrat'>
                <h4 className='text-[#778CC0] text-sm'>Supply balance</h4>
                <div className='flex flex-row mt-3'>
                    <UserAssetSupplied assetsAddress={item.assetsAddress} />
                    <BtnOpenWithdraw item={item} />
                </div>
            </div>

            <div className='bg-[#182233] p-4 rounded-lg font-montserrat'>
                <h4 className='text-[#778CC0] text-sm'>Balance</h4>
                <div className='flex flex-row mt-3'>
                    {/* <input
                        className="bg-transparent rounded focus:outline-none placeholder-slate-300 appearance-none text-base w-full mr-4"
                        type="text"
                        placeholder={"0"}
                        disabled={true}
                    /> */}
                    <UserAssetSupply assetsAddress={item.assetsAddress}  />
                    <BtnOpenSupply item={item} />
                </div>
            </div>

            <div className='bg-[#182233] p-4 rounded-lg font-montserrat'>
                <h4 className='text-[#778CC0] text-sm'>Borrow balance</h4>
                <div className='flex flex-row mt-3'>
                    <UserAssetBorrowed assetsAddress={item.assetsAddress} />
                    <BtnOpenRepay item={item} />
                </div>
            </div>

            <div className='bg-[#182233] p-4 rounded-lg'>
                <h4 className='text-[#778CC0] text-sm font-montserrat'>Available</h4>
                <div className='flex flex-row mt-3'>
                <input
                        className="bg-transparent rounded focus:outline-none placeholder-slate-300 appearance-none text-base w-full mr-4"
                        type="text"
                        placeholder={"0"}
                        disabled={true}
                    />
                    <BtnOpenBorrow item={item} />
                </div>
            </div>

        </div>

    )


}

export default AssetsRowAction;