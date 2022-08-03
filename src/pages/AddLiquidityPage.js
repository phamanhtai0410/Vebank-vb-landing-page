import React from "react";
// import AddLiquidity from "../components/liquidity/AddLiquidity/FrmAddLiquidity";
import AddLiquidity from "../components/liquidity/AddLiquidity/FormAddLiquidity";
import ModalSelectToken from "../components/liquidity/AddLiquidity/selectToken/ModalSelectToken";

const AddLiquidityPage = () => {
  return (
    <section className="box-borrows mx-auto bg-cover bg-center">
      <div className="w-full h-full pb-9 min-h-screen flex items-start justify-center bg-content -z-50 pt-16">
        <AddLiquidity />
      </div>
      <ModalSelectToken />
    </section>
  );
};

export default AddLiquidityPage;
