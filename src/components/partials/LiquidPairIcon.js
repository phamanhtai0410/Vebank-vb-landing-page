import React from "react";

const LiquidPairIcon = ({ iconAsset1 = "", iconAsset2 = "", iconSize="8", }) => (
  <div className="flex -space-x-2 overflow-hidden">
    <img
      className={`inline-block h-${iconSize} w-${iconSize} rounded-full`}
      src={iconAsset1}
      alt=""
    />
    <img
      className={`inline-block h-${iconSize} w-${iconSize} rounded-full`}
      src={iconAsset2}
      alt=""
    />
  </div>
);

export default React.memo(LiquidPairIcon);
