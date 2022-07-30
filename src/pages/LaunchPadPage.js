import React from 'react';
import LaunchPadSlider from "../components/launchpad/LaunchPadSlider";
import LaunchPadContent from "../components/launchpad/LaunchPadcontent";
import LaunchPadHead from "../components/launchpad/LaunchPadHead";


const LaunchPadPage = () => {
    return (
        <section className="box-borrows mx-auto bg-cover bg-center" >
            <div className="launchpad">
                <div>
                    <LaunchPadHead />
                </div>
                <LaunchPadSlider />
                <div className="flex justify-center">
                    <LaunchPadContent />
                </div>
            </div>
        </section>
    );
};

export default LaunchPadPage;
