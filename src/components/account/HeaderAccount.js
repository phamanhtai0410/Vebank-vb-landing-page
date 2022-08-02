import React from "react";
import GradientStrokeWrapper from "../partials/GradientStrokeWrapper";

import BalanceVB from "./BalanceVB";
// import BalanceVET from "./BalanceVET";
import BtnConnect from "./BtnConnect";

const HeaderAccount = () => {
  return (
    <div className="hidden md:flex flex-wrap items-center justify-between ">
      <div className="flex flex-row justify-center items-center my-auto space-x-2">
        <button
          className="flex border-solid  rounded-full bg-transparent px-4 py-[8px] font-poppins text-base leading-4 relative"
          type="submit"
        >
          <GradientStrokeWrapper
            borderRadius="1.25rem"
            className="z-[1]"
          />
          <BalanceVB />
          {/* <span className='inline-flex mt-[1px] mx-3 h-5 w-[1px] bg-[#2A9F89]'></span>
                    <BalanceVET /> */}
        </button>

        <BtnConnect />
      </div>
    </div>
  );
};
export default HeaderAccount;
