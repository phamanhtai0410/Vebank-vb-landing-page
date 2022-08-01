import React from 'react';
import LaunchPadheadimg from "../../assets/images/launchpad/launchpad_head.jpg";

const LaunchPadHead = () => {

    return (
        <div className="relative head-img pb-8">
            <div className="w-full">
                <img className="w-full" src={LaunchPadheadimg} />
            </div>
        </div>
    );
};

export default LaunchPadHead;
