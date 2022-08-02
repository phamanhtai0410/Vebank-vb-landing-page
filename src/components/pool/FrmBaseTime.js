import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import IcArrowSelect from "../../assets/images/ic_arrow_select.svg";

const FrmBaseTime = ({ timeBasis, onTimeBasisChange }) => {
  const [showTimeBasis, setShowTimeBasis] = useState(false);
  const timeBasicArr = [
    { duration: "24H" },
    { duration: "7D" },
    { duration: "30D" },
  ];
  const onTimeBasisSelected = (value) => {
    onTimeBasisChange(value);
    setShowTimeBasis(!showTimeBasis);
  };
  return (
    <div className="flex flex-col p-[12px_16px] border border-vbDisableText rounded-lg bg-[#0D1522]">
      <div
        className="flex flex-row items-center justify-between space-x-3 pr-4 cursor-pointer"
        onClick={() => setShowTimeBasis(!showTimeBasis)}
      >
        <span className="text-base text-vbDisableText whitespace-nowrap">
          Time Basis
        </span>
        <span className="text-base text-white w-8">{timeBasis}</span>
        <img
          alt="select_icon"
          src={IcArrowSelect}
          className={`mr-4 transition-transform ${
            showTimeBasis ? "rotate-180" : ""
          }`}
        />
      </div>
      {showTimeBasis && (
        <div className="flex flex-col">
          <div className="h-[1px] w-full bg-vbDisableText my-3"></div>
          <div className="flex flex-col space-y-3">
            {timeBasicArr.map((timeBasic, index) => (
              <span className="text-base text-white cursor-pointer" onClick={() => onTimeBasisSelected(timeBasic.duration)}>
                {timeBasic.duration}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FrmBaseTime;
