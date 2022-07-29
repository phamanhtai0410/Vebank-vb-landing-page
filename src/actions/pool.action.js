import { ethers, FixedNumber } from "ethers";
import queryString from 'query-string';

import { poolConstants } from "../constants";

import ERC20ABI_PAIR from "../_contracts/pair.json";
import ERC20ABI_FACTORY from "../_contracts/factory.json";
import { compareString, getDecimalForAsset } from "../utils/lib";
import PartialConstants from "../constants/partial.constants";
import * as actions from "./index";

import { formatUriSecure } from '../utils/lib';

const ADDRESS_FACTORY = process.env.REACT_APP_ADDRESS_FACTORY;
const pageSize = 10;

// ------------------------ POOL ------------------------ //

export const getPoolAssets = () => async (dispatch, getState) => {
  const state = getState();

  const { web3, account } = state.web3;
  const { listAsset, data } = state.assetsPoolReducer;

  let dataList = [];
  let dataAssets = data.length === 0 ? listAsset : data;

  if (web3 && ADDRESS_FACTORY && dataAssets.length > 0) {

    let contractFactory = new web3.eth.Contract(
      ERC20ABI_FACTORY,
      ADDRESS_FACTORY
    );

    for await (const item of dataAssets) {

      const {
        addressTokenA,
        addressTokenB,
        isSubscribeListener,
        pairTransferEvent,
        pairApproveEvent,
      } = item;

      const assetsPoolAddress = await contractFactory.methods
        .getPair(addressTokenA, addressTokenB)
        .call();
      const emptyAddress = /^0x0+$/.test(assetsPoolAddress); // true chưa có

      if (!emptyAddress && assetsPoolAddress) {
        const contractPair = new web3.eth.Contract(
          ERC20ABI_PAIR,
          assetsPoolAddress
        );

        let _isSubscribed = isSubscribeListener ?? false;
        let _pairApproveEvent = pairApproveEvent,
          _pairTransferEvent = pairTransferEvent;

        if (contractPair && !_isSubscribed) {
          _pairApproveEvent = contractPair.events.Approval?.();
          _pairApproveEvent.on("data", async (data) => {
            console.log('🐶🐶  ~ _pairApproveEvent.on ~ data', data)
            // When this pair have a Approve event from anyone, it will be process in this closure
            if (compareString(data.returnValues?.owner, account)) {
              // If this event is triggered by the user
              const balanceBigN = await contractPair.methods
                .balanceOf(account)
                .call();
              let liquidityPool = await ethers.utils.formatUnits(
                balanceBigN,
                PartialConstants.DEFAULT_ASSET_DECIMAL
              );
              const approveAmount = Number(
                ethers.utils.formatEther(
                  data.returnValues?.value,
                  PartialConstants.DEFAULT_ASSET_DECIMAL
                )
              );
              // This dispatch is used to update user approval in removeLiquidity.reducer
              dispatch(liquidityPoolApproved(assetsPoolAddress, approveAmount));
              // This is used to update if user's liquidity pool has changed.
              dispatch(
                actions.updateLiquidityPool({
                  poolAddress: assetsPoolAddress,
                  balanceAccount: liquidityPool,
                })
              );
            }
          });

          _pairTransferEvent = contractPair.events.Transfer?.();
          _pairTransferEvent.on("data", async (data) => {
            // When this pair have a Transfer event from anyone, it will be process in this closure
            const { from, to, value } = data.returnValues;
            if (from.equals(account) || to.equals(account)) {
              // This Transfer event is caused by user. If it's from user,
              // the user is removing the pool, if it's to, user is adding the pool

              // This call may receive wrong amount of user tokens in pool because when this Transfer event is emitted,
              // the total supply of the pool may haven't been updated on Blockchain yet. So inside of this function,
              // we should check for it's current value stored in redux with the fetched one, and add the value
              // to get the latest value of the total LP.
              const { amountTokenA, amountTokenB, liquidityPool ,totalSupply } =
                await getUserTokenAmounts({
                  contractPair,
                  account,
                  addressTokenA,
                  addressTokenB,
                });

              // Push this update into userAssetPools.reducer to update data in pool page and liquidity page.
              dispatch(
                actions.updateUserAssets({
                  assetsPoolAddress,
                  liquidityPool,
                  liquidity: totalSupply,
                  amountTokenA,
                  amountTokenB,
                })
              );

              // This is attempt to display if the LP have moved into or out of user's wallet notification.
              // const isUserReceiving = to?.equals(account);
              // dispatch(
              //   actions.alertActions.success({
              //     title: isUserReceiving
              //       ? "Add liquidity Confirmed"
              //       : "Remove liquidity Transaction Sent",
              //     details: {
              //       txid: data.meta?.txID ?? "",
              //       message: "View on Chain",
              //      }
              //   })
              // );
            }
          });
          _isSubscribed = true;
        }

        //Lấy tổng liquidity
        let totalSupply = await contractPair.methods.totalSupply().call();
        if (totalSupply) {
          totalSupply = ethers.utils.formatUnits(
            totalSupply,
            PartialConstants.DEFAULT_ASSET_DECIMAL
          );
        }

        dataList.push({
          ...item,
          isSubscribeListener: _isSubscribed,
          liquidity: totalSupply,
          assetsPoolAddress,
          pairApproveEvent: _pairApproveEvent,
          pairTransferEvent: _pairTransferEvent,
        });

      }

    }

    dispatch({
      type: poolConstants.FETCH_POOL_ASSETS_SUCCESS,
      contractFactory,
      data: dataList,
    });

    dispatch(getPoolAssetsByAccount(dataList));

  } else {
    dispatch({
      type: poolConstants.FETCH_POOL_ASSETS_SUCCESS,
      data: [],
    });
  }

  return dataList;
};

function getPairVolumeAndFees(dataList){
  let fees = 0;
  let volumes = 0;
  dataList.map((item) => {

    // FixedNumber.from(fees)
    // .addUnsafe(FixedNumber.from(secondPerFirstTokenExchangeRate.toString()))
    // .toString(),

    //fees = FixedNumber.from(fees).addUnsafe(FixedNumber.from(item.fee_usd)).toString();

    //console.log(fees);

    fees= fees + Number(item.fee_usd);
    volumes= volumes +Number(item.volume_usd) ;

    // fees = FixedNumber.from(fees).addUnsafe( FixedNumber.from(item.fee_usd) );
    // volumes =  FixedNumber.from(volumes).addUnsafe( FixedNumber.from(item.volume_usd)  ); 

  })
  return{fees, volumes};
}

function getPoolAPR(fee,liquidity){
  return( ((fee/(24*3600))/liquidity)*365*24*3600)
}

export const fetchPairs = (query) => async (dispatch, getState) => {

  const state = getState();
  const { assetEntities } = state.assetsMarketReducer;

  let querySearch = {
    page: 1,
    page_size: pageSize,
  }

  if (query) {
    querySearch = { ...querySearch, ...query };
  }

  const linkQuery = queryString.stringify(querySearch);
  const url = `${process.env.REACT_APP_API_ENDPOINT}${formatUriSecure('/v1/pool/exchange')}&${linkQuery}`;

  try {

    const response = await fetch(url);
    const responseBody = await response.json();
  
    if(responseBody && responseBody.data){
  
      const { pairs, total } = responseBody.data;
  
      const dataList = pairs.map(e => {

        const { fees, volumes} = getPairVolumeAndFees(e.hour_data);

        return {
            ...e,
            iconOrigin: assetEntities[e.token0.address?.toLowerCase()]?.icon,
            iconAssets: assetEntities[e.token1.address?.toLowerCase()]?.icon,
            assetsPoolName: e.token0.symbol + ' - ' + e.token1.symbol,
            assetsChainA: e.token0.symbol,
            addressTokenA: e.token0.address,
            assetsChainB: e.token1.symbol,
            addressTokenB: e.token1.address,
            assetsPoolAddress: e.pair_address,
            assetsDecimals: e.token0.decimals,
            balanceAccount: 0,
            liquidity:0 ,
            liquidity_usd: e.reserve_usd,
            yourLiquidityUSD:0,
            volume: volumes,
            fees: fees,
            apr: getPoolAPR(fees,e.reserve_usd),
          }
      })

      dispatch({
          type: poolConstants.FETCH_POOL_ASSETS_SUCCESS,
          data: dataList || [],
          total
      });


     dispatch(getPoolAssetsByAccount(dataList));
  
    }
    
  } catch (error) {
    dispatch({
      type: poolConstants.FETCH_POOL_ASSETS_ERROR,
      message: error
    });
  }

}


export const getPoolAssetsByAccount =
  (dataAssetPool) => async (dispatch, getState) => {
    const state = getState();

    const { web3, account } = state.web3;

    let dataList = [];

    if (account && ADDRESS_FACTORY && dataAssetPool.length > 0) {
      for await (const item of dataAssetPool) {

        const { addressTokenA, addressTokenB, assetsPoolAddress } = item;

        if (item.assetsPoolAddress && account) {

          const contractPair = new web3.eth.Contract(
            ERC20ABI_PAIR,
            item.assetsPoolAddress
          );

          const { amountTokenA, amountTokenB, liquidityPool ,totalSupply} =  await getUserTokenAmounts({
              contractPair,
              account,
              addressTokenA,
              addressTokenB,
          });

          // console.log("liquidityPool",liquidityPool);
          const percentYour = liquidityPool/totalSupply;
          // console.log("percentYour",percentYour);

          let yourLiquidityUSD = percentYour > 0 ? item.liquidity_usd*percentYour :0;
          // console.log("yourLiquidityUSD",yourLiquidityUSD);

          dataList.push({
            ...item,
            balanceAccount: liquidityPool,
            liquidity:totalSupply,
            yourLiquidityUSD,
            amountTokenA,
            amountTokenB,
          });

          dispatch(
            actions.updateUserAssets({
              assetsPoolAddress,
              liquidityPool,
              amountTokenA,
              amountTokenB,
            })
          );

        }
      }

      dispatch({
        type: poolConstants.FETCH_POOL_ASSETS_SUCCESS,
        data: dataList,
      });
    }

    return dataList;
  };

/**
 * This function will mainly calculate the amount of user tokens in pool
 * @param contractPair the Contract of the pair which is need to be calculated
 * @param account the account address of the user.
 * @param addressTokenA the address of the first token of the pair.
 * @param addressTokenB the address of the second token of the pair.
 * @returns the value of all data that needs for liquidity operation
 */
export const getUserTokenAmounts = async ({
  contractPair,
  account,
  addressTokenA,
  addressTokenB
}) => {
  if (!contractPair) throw new Error("contractPair is missing");
  else if (!account) throw new Error("account is missing");
  else if (!addressTokenA) throw new Error("addressTokenA is missing");
  else if (!addressTokenB) throw new Error("addressTokenB is missing");

  let amountTokenA = 0;
  let amountTokenB = 0;
  let liquidityPool = 0;
  let totalSupply = 0;
  let reserve1 = 0;
  let reserve2 = 0;

  try {
    
    const balanceBigN = await contractPair.methods.balanceOf(account).call();
    // console.log('🐶🐶  ~ liquidityPool(raw)', balanceBigN)
    liquidityPool = await ethers.utils.formatUnits(
      balanceBigN,
      PartialConstants.DEFAULT_ASSET_DECIMAL
    );
    // console.log('🐶🐶  ~ liquidityPool(formatted)', liquidityPool)
    liquidityPool = FixedNumber.from(liquidityPool);
    totalSupply = await contractPair.methods.totalSupply().call();


    if (totalSupply) {
      totalSupply = ethers.utils.formatUnits(
        totalSupply,
        PartialConstants.DEFAULT_ASSET_DECIMAL
      );
      totalSupply = FixedNumber.from(totalSupply);
    }

    let { 0: _reserve0, 1: _reserve1 } = await contractPair.methods
      ?.getReserves()
      .call();

    // Check if token position is match or not, swap reserve position if it's not match.
    const firstTokenAddress = await contractPair.methods.token0().call();
    if (firstTokenAddress.toLocaleUpperCase() !== addressTokenA.toLocaleUpperCase()) {
      [_reserve0, _reserve1] = [_reserve1, _reserve0];
    }

    _reserve0 = ethers.utils.formatUnits(
      _reserve0,
      getDecimalForAsset(addressTokenA)
    );
    _reserve0 = FixedNumber.from(_reserve0);

    _reserve1 = ethers.utils.formatUnits(
      _reserve1,
      getDecimalForAsset(addressTokenB)
    );
    _reserve1 = FixedNumber.from(_reserve1);
  

    // Using calculation like this to avoid auto rounding numbers of JS
    if (liquidityPool >= 0 && totalSupply > 0) {
      amountTokenA = liquidityPool.mulUnsafe(_reserve0).divUnsafe(totalSupply);
      amountTokenB = liquidityPool.mulUnsafe(_reserve1).divUnsafe(totalSupply);
    }
    [reserve1, reserve2] = [_reserve0, _reserve1];
    amountTokenA = amountTokenA.toString();
    amountTokenB = amountTokenB.toString();
    liquidityPool = liquidityPool.toString();
    totalSupply = totalSupply.toString();
    reserve1 = reserve1.toString();
    reserve2 = reserve2.toString();
  } catch (error) {
    console.error(error);
  }
  return {
    amountTokenA,
    amountTokenB,
    liquidityPool,
    totalSupply,
    reserve1,
    reserve2,
  };
};

export const closeAddLiquidity = () => {
  return {
    type: poolConstants.MODAL_CLOSE_ADD_LIQUIDITY,
  };
};

export const closeRemoveLiquidity = () => {
  return {
    type: poolConstants.MODAL_CLOSE_REMOVE_LIQUIDITY,
  };
};

export const liquidityPoolApproved = (assetsPoolAddress, approveAmount) => ({
  type: poolConstants.APPROVE_LP_TOKEN,
  payload: { assetsPoolAddress, approveAmount },
});
