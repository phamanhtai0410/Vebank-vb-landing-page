import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import IcSearch from "../../assets/images/ic_pool_search.svg";

const FrmSearchPool = () => {
  return (
    <div className="flex flex-row items-center justify-center p-[12px_16px] w-60 space-x-3 border border-vbDisableText rounded-lg">
      <img alt="search_icon" src={IcSearch} />
      <input
        className="bg-transparent focus:outline-none font-poppins appearance-none text-base w-full ml-1 text-vbDisableText placeholder-vbDisableText"
        type="text"
        placeholder={"Search All"}
      />
    </div>
  );
};

export default FrmSearchPool;
