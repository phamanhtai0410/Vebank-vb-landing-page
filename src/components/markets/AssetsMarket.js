



import { useEffect, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useLocation } from 'react-router-dom';

import IcVeBank from '../../assets/images/ic_vebank.svg';
import IcDropdown from '../../assets/images/ic_down_asset.svg';
import IcCaretDown from '../../assets/images/ic_caret_down-fill.svg';

import AssetsRowAction from './AssetsRowAction';

import * as actions from '../../actions';
import CurrencyAssets from './CurrencyAssets';


const AssetsMarket = () => {

    const [openRowAssets, setOpenRowAssets] = useState([]);

    const dispatch = useDispatch();

    const { web3 } = useSelector(state => state.web3, shallowEqual);
    const { data } = useSelector(state => state.assetsMarketReducer, shallowEqual);

    useEffect(() => {
        if (web3) {
            fetchMarketAssets();
        }
    }, [web3]);

    
    async function fetchMarketAssets() {
        await dispatch(actions.getMarketAssets());
    }

    const onClickShowRowAssets = (assetsAddress) => {

        const listShowChecked = [...openRowAssets];
        const indexShow = openRowAssets.indexOf(assetsAddress);

        if (indexShow === -1) {
            listShowChecked.push(assetsAddress);
        } else {
            listShowChecked.splice(indexShow, 1);
        }

        setOpenRowAssets(listShowChecked);

    }

    const checkShowDown = (assetsAddress) => {
        return !(openRowAssets.indexOf(assetsAddress) === -1);
    }

    const showListAsset = (dataList) => {

        if (dataList && dataList.length > 0) {

            return dataList.map((item) =>

                <CSSTransition
                    key={item.assetsAddress}
                    timeout={500}
                    classNames="item_asset"
                >
                    <div className='bg-[#182233] rounded-lg mt-[10px]'>

                        <div className="grid grid-cols-6 gap-6 justify-items-center content-around font-poppins text-lg cursor-pointer" onClick={e => onClickShowRowAssets(item.assetsAddress)}>

                            <div className="p-2 flex flex-row justify-center items-center space-x-4 w-full text-right cursor-pointer">
                                <img className="w-6 h-6" src={item.icon} />
                                <span className="text-lg font-semibold w-12 text-left">{item.assetsChain}</span>
                            </div>

                            <div className="p-2 flex justify-center items-center font-semibold">
                                <CurrencyAssets currencyBalance={item.totalSupplied} assetsAddress={item.assetsAddress} />
                            </div>

                            <div className="p-2 flex flex-col justify-center items-center content-center">
                                <div className="text-base font-semibold">{item.supplyAPY} %</div>
                                <div className="border-2 border-solid border-[#4F92A7] p-1">
                                    <div className="flex flex-row justify-start items-center space-x-2" >
                                        <span className="font-light text-sm">{item.interestSupply} %</span>
                                        <img className="w-4 h-4" src={IcVeBank} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 flex justify-center items-center font-semibold">
                                <CurrencyAssets currencyBalance={item.totalBorrowed} assetsAddress={item.assetsAddress} />
                            </div>

                            <div className="p-2 flex flex-col justify-center items-center content-center">
                                <div className="text-base font-semibold">{item.borrowAPY} %</div>
                                <div className="border-2 border-solid border-[#4F92A7] p-1">
                                    <div className="flex flex-row justify-start items-center space-x-2" >
                                        <span className="font-light text-sm">{item.interestBorrow} %</span>
                                        <img className="w-4 h-4" src={IcVeBank} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 flex justify-center items-center cursor-pointer" >
                                <img className={`w-4 h-4 transition-transform delay-350 ${checkShowDown(item.assetsAddress) ? 'rotate-180' : ""}`} src={IcDropdown} />
                            </div>

                        </div>

                        <AssetsRowAction key={item.assetsAddress + '_act'} openRowAssets={openRowAssets} item={item} />

                    </div>

                </CSSTransition>

            );
        }

    }

    return (

        <div className="w-full min-h-max rounded-lg bg-tbl-vb mt-16 p-10 fade-in-box">

            <h4 className="font-montserrat text-[20px] leading-9 text-[#3FDCA5]">Vechain assets</h4>

            <div className="tbl-veb mt-8">

                <div className="grid grid-cols-6 gap-6 justify-items-center content-around">
                    <div className="px-2 py-2 flex">
                        <span>Assets</span>
                        <img className='ml-1 w-4' src={IcCaretDown} alt={IcCaretDown} />
                    </div>
                    <div className="px-2 py-2 flex">
                        <span>Total supplied</span>
                        <img className='ml-1 w-4' src={IcCaretDown} alt={IcCaretDown} />
                    </div>
                    <div className="px-2 py-2 flex">
                        <span>Supply APY</span>
                        <img className='ml-1 w-4' src={IcCaretDown} alt={IcCaretDown} />
                    </div>
                    <div className="px-2 py-2 flex">
                        <span>Total borrowed</span>
                        <img className='ml-1 w-4' src={IcCaretDown} alt={IcCaretDown} />
                    </div>
                    <div className="px-2 py-2 flex">
                        <span>Borrow APY</span>
                        <img className='ml-1 w-4' src={IcCaretDown} alt={IcCaretDown} />
                    </div>
                    <div className='col-end-auto'></div>
                </div>

                <TransitionGroup>
                    {showListAsset(data)}
                </TransitionGroup>

            </div>

        </div>
    )

}

export default AssetsMarket;