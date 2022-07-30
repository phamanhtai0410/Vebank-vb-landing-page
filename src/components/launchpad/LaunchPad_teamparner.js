import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import launchpad_team1 from "../../assets/images/launchpad/launchpad_team1.jpg";
import launchpad_team2 from "../../assets/images/launchpad/launchpad_team2.jpg";
const LaunchPadteampartner = () => {


    const location = useLocation();
    const [keyHash, setKeyHash] = useState("#team");


    useEffect(() => {
        if (["#team", "#ourtemleadrs"].includes(location.hash)) {
            setKeyHash(location.hash);
        } else {
            setKeyHash("#team");
        }
    }, [location]);
    return (
        <div className="flex w-full pb-40">
            <div className="launchpad-content-1 ">
                <NavLink className={({ isActive }) => (keyHash === "#team" && isActive ? 'launchpad-contend-menu ' : 'inactive')}
                    key={"launchpad-team&partners"}
                    to="/launchpad#team" ><p>Team</p>
                </NavLink>
                <NavLink className={({ isActive }) => (keyHash === "#ourtemleadrs" && isActive ? 'launchpad-contend-menu ' : 'inactive')}
                    key={"launchpad-team&partners"}
                    to="/launchpad#ourtemleadrs"><p>Our team leaders</p>
                </NavLink>
            </div>
            <div className="launchpad-content-2 pl-12">
                <div><p className="launchpad-content-title pb-6">Team</p></div>
                <div className="pb-6"><span className="launchpad-content-text ">With more than 25 experienced software engineers and a history of 5+ fintech & blockchain  projects, Esol Labs innovates rapidly to accelerate a range of use-cases, empowering consumers, organizations, regulators alike to connect and exchange value in more dynamic, efficient, safe and immediate ways.</span></div>
                <img className="pb-12 rounded-xl" src={launchpad_team1} />
                <div><p className="launchpad-content-title pb-10">Our team leaders</p></div>
                <img className="rounded-2xl" src={launchpad_team2} />
            </div>
        </div>
    );
};

export default LaunchPadteampartner;