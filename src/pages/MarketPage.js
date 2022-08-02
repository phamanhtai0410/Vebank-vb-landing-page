import React from "react";
import { useParams } from "react-router";
import AccountAssets from "../components/account/AccountAssets";
// import { useDispatch, useSelector } from "react-redux";

import AssetsMarket from "../components/markets/AssetsMarket";
import NetMarket from "../components/markets/NetMarket";
import Overview from "../components/markets/Overview";
import TabMarket from "../components/markets/TabMarket";

import ModalBorrow from "../components/borrows/ModalBorrow";
import ModalWithdraw from "../components/withdraw/ModalWithdraw";
import ModalSupply from "../components/supply/ModalSupply";
import ModalRepay from "../components/repay/ModalRepay";

const MarketPage = () => {

  return (

    <section className="box-borrows mx-auto bg-cover bg-center" >

      <div className="lg:container mx-auto px-4 min-h-screen pt-16 pb-24">

        <Overview />

        <AccountAssets />

        <div className="flex flex-row mt-12">

          <NetMarket />

          <TabMarket />

        </div>

        <AssetsMarket />

      </div>

      <ModalBorrow />
      <ModalSupply />
      <ModalWithdraw />
      <ModalRepay />

    </section>

  );
};

export default MarketPage;
