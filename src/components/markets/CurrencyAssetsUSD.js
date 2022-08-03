
import { useEffect, useState } from 'react';
import { useSelector, shallowEqual } from "react-redux";

import { nFormatter } from '../../utils/lib';

const CurrencyAssetsUSD = ({ currencyBalance, assetsAddress }) => {

    const dataPrice = useSelector(state => state.assetsPriceReducer.data, shallowEqual);

    if (!currencyBalance || !assetsAddress) {
        return "-"
    }

    return (
        <>
            {dataPrice ? <>$ {nFormatter(currencyBalance * dataPrice[assetsAddress])}</> : nFormatter(currencyBalance, 2)}
        </>
    )
}

export default CurrencyAssetsUSD;