
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Range } from "react-range";
import { TailSpin } from 'react-loading-icons';

import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { numberWithCommas } from '../../utils/lib';

import { marketplaceConstants } from '../../constants';
import * as actions from '../../actions';

import IcNext from '../../assets/images/ic_next.svg';
import IcNext1 from '../../assets/images/ic_factory.svg';

import BtnRepay from './BtnRepay';
import BtnRepayApprove from './BtnRepayApprove';

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

const ModalRepay = () => {

    const [amount, setAmount] = useState('');
    const [remain, setRemain] = useState(0);//Remaining to repay
    const [values, setValues] = useState([0]);
    const [step, setStep] = useState(1);

    const { dataToken, accountBalance, accountApprove, loading, errorCode, message, transaction, pending, isOpen } = useSelector(state => state.repayReducer, shallowEqual);

    const dispatch = useDispatch();

    useEffect(() => {
        resetFrm();
    }, [isOpen]);

    const resetFrm = () => {
        setAmount('');
        setValues([0]);
        setStep(1);
    }

    const closeModal = () => {

        dispatch({
            type: marketplaceConstants.MODAL_CLOSE_REPAY_MARKET
        })

        if (transaction) {
            dispatch(actions.reloadAccountAssets());
        }

    };

    const closeModalAndDashboard = () => {
        closeModal();
        resetFrm();
    }

    const onChangeRangeAmount = (values) => {
        setValues(values);
        setAmount(values[0]);
    }

    const onChangeAmount = (e) => {

        const { value } = e.target;
    
        // Giá trị rỗng
        if(e.target.value === ""){
            setAmount(value)
            setValues([0]);
            onChangeRemainAmount(0);
        }

        // Lớn hơn giá trị cho phép
        if (Number(value) > Number(accountBalance)) {
            return;
        }

        // kiêm tra input number
        let pattern = /^\d+\.?\d*$/;
        if (pattern.test(value)) {
            setAmount(value)
            setValues([value]);
            onChangeRemainAmount(value);
        }

    }
    const onChangeRemainAmount = (values) => {

        if (values) {
            setRemain(accountBalance - Number(values));
        } else {
            setRemain(accountBalance);
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

    const showFactor = () => {
        if (step === 1 && amount > 0) {
            return (
                <div className='font-poppins font-light'>New health factor  <span className='font-bold'>1.03</span></div>
            )
        }
    }

    const showBtnView = () => {
        let btn = "";
        if (dataToken) {
            btn = <BtnRepay dataToken={dataToken} pending={pending} amount={amount} />
            if (Number(accountApprove) <= Number(accountBalance)) {
                btn = <BtnRepayApprove dataToken={dataToken} pending={pending} />
            } else {
                btn = <BtnRepay dataToken={dataToken} pending={pending} amount={amount} />
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
            overlayClassName="overlay-lur">

            <div className="header-modal" >
                <h2>Repay {dataToken ? dataToken.assetsChain : ""}</h2>
                <button className="btn-modal-close" onClick={closeModal}></button>
            </div>

            <div className="content-modal">

                {/* STEP 1 */}
                <div className={step === 1 ? "" : "hidden"}>
                    <div className='mt-4'>
                        <p className='w-full font-montserrat text-center text-lg text-[#A0D911] leading-6'>Repay from wallet balnace</p>
                        <p className='w-4/5 font-poppins text-base text-center text-[#F5F5F5] leading-6 m-auto pt-6'>
                            Set the amount to repay
                        </p>
                    </div>

                    <div className="flex justify-between px-8 mt-12 text-lg font-sf_pro">
                        <div className='text-[#FAFAFA]'>
                            Available to repay
                        </div>
                        <div>
                            <span className='font-poppins font-bold inline-block'>
                                {accountBalance ? accountBalance : <TailSpin className='w-4 h-4 mr-2' />}
                            </span>
                            <span className='text-[#BFBFBF] pl-2'>{dataToken ? dataToken.assetsChain : ""}</span>
                        </div>
                    </div>

                    <div className="bg-gradient-search rounded-lg flex flex-row mt-2 mx-8 py-4 px-4 justify-between">

                        <img className='w-12 h-8 pr-3' src={dataToken ? dataToken.icon : ""} alt="Token VEBank" />

                        <input
                            // ref={inputElement => {
                            //     // constructs a new function on each render
                            //     if (inputElement) {
                            //     inputElement.focus();
                            //     }
                            // }}
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

                    <div className='flex justify-between px-8 mt-12 font-poppins text-sm leading-4 text-slate-200'>
                        <label>Safer</label>
                        {showFactor()}
                        <label>Riskier</label>
                    </div>

                    <div className='px-8'>
                        {loading === false  && Number(accountBalance) > 0 ? <Range
                            step={1}
                            min={0}
                            max={accountBalance > 0 ? accountBalance : null}
                            values={values}
                            onChange={(values) => {
                                onChangeRangeAmount(values)
                            }}
                            renderTrack={({ props, children }) => (
                                <div
                                    {...props}
                                    className="w-full h-3 pr-2 my-4 bg-gradient-range-amount rounded-md"
                                >
                                    {children}
                                </div>
                            )}
                            renderThumb={({ props }) => (
                                <div
                                    {...props}
                                    className="w-3 h-3 transform translate-x-10 bg-slate-50 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                />
                            )}
                        />:"" }
                       
                    </div>
                </div>

                {/* STEP 2 */}
                <div className={step === 2 ? "" : "hidden"}>

                    <div className='mt-4'>
                        <p className='w-full font-montserrat text-center text-lg text-[#A0D911] leading-6'>Repay overview</p>
                        <p className='w-4/5 font-poppins text-base text-center text-[#F5F5F5] leading-6 m-auto pt-6'>
                            These are your transaction details. Make sure to check if this is correct before submitting
                        </p>
                    </div>

                    <div className='border-2 border-solid border-[#4F92A7] mx-8 p-6 mt-10'>

                        <div className="flex justify-between text-lg font-poppins">
                            <div className='text-[#FAFAFA] font-light'>
                                Amount to repay
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

                        <div className="flex justify-between text-lg font-poppins">
                            <div className='text-[#FAFAFA] font-light'>
                                Remaining to repay
                            </div>
                            <div className='flex items-center'>
                                <img className='w-6 h-6' src={dataToken ? dataToken.icon : ""} alt="Token VEBank" />
                                <span className='font-poppins font-bold pl-2'>{remain}</span>
                                <span className='text-[#BFBFBF] pl-2'>{dataToken ? dataToken.assetsChain : ""}</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-lg font-poppins">
                            <div className='text-[#FAFAFA]'>
                            </div>
                            <div>
                                <span className='font-poppins font-thin text-sm'>{remain}</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-lg font-poppins pt-4">
                            <div className='text-[#FAFAFA] font-light'>
                                Current Health Factor
                            </div>
                            <div>
                                <span className='font-poppins font-bold text-[#52E9A9]'>5,546.74</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-lg font-poppins pt-4">
                            <div className='text-[#FAFAFA] font-light'>
                                New health factor
                            </div>
                            <div>
                                <span className='font-poppins font-bold'>-</span>
                            </div>
                        </div>

                    </div>

                    <div className='border-2 border-solid border-[#4F92A7] mx-8 my-12'>

                        <div className="flex justify-between text-lg font-poppins bg-[#0F1B2F]">
                            <div className={`text-[#FAFAFA] text-base text-center font-light  w-1/2 p-1 bg-btn-veb ${pending === true ? "bg-pending" : ""} ${transaction ? "bg-success" : ""}`}>
                                1 Repay
                            </div>
                            <div className='w-[1px] h-full bg-[#1D1A3F]'></div>
                            <div className={`text-[#FAFAFA] text-base text-center font-light w-1/2 p-1 ${pending === true ? "bg-pending" : ""} ${transaction ? "bg-success" : ""}`}>
                                2 {pending ? "Pending" : "Finished"}
                            </div>
                        </div>

                        <div className="flex justify-between text-lg font-poppins p-6">
                            <div>
                                <div className='font-light text-base'>

                                    {transaction ?
                                        <label className='text-[#50e3ab]'>2/2 Repay</label>
                                        :
                                        <>
                                            <label className='text-[#50e3ab]'>1/2 Repay</label>
                                            <div className='text-[#FAFAFA] pt-2'>Please submit to Repay</div>
                                        </>
                                    }

                                </div>
                            </div>
                            <div className='pt-1 flex flex-row'>

                                {pending ? <TailSpin className='w-6 h-6 m-4' /> : ""}

                                {transaction ?
                                    <button onClick={e => { closeModalAndDashboard(e) }} className={`btn-modal-veb bg-btn-veb`} type="submit">Dashboard</button>
                                    :
                                    showBtnView()
                                    // <BtnRepay pending={pending} amount={amount} rate={rate} />
                                }

                            </div>
                        </div>

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

export default ModalRepay;