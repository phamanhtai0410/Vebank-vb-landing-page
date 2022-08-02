import { footer } from '../../assets';
import { useState } from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
  const products = [
    {title: "Trade", path: "swap"},
    {title: "Lend/Borrow", path: "/markets"},
    {title: "Pool", path: "/pool"},
    {title: "Stake", path: "/stake"},
    {title: "Farm", path: "/farm"},
    {title: "Launchpad", path: "/launchpad"}
  ];
  const supports = [
    {title: "Getting Started", link: "https://docs.vebank.io/introduction-to-vebank/sync2-wallet"},
    {title: "FAQ", link: "https://docs.vebank.io/products/faq"}
  ];
  const abouts = [
    {title: "About us", link: "https://docs.vebank.io/"},
    {title: "Docs", link: "https://docs.vebank.io/"}
  ];
  const communities = [
    {
      title: "Telegram",
      icon: footer.IcTelegram,
      details: [
        {
          title: "Official Announcement",
          link: "https://t.me/vebank_offical_ann"
        },
        {
          title: "Community",
          link: "https://t.me/vebankcommunity"
        }
      ]
    },
    {
      title: "Twitter",
      icon: footer.IcTwitter,
      link: "https://twitter.com/vebankprotocol"
    },
    {
      title: "Facebook",
      icon: footer.IcFacebook,
      link: "https://www.facebook.com/vebankprotocol"
    }
  ]

  const [showMoreValue, setShowMore] = useState("");
  const showSocialDetai = (title) => {
    if (title === showMoreValue) {
      setShowMore("");
    }
    else {
      setShowMore(title);
    }
  }
  
  window.addEventListener('mouseup', function(event){
    const ignoreMe = document.getElementById("show-more");
    if (event.target !== ignoreMe && event.target.parentNode !== ignoreMe){
      setShowMore("");
    }
  });

  return (

    <footer>

      <div className="w-full bg-[#000324]">

        <div className="py-16 px-6 flex flex-col md:flex-row justify-between items-center lg:px-52">

          <div className="flex flex-col font-poppins md:text-left text-center">
            <div className='flex flex-row items-center space-x-2'>
              <img src={footer.IcLogo} alt="Logo VeBank" className="cursor-pointer" />
              <img src={footer.IcLogoText} alt="Logo VeBank" className="cursor-pointer" />
            </div>
            
            <span className="text-[#D9D9D9] text-base pt-8">One-stop DeFi Platform on VeChain</span>
            <p className="text-[#4B5C86] text-sm pt-4">
              &copy; 2022 VeBank
            </p>
          </div>

          <div className="md:grid md:grid-cols-4 flex flex-row w-full sm:w-3/4 md:w-[55%] justify-between md:mt-0 mt-8">
            <div className="flex flex-col">
              <span className="font-poppins_semi_bold text-lg text-[#39C5F1]">PRODUCT</span>
              <div className="flex flex-col space-y-4 mt-6">
                {products.map((item, index) => (
                  <Link
                    to={item.path}
                    className="text-sm text-[#D9D9D9]"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-poppins_semi_bold text-lg text-[#39C5F1]">SUPPORT</span>
              <div className="flex flex-col space-y-4 mt-6">
                {supports.map((item, index) => (
                  <a
                    key={index}
                    href={item.link}
                    target={"_blank"}
                    rel="noopener noreferrer"
                    className="text-sm text-[#D9D9D9]"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-poppins_semi_bold text-lg text-[#39C5F1]">ABOUT</span>
              <div className="flex flex-col space-y-4 mt-6">
                {abouts.map((item, index) => (
                  <a
                    key={index}
                    href={item.link}
                    target={"_blank"}
                    rel="noopener noreferrer"
                    className="text-sm text-[#D9D9D9]"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-poppins_semi_bold text-lg text-[#39C5F1]">COMMUNITY</span>
              <div className="flex flex-col space-y-4 mt-6">
                {communities.map((item, index) => (
                  <div id="show-more" className="relative flex flex-row items-center space-x-3 cursor-pointer" onClick={() => showSocialDetai(item.title)}>
                    <img src={item.icon} alt={item.title} />
                    {item?.link ? 
                    <a
                      key={index}
                      href={item.link}
                      target={"_blank"}
                      rel="noopener noreferrer"
                      className="text-sm text-[#D9D9D9]"
                    >
                      {item.title}
                    </a> : <span key={index} className="text-sm text-[#D9D9D9]">{item.title}</span>
                    }
                    
                    {item?.details &&
                    <div>
                      <img src={footer.IcArrowBot} alt={item.title} />
                      {showMoreValue === item.title && <div className="absolute flex flex-col divide-y-[1px] divide-[#000324] bg-[#0E1B31] rounded-lg px-4 py-2 top-10 lg:top-8 right-0 z-10">
                        {item.details.map((item, index) => (
                          <div className="py-2 pr-4 flex flex-row">
                            <img src={footer.IcTelegram} alt={item.title} className="w-4 h-4" />
                            <a
                              key={index}
                              href={item.link}
                              target={"_blank"}
                              rel="noopener noreferrer"
                              className="text-sm text-[#D9D9D9] whitespace-nowrap pl-[10px]"
                            >
                              {item.title}
                            </a>
                          </div>
                        ))}
                      </div>}
                    </div>
                      
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative flex md:hidden flex-col mt-12 w-1/2">
              <div className="flex flex-row w-full justify-between">
                {communities.map((item, index) => (
                  <div className="relative flex flex-row items-center space-x-3 cursor-pointer" onClick={() => showSocialDetai(item.title)}>
                   <a
                      key={index}
                      href={item.link}
                      target={"_blank"}
                      rel="noopener noreferrer"
                      className="text-sm text-[#D9D9D9]"
                    >
                      <img src={item.icon} alt={item.title} />
                    </a>
                    
                    {item?.details && showMoreValue === item.title &&
                      <div className="absolute flex flex-col divide-y-[1px] divide-[#000324] bg-[#0E1B31] rounded-lg px-4 py-2 bottom-[-1px] left-8 z-10">
                        {item.details.map((item, index) => (
                          <div key={index} className="py-2 pr-4 flex flex-row w-full items-center">
                            <img src={footer.IcTelegram} alt={item.title} className="w-4 h-4" />
                            <a
                              href={item.link}
                              target={"_blank"}
                              rel="noopener noreferrer"
                              className="text-sm text-[#D9D9D9] whitespace-nowrap pl-[10px]"
                            >
                              {item.title}
                            </a>
                          </div>
                        ))}
                      </div>
                      
                    }
                  </div>
                ))}
              </div>
            </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
