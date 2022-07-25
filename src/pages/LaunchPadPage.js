import React from 'react';
import LaunchPadSlider from "../components/launchpad/LaunchPadSlider";
import LaunchPadItems from "../components/launchpad/LaunchPadItems";


const LaunchPadPage = () => {
    return (
        <section className="box-borrows mx-auto bg-cover bg-center" >
            <div className="lg:px-4 lg:container xl:px-12 mx-auto px-4 min-h-screen pt-16 pb-24">
                <div className="flex justify-center">
                   <LaunchPadSlider />
                </div>
                <div className="flex justify-center">
                    <LaunchPadItems />
                </div>
            </div>
        </section>
    );
};

export default LaunchPadPage;
