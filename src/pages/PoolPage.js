import React from "react";

import AssetsPool from "../components/pool/AssetsPool";
import FrmSearchPool from "../components/pool/FrmSearchPool";

const PoolPage = () => {
  return (
    <section className="box-borrows mx-auto bg-cover bg-center">
      <div className="lg:px-4 lg:container xl:px-12 mx-auto px-4 min-h-screen pt-10 pb-24">
        <div className="flex flex-row w-full justify-between items-center mt-4">
          <div className="flex flex-row w-full items-center">
            <span className="font-poppins_bold text-2xl text-vbLine">
              Pools
            </span>
            <div className="flex flex-row ml-12 space-x-1">
              <span className="text-base text-[#678BCA]">
                TVL: 
              </span>
              <span className="font-poppins_semi_bold text-base text-hint">
                $200,333,444.55
              </span>
            </div>
            <div className="flex flex-row ml-6 space-x-1">
              <span className="text-base text-[#678BCA]">
                Volume24H:
              </span>
              <span className="font-poppins_semi_bold text-base text-hint">
                $50,666,777.88
              </span>
            </div>
          </div>
          
          <div className="flex flex-row items-center justify-end space-x-4 w-full text-right cursor-pointer">
            <span className="font-poppins text-base">
              Show staked
            </span>
            <div className="flex items-center justify-center">
              <label htmlFor="toggleB" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" id="toggleB" className="sr-only" />
                  <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </label>
            </div>
          </div>
          {/* <FrmSearchPool /> */}
        </div>

        <AssetsPool />

      </div>
    </section>
  );
};

export default PoolPage;
