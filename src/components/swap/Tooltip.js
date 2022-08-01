import React from "react";

const Tooltip = ({ info, position = "bottom", width = "170px" }) => {
  const isBottom = position === "bottom" ? true : false;
  return (
    <div
      class={`absolute ${
        isBottom ? "top-8" : "bottom-8"
      } -right-[140px] flex-col hidden group-hover:flex`}
    >
      {isBottom && (
        <div class="w-3 h-[13px] -mb-2 ml-4 rotate-45 bg-tooltip"></div>
      )}
      <p
        class={`relative w-[${width}] flex flex-col justify-center items-center z-10 p-2 text-xs text-white whitespace-pre-line bg-tooltip rounded-lg shadow-lg`}
      >
        {info}
      </p>
      {!isBottom && (
        <div class="w-3 h-[13px] -mt-2 ml-4 rotate-45 bg-tooltip"></div>
      )}
    </div>
  );
};

export default Tooltip;
