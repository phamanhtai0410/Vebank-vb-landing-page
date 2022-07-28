import React from "react";
import { useSelector } from "react-redux";
import Swap from "../components/swap/Swap";
import ModalSelectToken from "../components/swap/ModalSelectToken";
import { selectOpenChooseTokenState } from "../reducers/swap.reducer";
// import TradeChart from "../components/trade/TradeChart";
// import IcVeBank from "../assets/images/ic_vebank.svg";
// import IcVThor from "../assets/images/ic_vtho.svg";
// import IcVeUSD from "../assets/images/ic_veusd.svg";
// import IcVeChain from "../assets/images/ic_vechain.svg";
// import Wallet from "../components/swap/Wallet";
// import TrendingPairs from "../components/swap/TrendingPairs";
// import PoolChart from "../components/swap/PoolChart";

// const COIN_TYPES = [
//   {
//     symbol: "VB",
//     icon: IcVeBank,
//     price: 10,
//   },
//   {
//     symbol: "VTHO",
//     icon: IcVThor,
//     price: 20,
//   },
//   {
//     symbol: "VEUSD",
//     icon: IcVeUSD,
//     price: 1,
//   },
//   {
//     symbol: "VET",
//     icon: IcVeChain,
//     price: 15,
//   },
// ];

const SwapPage = () => {
  const isSelectTokenModalOpen = useSelector(selectOpenChooseTokenState);
  // const [swapToken, setSwapToken] = useState({
  //   from: {
  //     symbol: COIN_TYPES[0].symbol,
  //     icon: COIN_TYPES[0].icon,
  //     price: COIN_TYPES[0].price,
  //   },
  //   to: {
  //     symbol: COIN_TYPES[1].symbol,
  //     icon: COIN_TYPES[1].icon,
  //     price: COIN_TYPES[1].price,
  //   },
  // });

  return (
    <section className="box-borrows mx-auto bg-cover bg-center">
      <div className="w-full h-full pb-9 min-h-screen overflow-hidden flex flex-col items-center bg-content -z-50 xl:pt-[10vh] 2xl:pt-[15vh] pt-[3vh]">
        <div
          className={`${
            isSelectTokenModalOpen ? "hidden" : "flex"
          } flex flex-row p-4 space-x-6 sm:mx-0 mx-1`}
        >
          {/* <div className="flex flex-col">
            <div className="rounded-2xl border border-vbLine bg-popupVb p-8 w-full md:w-[308px] h-[172px]">
              <Wallet />
            </div>
            <div className="rounded-2xl border border-vbLine bg-popupVb p-8 w-full md:w-[308px] h-auto">
              <TrendingPairs />
            </div>
          </div> */}

          <div className="rounded-2xl border border-vbLine bg-newForm h-full p-8 w-full md:w-[490px] xl:w-[530px]">
            <Swap />
          </div>
          {/* <div className="rounded-2xl border border-vbLine bg-popupVb p-8 w-full md:w-[370px] h-[266px]">
            <PoolChart />
          </div> */}
        </div>
        <ModalSelectToken />
      </div>
    </section>
  );
};

export default SwapPage;
