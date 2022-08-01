import React, { useState, useEffect } from 'react';
import LaunchPadvebank from "../../assets/images/launchpad/vebank.svg";
import LaunchPadraise from "../../assets/images/launchpad/raise-icon.svg";

const LaunchPadSlider = () => {
    const [value, onChange] = useState(1);
    const [expiryTime, setExpiryTime] = useState("1 oct 2022 15:30:25");
    const [countdownTime, setCountdownTime] = useState(
        {
            countdownDays: '',
            countdownHours: '',
            countdownlMinutes: '',
            countdownSeconds: ''
        }
    );
    const countdownTimer = () => {

        const timeInterval = setInterval(() => {
            const countdownDateTime = new Date(expiryTime).getTime();
            const currentTime = new Date().getTime();
            const remainingDayTime = countdownDateTime - currentTime;
            const totalDays = Math.floor(remainingDayTime / (1000 * 60 * 60 * 24));
            const totalHours = Math.floor((remainingDayTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const totalMinutes = Math.floor((remainingDayTime % (1000 * 60 * 60)) / (1000 * 60));
            const totalSeconds = Math.floor((remainingDayTime % (1000 * 60)) / 1000);

            const runningCountdownTime = {
                countdownDays: totalDays,
                countdownHours: totalHours,
                countdownMinutes: totalMinutes,
                countdownSeconds: totalSeconds
            }

            setCountdownTime(runningCountdownTime);

            if (remainingDayTime < 0) {
                clearInterval(timeInterval);
                setExpiryTime(false);
            }

        }, 1000);
    }

    useEffect(() => {
        countdownTimer();
    })

    const n = 4;
    return (
        <div className="flex relative mx-auto lg:container ">
            <div className="raise-box-1 relative rounded-xl bg-[url('../../assets/images/launchpad/market3.svg')] bg-no-repeat bg-center bg-cover">
                <div className="flex w-full p-6 absolute bottom-0">
                    <div className="w-1/2 flex">
                        <img className="mr-4 w-[100px]" src={LaunchPadvebank} />
                        <div className="relative w-full">
                            <div className="absolute bottom-0">
                                <p className="text-[20px] font-bold">VeBank</p>
                                <p className="text-[12px] font-normal">One-stop DeFi Platform</p>
                                <div className="raise-allocation">
                                    <span className="text-[12px] font-normal">Max Allocation</span><span className="pl-3 text-[12px] font-bold">2,000 VB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2 relative">
                        <div className="text-center absolute bottom-0 right-0">
                            <p>PROJECT STARTS IN</p>
                            <div className="grid-cols-4 gap-4 flex flex-row justify-center">
                                <div className="count-down">
                                    <p className="text-[24px] leading-5">{countdownTime.countdownDays}<p className="text-[12px]">DAYS</p></p>
                                </div>
                                <div className="count-down">
                                    <p className="text-[24px] leading-5">{countdownTime.countdownHours}<p className="text-[12px]">HOURS</p></p>
                                </div>
                                <div className="count-down">
                                    <p className="text-[24px] leading-5">{countdownTime.countdownMinutes}<p className="text-[12px]">MINUTES</p></p>
                                </div>
                                <div className="count-down">
                                    <p className="text-[24px] leading-5">{countdownTime.countdownSeconds}<p className="text-[12px]">SECONDS</p></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="raise-box-2 ml-8 p-8 raise-bg rounded-xl">
                <div className="font-semibold pb-2  text-[18px]">Total raise</div>
                <div className="flex items-center pb-4">
                    <div className="font-bold w-full text-[#FEB23F] text-[24px]">300,000,000 VEUSD</div>
                    <img className="raise-icon float-right" src={LaunchPadraise} />
                </div>
                <div className="flex">
                    <p className="font-medium w-full text-[16px]">Price per token</p>
                    <p className="font-bold pb-2 text-[16px]">$0.03</p>
                </div>
                <div>
                    <p>Total supply</p>

                    <div className="slider-parent">
                        <input className="input-suplly rounded-xl" type="range" min="1" max="10000000" value={5000000} disabled />
                        <div className="flex pb-4 leading-4">
                            <div className="w-1/2">0</div>
                            <div className="w-1/2 text-right">10000000</div>
                        </div>
                    </div>
                </div>
                <div className="pb-8">
                    <p className="pb-2">Amount</p>
                    <div className="raise-input">
                        <input placeholder='0.0'></input>
                        <button className="raise-button">MAX</button>
                    </div>
                </div>
                <button className="raise-submit">Buy</button>
            </div>
        </div>
    );
};

export default LaunchPadSlider;
