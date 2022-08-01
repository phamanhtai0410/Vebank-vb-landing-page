import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import LaunchPadoverview from './LaunchPad_overview';
import LaunchPadteampartner from './LaunchPad_teamparner';
import LaunchPadmetrics from './LaunchPad_metrics';

const LaunchPadContent = () => {
    const location = useLocation();
    const [keyHash, setKeyHash] = useState("#overview");


    useEffect(() => {
        if (["#overview", "#team&partners", "#metrics", "#guideline"].includes(location.hash)) {
            setKeyHash(location.hash);
        } else {
            setKeyHash("#overview");
        }
    }, [location]);

    return (
        <div className="lg:container  pt-20">
            <div className="flex justify-between">
                <div className="launchpad-filter-btn rounded-full">

                    <NavLink
                        className={({ isActive }) => (keyHash === "#overview" && isActive ? 'active' : 'inactive')}
                        key={"launchpad-overview"}
                        to="/launchpad#overview"
                    >
                        Overview
                    </NavLink>

                    <NavLink
                        className={({ isActive }) => (keyHash === "#team&partners" && isActive ? 'active' : 'inactive')}
                        key={"launchpad-team&partners"}
                        to="/launchpad#team&partners"
                    >
                        Team & Partners
                    </NavLink>

                    <NavLink
                        className={({ isActive }) => (keyHash === "#metrics" && isActive ? 'active' : 'inactive')}
                        key={"launchpad-metrics"}
                        to="/launchpad#metrics"
                    >
                        Metrics
                    </NavLink>
                    <NavLink
                        className={({ isActive }) => (keyHash === "#guideline" && isActive ? 'active' : 'inactive')}
                        key={"launchpad-guideline"}
                        to="/launchpad#guideline"
                    >
                        Guideline
                    </NavLink>
                </div>
            </div>

            <div className="flex justify-start pt-12 space-x-5">
                {keyHash === "#overview" && (<LaunchPadoverview />)}
                {keyHash === "#team&partners" && (<LaunchPadteampartner />)}
                {keyHash === "#metrics" && (<LaunchPadmetrics />)}

            </div>
        </div>
    );
};

export default LaunchPadContent;
