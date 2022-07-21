
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ThreeDots } from 'react-loading-icons';

import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { numberWithCommas } from '../../utils/lib';

import { marketplaceConstants } from '../../constants';
import * as actions from '../../actions';

import BtnSupply from './BtnSupply';

import IcExplorer from '../../assets/images/ic_explorer.svg';
import IcSuccess from '../../assets/images/ic_success.svg';
import IcVeChain from '../../assets/images/ic_vechain.svg';

import useAutoFocus from '../common/hooks/useAutoFocus';
import BtnSupplyApprove from './BtnSupplyApprove';

const customStyles = {
    content: {
        top: '30%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -30%)',
        background: "#182233",
        border: "none",
        borderRadius: "8px",
        padding: 0,
        width: '640px'
    },
};

const IcVeb = IcVeChain;

const ModalSupply = () => {

    const [amount, setAmount] = useState('');
    const [step, setStep] = useState(1);

    const { dataToken, accountBalance, accountApprove, errorCode, message, transaction, pending, isOpen } = useSelector(state => state.supplyReducer, shallowEqual);

    const dispatch = useDispatch();
    const amountInputRef = useAutoFocus();

    useEffect(() => {
        resetFrm();
    }, [dataToken]);

    useEffect(() => {
        setStep(1);
        if(isOpen){
            setAmount('');
        }
    }, [isOpen]);

    const resetFrm = () => {
        setAmount('');
        setStep(1);
    }

    const closeModal = () => {

        dispatch({
            type: marketplaceConstants.MODAL_CLOSE_SUPPLY_MARKET
        })

        if (transaction) {
            dispatch(actions.reloadAccountAssets());
        }

    };

    const closeModalAndDashboard = () => {
        closeModal();
        resetFrm();
        dispatch(actions.reloadAccountAssets());
    }

    const onChangeRangeAmount = (values) => {
        setAmount(values[0]);
    }

    const onChangeAmount = (e) => {

        const { value } = e.target;

        // Giá trị rỗng
        if(e.target.value === ""){
            setAmount(value);
        }

        // Lớn hơn giá trị cho phép
        if (Number(value) > Number(accountBalance)) {
            return;
        }

        // kiêm tra input number
        let pattern = /^\d+\.?\d*$/;
        if (pattern.test(value)) {
            setAmount(value)
        }

    }

    const handlerStepToStep = (e) => {
        if (step === 1 && amount > 0) {
            setStep(2);
        }
    }

    const showCheckStepContinue = () => {
        if (step === 1 && amount > 0) {
            return true;
        }
    }

    const showBtnView = () => {
        let btn = "";
        if (dataToken) {
            if (accountApprove === 0 || accountApprove < Number(accountBalance)) {
                btn = <BtnSupplyApprove dataToken={dataToken} pending={pending} />
            } else {
                btn = <BtnSupply dataToken={dataToken} pending={pending} amount={amount} />
            }
        }
        return btn;
    }

    return (

        <Modal
            // isOpen={Object.keys(data).length > 0 ? true : false}
            isOpen={isOpen}
            ariaHideApp={false}
            style={customStyles}
            portalClassName="modal-veb"
            overlayClassName="overlay-lur"
        >
            <div className="header-modal" >
                <h2>Supply {dataToken ? dataToken.assetsChain : ""}</h2>
                <button className="btn-modal-close" onClick={closeModal}></button>
            </div>

            <div className="content-modal">

                {/* STEP 1 */}
                <div className={step === 1 ? "" : "hidden"}>
                    <div className='mt-4'>
                        <p className='w-full font-montserrat text-center text-lg text-[#A0D911] leading-6'>How much would you like to suply?</p>
                        <p className='w-4/5 font-poppins text-base text-center text-[#F5F5F5] leading-6 m-auto pt-6'>
                            Please enter an amount you would like to supply. The maximum amount you can supply is shown below.
                        </p>
                    </div>

                    <div className="flex justify-between px-8 mt-12 text-lg font-sf_pro">
                        <div className='text-[#FAFAFA]'>
                            Available to supply
                        </div>
                        <div>
                            <span className='font-poppins font-bold'>{accountBalance}</span>
                            <span className='text-[#BFBFBF] pl-2'>{dataToken ? dataToken.assetsChain : ""}</span>
                        </div>
                    </div>

                    <div className="bg-gradient-search rounded-lg flex flex-row mt-2 mx-8 py-4 px-4 justify-between">
                        <img className='w-12 h-8 pr-3' src={dataToken ? dataToken.icon : ""} alt="Token VEBank" />
                        <input
                            ref={amountInputRef}
                            value={amount}
                            onChange={onChangeAmount}
                            className="bg-transparent focus:outline-none placeholder-slate-400 font-poppins appearance-none text-base w-full"
                            type="text"
                            placeholder={"Amount"}
                        />
                        <span onClick={e => {
                            onChangeRangeAmount([accountBalance])
                        }} className='font-poppins font-bold text-[#A0D911] text-lg cursor-pointer'>Max</span>

                    </div>

                </div>

                {/* STEP 2 */}
                <div className={step === 2 ? "" : "hidden"}>

                    <div className='mt-4'>
                        <p className='w-full font-montserrat text-center text-lg text-[#A0D911] leading-6'>Supply overview</p>
                        <p className='w-4/5 font-poppins text-base text-center text-[#F5F5F5] leading-6 m-auto pt-6'>
                            There are your transaction details. Make sure to check
                            if this is correct before submitting.
                        </p>
                    </div>

                    <div className='border-2 border-solid border-[#4F92A7] mx-8 p-6 mt-10'>

                        <div className="flex justify-between text-lg font-poppins">
                            <div className='text-[#FAFAFA] font-light'>
                                Amount
                            </div>
                            <div className='flex items-center'>
                                <img className='w-6 h-6' src={dataToken ? dataToken.icon : ""} alt="Token VEBank" />
                                <span className='font-poppins font-bold pl-2'>{amount}</span>
                                <span className='text-[#BFBFBF] pl-2'>{dataToken ? dataToken.assetsChain : ""}</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-lg font-poppins">
                            <div className='text-[#FAFAFA]'>
                            </div>
                            <div>
                                <span className='font-poppins font-thin text-sm'>{amount} $</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-lg font-poppins pt-4">
                            <div className='text-[#FAFAFA] font-light'>
                                Collateral Usage
                            </div>
                            <div>
                                <span className='font-poppins font-bold text-[#52E9A9]'>YES</span>
                            </div>
                        </div>

                    </div>

                    <div className='border-2 border-solid border-[#4F92A7] mx-8 my-12'>

                        <div className="flex justify-between text-lg font-poppins">
                            <div className={`text-[#FAFAFA] bg-[#39355F] text-base text-center font-light  w-1/2 p-1 bg-btn-veb ${pending === true ? "bg-pending" : ""} ${transaction ? "bg-success" : ""}`}>
                                1 Supply
                            </div>
                            <div className='w-[1px] h-full bg-[#1D1A3F]'></div>
                            <div className={`text-[#FAFAFA] bg-[#39355F] text-base text-center font-light w-1/2 p-1 ${pending === true ? "bg-pending" : ""} ${transaction ? "bg-success" : ""}`}>
                                2  {pending ? "Pending" : "Finished"}
                            </div>
                        </div>

                        <div className="flex justify-between text-lg font-poppins p-6">
                            <div className='font-light text-base flex items-center'>

                                {transaction ?
                                    <label className='text-[#50e3ab]'>2/2 Success!</label>
                                    : ""
                                }

                                {(pending === false && transaction === null) ?
                                    <div className='block'>
                                        <label className='text-[#50e3ab]'>1/2 Supply</label>
                                        <div className='text-[#FAFAFA] pt-2'>Please submit to supply</div>
                                    </div>
                                    : ""}

                                {(pending === true && transaction === null) ? <p className='text-[#FA8C16] text-left'>Transaction(s) Pending</p> : ""}

                            </div>

                            <div className='pt-1 flex flex-row'>


                                {transaction ?
                                    <button onClick={e => { closeModalAndDashboard(e) }} className={`btn-modal-veb bg-btn-veb`} type="submit">Dashboard</button>
                                    :
                                    ""
                                }

                                {(pending === false && transaction === null) ? showBtnView() : ""}

                            </div>

                        </div>

                        {transaction || pending === true ?
                            <div className='flex flex-row border-t-2 border-solid border-[#4F92A7] font-poppins text-base'>
                                <div className='flex-1 w-32 border-r-2 border-solid border-[#4F92A7] indent-3.5 p-2'>Supply</div>
                                <div className='flex-1 w-32 border-r-2 border-solid border-[#4F92A7] flex items-center indent-3.5 p-2'>
                                    Pending
                                    {transaction ? <img className='ml-2' src={IcSuccess} alt="icon success" /> : <ThreeDots className='w-6 h-6 ml-2' />}
                                </div>
                                <div className='flex-1 w-32 flex items-center indent-3.5 p-2 cursor-pointer'>
                                    Explorer
                                    <img className='ml-2' src={IcExplorer} />
                                </div>
                            </div>
                            : ""}

                    </div>

                </div>

            </div>

            {
                (step === 1) ?
                    <div className="footer-modal px-8 py-12">
                        <button
                            onClick={e => { handlerStepToStep(e) }}
                            className={`btn-modal-veb w-full ${showCheckStepContinue() ? "bg-btn-veb" : ""} `} >Continue</button>
                    </div> : ""
            }

        </Modal>
    )
}

export default ModalSupply;