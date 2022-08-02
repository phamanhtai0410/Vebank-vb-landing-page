import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import LaunchPadoverview from './LaunchPad_overview';
import LaunchPadteampartner from './LaunchPad_teamparner';
import LaunchPadmetrics from './LaunchPad_metrics';
import LaunchPadmylaunches from './LaunchPad_mylaunches';

const LaunchPadContent = () => {
    const location = useLocation();
    const [keyHash, setKeyHash] = useState("#overview");


    useEffect(() => {
        if (["#overview", "#team&partners", "#metrics", "#mylaunches"].includes(location.hash)) {
            setKeyHash(location.hash);
        } else {
            setKeyHash("#overview");
        }
    }, [location]);

    return (
        <div className="lg:container py-20">
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
                        className={({ isActive }) => (keyHash === "#mylaunches" && isActive ? 'active' : 'inactive')}
                        key={"launchpad-mylaunches"}
                        to="/launchpad#mylaunches"
                    >
                        My launches
                    </NavLink>
                </div>
            </div>

            <div className="flex justify-start pt-12 space-x-5">
                {keyHash === "#overview" && (<LaunchPadoverview />)}
                {keyHash === "#team&partners" && (<LaunchPadteampartner />)}
                {keyHash === "#metrics" && (<LaunchPadmetrics />)}
                {keyHash === "#mylaunches" && (<LaunchPadmylaunches />)}
            </div>
        </div>
    );
};

export default LaunchPadContent;
