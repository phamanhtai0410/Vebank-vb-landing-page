import React from "react";
import AssetsFarm from "../components/farm/AssetsFarm";
import ModalFarming from "../components/farm/ModalFarming";
import ModalUnFarm from "../components/farm/ModalUnFarm";
import FarmTab from "../components/farm/FarmTab";

const FarmPage = () => {
  return (
    <section className="farm box-borrows mx-auto bg-cover bg-center">
      <div className="lg:px-4 lg:container xl:px-12 mx-auto px-4 min-h-screen pt-16 pb-24">
        <div className="flex flex-row mt-4">
          <div className="flex flex-row justify-between items-center w-full cursor-pointer">
            <div className="flex flex-row items-end w-1/5">
              <span className="font-poppins_medium font-[700] text-2xl text-[#3EE8FF]">
                Farm
              </span>
              <span className="font-poppins text-base text-[#678BCA] ml-12">
                TVL:&nbsp;
              </span>
              <span className="font-poppins text-base text-[#7694DE]">
                $200,333,444.55
              </span>
            </div>
            <FarmTab />
            <div className="flex items-center justify-end w-1/5">
              <span className="font-poppins text-base">Show staked</span>
              <label
                htmlFor="toggleB"
                className="flex items-center cursor-pointer pl-6"
              >
                <div className="relative">
                  <input type="checkbox" id="toggleB" className="sr-only" />
                  <div className="block bg-gray-600 w-10 h-6 rounded-full" />
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition" />
                </div>
              </label>
            </div>
          </div>
        </div>

        <AssetsFarm />
        <ModalFarming />
        <ModalUnFarm />
      </div>
    </section>
  );
};

export default FarmPage;
