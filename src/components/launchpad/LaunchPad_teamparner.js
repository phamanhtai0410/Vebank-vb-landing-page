import React, { useState, useRef,useEffect } from 'react';
import launchpad_team1 from "../../assets/images/launchpad/launchpad_team1.svg";
import launchpad_team2 from "../../assets/images/launchpad/launchpad_team2.jpg";
const LaunchPadteampartner = () => {


    const scollToRef = useRef();
    const scollToRef1 = useRef();
    const [isActive, setisActive] = useState("menu1");



    useEffect(() => {
        window.addEventListener("scroll", () => {
          if(window.scrollY > 1800 ){
              setisActive("menu2")
          }
          else if(window.scrollY > 1330){
              setisActive("menu1")
          }
        });
      }, []);
    return (
        <div className="flex w-full pb-40">
            <div className="launchpad-content-1 ">
                <div className="sticky top-1/4">
                    <a className={(isActive === "menu1" ? 'launchpad-contend-menu ' : 'inactive')}
                        onClick={() => { scollToRef.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" }) ;}}><p>Team</p>
                    </a>
                    <a className={(isActive === "menu2" ? 'launchpad-contend-menu ' : 'inactive')}
                        onClick={() => { scollToRef1.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" }) ;}}><p>Our team leaders</p>
                    </a>
                </div>
            </div>
            <div className="launchpad-content-2 pl-12">
                <div id="team" className="scrollmargin" ref={scollToRef}><p className="launchpad-content-title pb-6">Team</p></div>
                <div className="pb-6"><span className="launchpad-content-text ">With more than 25 experienced software engineers and a history of 5+ fintech & blockchain  projects, Esol Labs innovates rapidly to accelerate a range of use-cases, empowering consumers, organizations, regulators alike to connect and exchange value in more dynamic, efficient, safe and immediate ways.</span></div>
                <img className="w-full pb-12 rounded-xl" src={launchpad_team1} />
                <div id="teamlead" className="scrollmargin" ref={scollToRef1}><p className="launchpad-content-title pb-10">Our team leaders</p></div>
                <img className="w-full rounded-2xl" src={launchpad_team2} />
            </div>
        </div>
    );
};

export default LaunchPadteampartner;