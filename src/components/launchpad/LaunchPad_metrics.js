import React from 'react';
import LaunchPad_metrics from "../../assets/images/launchpad/launchpad_metrics.svg";
import LaunchPad_metrics1 from "../../assets/images/launchpad/launchpad_metrics1.svg";

const LaunchPadmetrics = () => {

    return (
        <div className="w-full pb-40">
            <div><p className="launchpad-content-title pb-6">$VB Tokenomics</p></div>
            <img className="w-full pb-10" src={LaunchPad_metrics} />
            <img className="w-full pb-10" src={LaunchPad_metrics1} />

        </div>
    );
};

export default LaunchPadmetrics;
