import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const MENU_LINKS = [
  {
    name: "Trade",
    path: "/trade",
  },
  {
    name: "Lend",
    path: "/markets",
  },
  {
    name: "Pool",
    path: "/pool",
  },
  {
    name: "Stake",
    path: "/stake",
  },
  {
    name: "Farm",
    path: "/farm",
  },
  {
    name: "Launchpad",
    path: "/launchpad",
  },
];

const MenuLink = ({ menuToggleHandler }) => {
  const location = useLocation();
  const [isMenuHover, setOnMenuHover] = useState(false);

  const onMouseOver = (_) => {
    if (!isMenuHover) setOnMenuHover(true);
  };

  const onMouseOut = (_) => {
    if (isMenuHover) {
      setOnMenuHover(false);
    }
  };

  return (
    <ul
      className="box-menus flex flex-col md:flex-row items-center justify-center md:space-x-2 lg:space-x-4 font-semibold"
      style={{ marginTop: "0px", marginBottom: "0px", height: "100%" }}
    >
      {/* // <ul className="flex flex-col items-center justify-between "> */}

      {MENU_LINKS.map((item, index) => (
        <li
          key={index}
          className="flex items-center h-24 md:h-full p-8 md:p-0"
          onMouseOver={item.name === "Trade" ? onMouseOver : undefined}
          onMouseLeave={item.name === "Trade" ? onMouseOut : undefined}
        >
          <NavLink
            to={item.path}
            className={`px-6 font-bold text-base text-gray-300 hover:brightness-150 ${
              item.path === location.pathname ? "text-linear" : ""
            }`}
          >
            {item.name}
          </NavLink>
          {item.name === "Trade" && isMenuHover &&  (
            <div
              className="navbar-sub-menu absolute w-full col text-base justify-center items-start top-19 md:w-[160px] p-4 md:p-0 rounded-lg z-50"
            >
              <NavLink
                to="/swap"
                className={`block px-6 py-2 font-bold text-base text-gray-300 hover:brightness-150 ${
                  isMenuHover ? "text-linear" : ""
                }`}
              >
                Swap
              </NavLink>
              <NavLink
                to="/liquidity"
                className={`block px-6 py-2 font-bold text-base text-gray-300 hover:brightness-150 ${
                  isMenuHover ? "text-linear" : ""
                }`}
              >
                Liquidity
              </NavLink>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default MenuLink;
