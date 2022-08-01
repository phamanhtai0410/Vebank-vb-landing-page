import React from "react";

const Tooltip = ({ info, position = "bottom", width = "170px" }) => {
  const isBottom = position === "bottom" ? true : false;
  return (
    <div
      className={`absolute ${
        isBottom ? "top-8" : "bottom-8"
      } -right-[140px] flex-col hidden group-hover:flex`}
    >
      {isBottom && (
        <div className="w-3 h-[13px] -mb-2 ml-4 rotate-45 bg-tooltip"></div>
      )}
      <p
        className={`relative w-[${width}] flex flex-col justify-center items-center z-10 p-[10px] text-[12px] leading-4 text-white whitespace-pre-line bg-tooltip rounded-lg shadow-lg`}
      >
        {info}
      </p>
      {!isBottom && (
        <div className="w-3 h-[13px] -mt-2 ml-4 rotate-45 bg-tooltip"></div>
      )}
    </div>
  );
};

export default Tooltip;
