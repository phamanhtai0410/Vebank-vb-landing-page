import React from "react";
import AddLiquidity from "../components/liquidity/AddLiquidity/FrmAddLiquidity";
import ModalSelectToken from "../components/liquidity/AddLiquidity/selectToken/ModalSelectToken";
import Liquidity from "../components/liquidity/HomeLiquidity";

const LiquidityPage = () => {
  return (
    <section className="box-borrows mx-auto bg-cover bg-center">
      <div className="w-full h-full pb-9 min-h-screen flex items-start justify-center bg-content -z-50 pt-16">
        <Liquidity />
      </div>
    </section>
  );
};

export default LiquidityPage;
