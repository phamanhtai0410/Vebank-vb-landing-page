import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import launchpad_overview1 from "../../assets/images/launchpad/launchpad_overview1.svg";
import launchpad_overview2 from "../../assets/images/launchpad/launchpad_overview2.svg";
import launchpad_overview3 from "../../assets/images/launchpad/launchpad_overview3.svg";
import launchpad_overview4 from "../../assets/images/launchpad/launchpad_overview4.svg";
import launchpad_overview5 from "../../assets/images/launchpad/launchpad_overview5.svg";
import launchpad_overview6 from "../../assets/images/launchpad/launchpad_overview6.svg";

const LaunchPadoverview = () => {


    const [isActive, setisActive] = useState("menu1");

    const scollToRef = useRef();
    const scollToRef1 = useRef();
    const scollToRef2 = useRef();
    const scollToRef3 = useRef();



    return (
        <div className="flex w-full pb-40">
            <div className="launchpad-content-1 ">
                <div className="sticky top-1/4">
                    <a className={(isActive === "menu1" ? 'launchpad-contend-menu ' : 'inactive')} onClick={() => {scollToRef.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });setisActive("menu1")}}><p>What is VeBank?</p>
                    </a>
                    <a className={(isActive === "menu2" ? 'launchpad-contend-menu ' : 'inactive')} onClick={() => { scollToRef1.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "center" });setisActive("menu2")}}><p>Why build on VeChain?</p>
                    </a>
                    <a className={(isActive === "menu3" ? 'launchpad-contend-menu ' : 'inactive')} onClick={() => {scollToRef2.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "center" });setisActive("menu3")}}><p>Roadmap</p>
                    </a>
                    <a className={(isActive === "menu4" ? 'launchpad-contend-menu ' : 'inactive')} onClick={() => {scollToRef3.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "center" });setisActive("menu4")}}><p>VB Protocol Tokens</p>
                    </a>

                </div>

            </div>
            <div className="launchpad-content-2 pl-12">
                <div className="scrollmargin" ref={scollToRef}><p className="launchpad-content-title pb-6">What is VeBank?</p></div>
                <div className="pb-6"><span className="launchpad-content-text blue-text">VeBank is a one-stop DeFi protocol built on the VeChainThor (VeChain) <span className="launchpad-content-text">blockchain which provides fundamental finance functionalities, such as DEX, lending/borrowing, staking, farming, and launchpad, on this chain. VeBank targets to become the leading application on VeChain's ecosystem, building the most essential DeFi solutions, and being the gateway for all financial transactions on VeChain's global trading system.</span></span></div>
                <img className="pb-6" src={launchpad_overview1} />
                <div className="pb-16"><span className="launchpad-content-text blue-text">VeBank  <span className="launchpad-content-text">provides a unique solution for DeFi that no other protocols could build for VeChain - an Oracle (SEER). VeBank's Oracle provides real-time feeds of over 10 asset values: BTC, ETH, VET, VTHO, VeUSD…, and ensures that every dApp built on VeChain can easily access truthful data.
                    Beside, in order to make it more convenient and easier in transferring crypto assets, tokens or data from one blockchain to another, VeBank plans to build a bridge which will bring assets from top blockchain platforms such as Ethereum, Binance, Avalanche, and so forth, to VeChain, increasing transaction and total value locked on this chain</span></span></div>
                <div className="scrollmargin" ref={scollToRef1}><p className="launchpad-content-title pb-6">Why build on VeChain?</p></div>
                <img className="pb-6" src={launchpad_overview2} />
                <div className="pb-6"><span className="launchpad-content-text blue-text">VeChainThor (VeChain)<span className="launchpad-content-text">, according to CoinMarketcap, is among top 40 layer-1 blockchain (#31) in terms of market capitalization. VeChain has over 2.3 million holders (VET + VTHO) and over 1.8 million wallet addresses. In addition, VeChain has a loyal community with more than 400k followers on twitter, 40k telegram members and 200k reddit members.</span></span></div>
                <img className="pb-6 rounded-xl" src={launchpad_overview3} />
                <div className="pb-16"><span className="launchpad-content-text blue-text">VeChain <span className="launchpad-content-text">VeChain is the world's leading blockchain platform providing technology solutions for businesses. More than 30 of the major US enterprises (500 Fortune) including Walmart, BMW, LVMH, Renault and PwC all have solutions running directly on VeChain, with 250+ clients currently being onboarded <span className="launchpad-content-text blue-text">(https://vechaininsider.com/introduction/)</span>. Most recently, VeChain announced a $100M partnership with UFC, becoming the first official layer-1 blockchain partner providing carbon-neutral marketing services for this prestigious global tournament. VeChain also partnered with Alchemy Pay to enhance the utility of VET tokens - this action makes VET tokens accepted in over 2 million stores based in 70 different countries. In March 2022, VeChain launched the stable coin VeUSD - the first step to build a DeFi ecosystem. VeChain promises to become a fertile ground for DeFi ecosystems to expand and grow.
                    <span className="launchpad-content-text blue-text">(https://vechainstats.com/)</span></span></span></div>
                <div><p className="launchpad-content-title pb-6">VeBank Product</p></div>
                <img className="pb-6 rounded-xl" src={launchpad_overview4} />
                <div className="scrollmargin" ref={scollToRef2}><p className="launchpad-content-title pb-6">Roadmap</p></div>
                <img className="pb-6 rounded-xl" src={launchpad_overview5} />
                <div className="scrollmargin" ref={scollToRef3}><p className="launchpad-content-title pb-6">VB Protocol Tokens</p></div>
                <img className="rounded-xl" src={launchpad_overview6} />
            </div>
        </div >
    );
};

export default LaunchPadoverview;