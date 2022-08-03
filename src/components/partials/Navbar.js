
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import IcLogo from '../../assets/images/ic_logo.svg';

import HeaderAccount from '../account/HeaderAccount';
import MenuLink from './MenuLink';

const Navbar = () => {

    const [isNavOpen, setIsNavOpen] = useState(false);

    const menuToggleHandler = () => {
        setIsNavOpen((isNavOpen) => !isNavOpen);
    };

    return (

        <nav className="flex justify-between">

            <div className="flex flex-row items-center justify-center space-x-8">

                <div className="py-4 lg:w-[120px] xl:w-[136px]">
                    <NavLink to="/home">
                        <img src={IcLogo} alt="logo VEBank" />
                    </NavLink>
                </div>

                <div className="hidden md:flex h-full flex-wrap items-center justify-between ">
                    <MenuLink />
                </div>

            </div>

            <HeaderAccount />

            <section className="MOBILE-MENU flex md:hidden">

                <button
                    onClick={() => setIsNavOpen((prev) => !prev)} // toggle isNavOpen state on click
                    className="rounded-lg focus:outline-none focus:shadow-outline pr-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>

                <div className={isNavOpen ? "showMenuNav" : "hideMenuNav"}>
                    <div
                        className="absolute top-0 right-0 px-8 py-8 cursor-pointer"
                        onClick={() => setIsNavOpen(false)} // change isNavOpen state to false to close the menu
                    >
                        <svg
                            className="h-8 w-8 text-gray-200"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </div>
                    <MenuLink menuToggleHandler={menuToggleHandler} />
                </div>
            </section>
            <style>{`
            .hideMenuNav {
                display: none;
            }
            .showMenuNav {
                display: block;
                position: absolute;
                width: 100%;
                height: 100vh;
                top: 0;
                left: 0;
                background: rgba(5,10,25,.91);
                z-index: 10;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                align-items: center;
                backdrop-filter: blur(2px);
                transform: translate(0);
                transition: 0.3s ease transform;
            }`}
            </style>
        </nav>
    );
};

export default Navbar;
