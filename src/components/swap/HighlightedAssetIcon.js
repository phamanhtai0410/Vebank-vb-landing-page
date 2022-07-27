import React from "react";
import GradientStrokeSymbol from "../partials/GradientStrokeSymbol";

const HighlightedAssetIcon = ({ icon, svgConfig }) => {
  return (
    <div className="relative flex items-center justify-center w-[32px] h-[32px] min-w-[32px] min-h-[32px]">
      <GradientStrokeSymbol config={svgConfig} />
      <div className="absolute w-[24px] h-[24px]">
        <img src={icon} alt="" className="w-full h-full" />
      </div>
    </div>
  );
};

export default HighlightedAssetIcon;
