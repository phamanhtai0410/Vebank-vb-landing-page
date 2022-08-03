import React from "react";
import IcSearch from "../../assets/images/ic_search.svg";

const SearchBar = ({ className="", searchValue, onSearchValueChange }) => {
  return (
    <div
      className={`hidden lg:flex flex-1 flex-row items-center space-x-4 border border-solid border-[#678BCA] rounded-lg py-3 px-4 ra justify-between md:hidden ${className}`}
    >
      <img alt="search_icon" src={IcSearch} className="w-[18px] h-[18px] object-contain" />
      <input
        className="flex flex-grow bg-transparent focus:outline-none placeholder-vbDisableText font-poppins_light appearance-none text-base w-full"
        type="text"
        placeholder={"Search token name"}
        value={searchValue}
        onChange={(e) => onSearchValueChange(e.target.value)}
      />
    </div>
  );
};

export default React.memo(SearchBar);
