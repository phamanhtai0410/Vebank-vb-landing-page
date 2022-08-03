
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import IcSearch from '../../assets/images/ic_search.png';

const TabMarket = () => {

    const location = useLocation();
    const [keyHash, setKeyHash] = useState("#native");

    useEffect(() => {
        if (location.hash === "#usd") {
            setKeyHash(location.hash);
        } else if (location.hash === "#native") {
            setKeyHash(location.hash);
        } else {
            setKeyHash("#native");
        }
    }, [location]);

    return (

        <div className='flex flex-row-reverse flex-auto items-center flex-initial w-full'>

            <div className="tab-market ml-5">

                <NavLink
                    className={({ isActive }) => (keyHash === "#native" && isActive ? 'active' : 'inactive')}
                    key={"currency-usd"}
                    to="/markets#native"
                >
                    Native
                </NavLink>

                <NavLink
                    className={({ isActive }) => (keyHash === "#usd" && isActive ? 'active' : 'inactive')}
                    key={"currency-native"}
                    to="/markets#usd"
                >
                    USD
                </NavLink>

            </div>

            <div className="hidden lg:flex flex-row bg-gradient-search rounded-lg ml-8 py-1 px-4 ra justify-between md:hidden lg:w-80 xl:w-96">
                <input
                    className="bg-transparent focus:outline-none placeholder-slate-300 font-poppins appearance-none text-sm w-full"
                    type="text"
                    placeholder={"Search"}
                />
                <img
                    alt="search_icon"
                    src={IcSearch}
                    className="ml-1 object-contain"
                />
            </div>

        </div>
    )
}

export default TabMarket;