import { useEffect, useState } from "react";
import Navbar from "./Navbar";

const Header = () => {
  const [show, setShow] = useState(false);

  const controlNavbar = () => {
    if (window.scrollY > 1) {
      setShow(true);
    } else {
      setShow(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, []);

  return (
    <header className={`${show ? "navigation" : ""}`}>
    {/* <header className="fixed w-full z-[1]"> */}
      <div className="mx-auto mx-2 lg:mx-4 2xl:mx-8">
        <Navbar />
      </div>
    </header>
  );
};

export default Header;
