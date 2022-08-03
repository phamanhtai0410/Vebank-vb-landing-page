

import { useEffect, useState } from 'react'
import { useSelector, useDispatch, shallowEqual } from "react-redux";

import IcNet from '../../assets/images/ic_net.svg';
import IcVeChain from '../../assets/images/ic_vechain.svg';

import { nFormatter } from '../../utils/lib';

const NetMarket = () => {

    const [totalSupply, setTotalSupply] = useState(null);
    const [totalBorrow, setTotalBorrow] = useState(null);

    const dataAssets = useSelector(state => state.assetsMarketReducer.data, shallowEqual);
    const dataPrice = useSelector(state => state.assetsPriceReducer.data, shallowEqual);

    useEffect(() => {

        if (dataAssets && dataPrice) {
            showTotal()
        }

    }, [dataAssets, dataPrice]);

    const showTotal = () => {

        let tblSupply = 0;
        let tblBorrow = 0;

        for (const item of dataAssets) {
            if (dataPrice[item.assetsAddress]) {
                tblSupply = Number(dataPrice[item.assetsAddress] * item.totalSupplied) + tblSupply;
                tblBorrow = Number(dataPrice[item.assetsAddress] * item.totalBorrowed) + tblBorrow;
            }

        }

        setTotalSupply(nFormatter(tblSupply, 2));
        setTotalBorrow(nFormatter(tblBorrow, 2));

    }


    return (

        <div className='flex-none'>

            <div className='flex flex-row justify-start items-center space-x-4 w-full text-right cursor-pointer'>
                <img src={IcVeChain} alt="icon like" />
                <span className="font-poppins text-xl ">VeChain Market</span>
            </div>

            <div className="flex justify-start">

                <div className="flex justify-start items-center space-x-4 mt-10">
                    <img
                        className="h-12 w-12 object-cover"
                        src={IcNet}
                        alt="icon Net work"
                    />
                    <div className="xs:ml-2 lg:ml-3 font-normal">
                        <div className="font-poppins leading-4 text-[#BFBFBF] text-base">Total supply</div>
                        <div className="font-poppins leading-4 text-[#FFFFFF] text-xl pt-3">$ <span className="text-slate-100">{totalSupply}</span></div>
                    </div>
                </div>

                <div className="flex justify-start items-center space-x-4 mt-10 ml-14">
                    <img
                        className="h-12 w-12 object-cover"
                        src={IcNet}
                        alt="icon Net APY"
                    />
                    <div className="xs:ml-2 lg:ml-3 font-normal">
                        <div className="font-poppins leading-4 text-[#BFBFBF] text-base">Total borrow</div>
                        <div className="font-poppins leading-4 text-[#FFFFFF] text-xl pt-3">$ <span className="text-slate-100">{totalBorrow}</span></div>
                    </div>
                </div>

            </div>

        </div>
    )

}

export default NetMarket;