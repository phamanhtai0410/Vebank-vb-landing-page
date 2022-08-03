import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import IcVB from "../../assets/images/ic_vebank.svg";
import { selectBalanceById } from "../../reducers/accountBalance.reducer";
import { formatBalanceString } from "../../utils/lib";

// import { numberWithCommas } from "../../utils/lib";

const BalanceVB = () => {
  const [balanceAccount, setBalanceAccount] = useState(null);
  const balance = useSelector((state) =>
    selectBalanceById(state, process.env.REACT_APP_TOKEN_VEBANK)
  );

  useEffect(() => {
    setBalanceAccount(balance);
  }, [balance]);

  return (
    <div className="flex flex-row justify-start items-center space-x-2">
      <img className="w-4 h-4" src={IcVB} alt="Coin VeBank" />
      <span className="font-poppins font-medium text-slate-50 text-base">
        {balanceAccount ? formatBalanceString(balanceAccount) : `${0}`}
      </span>
    </div>
  );
};

export default BalanceVB;
