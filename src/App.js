
import React, { Suspense } from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from "react-helmet-async";

import { history } from './_helpers';

import MainLayout from './layouts/MainLayout';

import Page404 from './pages/Page404';

const HomePage = React.lazy(() => import('./pages/HomePage'));
const MarketPage = React.lazy(() => import('./pages/MarketPage'));
const PoolPage = React.lazy(() => import('./pages/PoolPage'));
const FarmPage = React.lazy(() => import('./pages/FarmPage'));
// const TradePage = React.lazy(() => import('./pages/TradePage'));
const StakingPage = React.lazy(() => import('./pages/StakingPage'));
const LaunchPadPage = React.lazy(() => import('./pages/LaunchPadPage'));
const ComingSoon = React.lazy(() => import('./components/partials/ComingSoon'));
const SwapPage = React.lazy(() => import('./pages/SwapPage'));
const LiquidityPage = React.lazy(() => import('./pages/LiquidityPage'));
const AddLiquidityPage = React.lazy(() => import('./pages/AddLiquidityPage'));
const RemoveLiquidityPage = React.lazy(() => import('./pages/RemoveLiquidityPage'));

function App() {

  return (
    <Suspense fallback={<div className="bg-[#0b1329] min-h-screen min-w-full"/>}>
      {/* <HelmetProvider>
      <Helmet>
        <meta property="og:title" content="VeChain - Multi-purpose DeFi platform"></meta>
        <meta property="og:description" content="VeBank Protocol One-stop DeFi Platform on vechain" />
        <meta property="og:image" content="https://beta.vebank.io/image_vebank.jpg"></meta>
        <link rel="canonical" href="https://www.vebank.io/" />
        </Helmet>
      </HelmetProvider> */}
      <Routes history={history} >

        <Route path="/" element={<MainLayout />} >

          <Route path="/home" element={<Navigate to="/" />} />

          <Route path="/" element={<HomePage />} />

          <Route path="/markets" element={<ComingSoon />} />

          <Route path="/pool" element={<ComingSoon />} />

          <Route path="/farm" element={<ComingSoon/>} />

          {/* <Route path="/trade" element={<TradePage />} /> */}

          <Route path="/stake" element={<ComingSoon />} />

          <Route path="/launchpad" element={<ComingSoon />} />

          <Route path="/swap" element={<ComingSoon />} />

          <Route path="/trade" element={<Navigate to="/swap" />} />

          <Route path="/liquidity" >
            <Route path="add/:addressPool" element={<ComingSoon  />} />
            <Route path="add" element={<ComingSoon  />} />
            <Route path="remove/:addressPool" element={<ComingSoon  />} />
            <Route path="*" index element={<ComingSoon  />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />

        </Route>

        <Route path="*" element={<Page404 />} />

      </Routes>

    </Suspense>



  );
}

export default App;
