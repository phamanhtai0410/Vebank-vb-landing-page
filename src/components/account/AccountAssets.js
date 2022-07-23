

import { useEffect, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import * as actions from '../../actions';

import { nFormatter } from '../../utils/lib';

import IcDropdown from '../../assets/images/ic_dropdown.svg';
import IcVeBank from '../../assets/images/ic_vebank.svg';

const AccountAssets = () => {

    const dispatch = useDispatch();

    const [showAssets, setShowAssets] = useState(false);

    const { data } = useSelector(state => state.accountAssetsReducer, shallowEqual);
    const dataAssets = useSelector(state => state.assetsMarketReducer.data, shallowEqual);
    const dataPrice = useSelector(state => state.assetsPriceReducer.data, shallowEqual);

    useEffect(() => {
        if (dataAssets && dataAssets.length > 0 && data.length  === 0) {
            fetchAccountAssets(dataAssets);
        }
    }, [dataAssets]);

    async function fetchAccountAssets(dataAssets) {
        await dispatch(actions.getAccountAssets(dataAssets));
    }

    const handlerClickShowAssets = (e) => {
        setShowAssets(!showAssets);
    }

    const renderListAsset = (dataList) => {

        if (dataList && dataList.length > 0) {

            return dataList.map((item) =>

                <CSSTransition
                    key={item.assetsAddress}
                    timeout={500}
                    classNames="item_asset"
                >
                    <div>

                        <div className="grid grid-cols-5 gap-5 mt-6 bg-[#182844] justify-items-center content-around font-poppins text-lg rounded cursor-pointer" >

                            <div className="p-2 flex flex-row justify-center items-center space-x-4 w-full text-right cursor-pointer">
                                <img className="w-6 h-6" src={item.icon} />
                                <span className="text-lg font-semibold w-12 text-left">{item.assetsChain}</span>
                            </div>

                            <div className="p-2 flex flex-col justify-center items-center font-semibold">

                                {
                                    item.totalSupplied ? <>
                                        <div className="text-lg font-semibold">{nFormatter(item.totalSupplied, 2)}</div>
                                        <div className="flex flex-row justify-start items-center space-x-2" >
                                            <span className="font-light text-[14px] font-poppins text-gray-300">$ {item.totalSupplied ? nFormatter(item.totalSupplied * dataPrice[item.assetsAddress], 6) : 0}</span>
                                        </div>
                                    </> : <div className="text-lg font-semibold">-</div>
                                }

                            </div>

                            <div className="p-2 flex flex-col justify-center items-center content-center">
                                <div className="text-lg font-semibold">{item.supplyAPY} %</div>
                                <div className="border-2 border-solid border-[#4F92A7] p-1">
                                    <div className="flex flex-row justify-start items-center space-x-2" >
                                        <span className="font-light text-sm">{item.interestSupply} %</span>
                                        <img className="w-4 h-4" src={IcVeBank} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 flex flex-col justify-center items-center font-semibold">
                                {item.totalBorrowed ? <>  <div className="text-lg font-semibold">{nFormatter(item.totalBorrowed, 2)}</div>
                                    <div className="flex flex-row justify-start items-center space-x-2" >
                                        <span className="font-light text-[14px] font-poppins text-gray-300">$ {item.totalBorrowed ? nFormatter(item.totalBorrowed * dataPrice[item.assetsAddress],6) : 0}</span>
                                    </div></> :
                                    <div className="text-lg font-semibold">-</div>
                                }
                            </div>

                            {/* <div className="p-2 flex justify-center items-center font-semibold">{item.totalBorrowed} </div> */}

                            <div className="p-2 flex flex-col justify-center items-center content-center">
                                <div className="text-lg font-semibold">{item.borrowAPY} %</div>
                                <div className="border-2 border-solid border-[#4F92A7] p-1">
                                    <div className="flex flex-row justify-start items-center space-x-2" >
                                        <span className="font-light text-sm">{item.interestBorrow} %</span>
                                        <img className="w-4 h-4" src={IcVeBank} />
                                    </div>
                                </div>
                            </div>

                            {/* 
                                <div className="p-2 flex justify-center items-center cursor-pointer" >
                                    <img className="w-3 h-3" src={IcDropdown} />
                                </div> 
                            */}

                        </div>

                    </div>


                </CSSTransition>
            );
        }

    }

    return (
        <div className='bg-[#0b1329] mt-10 px-8 py-5 rounded '>

            <div className='flex flex-row justify-between cursor-pointer' onClick={e => handlerClickShowAssets()}>
                <div className='font-montserrat text-lg text-[#3FDCA5]'>
                    Your supply & borrow
                </div>
                <div className='flex flex-row justify-start items-center space-x-2 ' >
                    <span className='text-white text-sm'>{showAssets ? "Hidden" : "Show"} </span>
                    <img className={`w-3 h-3 cursor-pointer transition-transform delay-350 ${showAssets ? 'rotate-180' : ""}`} src={IcDropdown} />
                </div>
            </div>

            <div className={`tbl-veb mt-8 ${showAssets === true ? 'h-auto' : "h-0 hidden"}`}>

                <div className="grid grid-cols-5 gap-5 justify-items-center content-around">
                    <div className="px-2 py-2">Assets</div>
                    <div className="px-2 py-2">Supply balance</div>
                    <div className="px-2 py-2">Supply APY</div>
                    <div className="px-2 py-2">Borrow balance</div>
                    <div className="px-2 py-2">Borrow APY</div>
                    {/* <div className=''></div> */}
                </div>

                <TransitionGroup>
                    {renderListAsset(data)}
                </TransitionGroup>

            </div>
        </div>
    )

}

export default AccountAssets;