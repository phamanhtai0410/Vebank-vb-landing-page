import React, { useState, useEffect } from 'react';
import LaunchPadvebank from "../../assets/images/launchpad/vebank.svg";
import LaunchPadraise from "../../assets/images/launchpad/raise-icon.svg";
import CountdownIDO from"../launchpad/countdown"
const LaunchPadSlider = () => {

    const data = {
        start_time:1659286800,
        end_time:1664557200,
    }
      const checkStartTime = () => {
        if (!data) {
          return false;
        }
    
        if (!data.start_time) {
          return false;
        }
        const currentDate = new Date();
        const startDate = new Date(data.start_time * 1000);
    
        return currentDate.getTime() > startDate.getTime();
      };
    
      const checkEndTime = () => {
        if (!data) {
          return false;
        }
    
        if (!data.end_time) {
          return false;
        }
    
        const currentDate = new Date();
        const endDate = new Date(data.end_time * 1000);
    
        return currentDate.getTime() < endDate.getTime();
      };
    
      const showCountDown = () => {
        if (!data) {
          return;
        }
    
        if (!data.start_time || !data.end_time) {
          return;
        }
    
        if (checkStartTime() === false) {
          return <CountdownIDO eventTime={data.start_time} interval={1000} />;
        }
    
        if (checkEndTime() === true) {
          return <CountdownIDO eventTime={data.end_time} interval={1000} />;
        }
    
        return <CountdownIDO eventTime={null} interval={0} />;
      };
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
                                <div className="flex flex-col items-center space-y-6 w-full">
                                    {showCountDown()}
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
