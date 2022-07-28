import { ethers } from "@vechain/ethers";
import Connex from "@vechain/connex";

// import { Certificate, blake2b256, secp256k1 } from "thor-devkit";

import { web3Constants, poolConstants } from "../constants";
import getWeb3 from "../utils/getWeb3";

import * as actions from "./";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { selectAssetByAddress } from "../reducers/assetsMarket.reducer";
import {
  addressWalletCompact,
  compareString,
  randomKeyUUID,
} from "../utils/lib";
import assetAbi from "../_contracts/asset-abi";
import PartialConstants from "../constants/partial.constants";

// VET : dung de staking duy tri he thong
// VTH0 : dung de tra vi chay smart Contract

const TOKEN_VTHO = process.env.REACT_APP_TOKEN_VTHO;
const TOKEN_VET = process.env.REACT_APP_TOKEN_WVET;
const TOKEN_VEBANK = process.env.REACT_APP_TOKEN_VEBANK;
const TOKEN_VEUSD = process.env.REACT_APP_TOKEN_VEUSD;

export const web3Connect = (isLogin) => async (dispatch) => {

  const web3 = await getWeb3();

  let _acc = localStorage.getItem("_acc");
  let _sign = localStorage.getItem("_sign");

  const connex = new Connex({
    node: process.env.REACT_APP_CHAIN_NETWORK,
    network: process.env.REACT_APP_NAME_NETWORK,
  });

  if (_acc && _sign) {
    // console.log("_acc && _sign");
    dispatch({
      type: web3Constants.WEB3_CONNECT,
      web3,
      connex,
      signer: JSON.parse(_sign),
      account: _acc,
    });

    return _acc;
  } else if (!_acc && isLogin) {
    const key = randomKeyUUID();

    await connex.vendor
    .sign("cert", {
      purpose: "identification",
      payload: {
        type: "text",
        content: "Please sign the certificate to continue purchase",
      },
    })
    .accepted(() => {
      dispatch(
        actions.alertActions.loading(
          {
            title: "Connecting",
            description: `Wallet sync2 waiting...`,
          },
          key
        )
      );
      return _acc;
    })
    .request()
    .then((signer) => {
      _acc = signer.annex.signer;
      _sign = JSON.stringify(signer);

      localStorage.setItem("_acc", _acc);
      localStorage.setItem("_sign", _sign);

      dispatch({
        type: web3Constants.WEB3_CONNECT,
        connex,
        web3,
        signer,
        account: _acc,
      });

      dispatch(
        actions.alertActions.update(
          {
            status: "success",
            title: "Connected",
            description: `Wallet: ${addressWalletCompact(_acc)}`,
          },
          key
        )
      );

      return _acc;
    })
    .catch((e) => {
      dispatch(
        actions.alertActions.update(
          {
            title: "Connect",
            status: "warning",
            description: e.message,
          },
          key
        )
      );
    });

  } else {
    dispatch({
      type: web3Constants.WEB3_CONNECT,
      web3,
      connex,
    });

    return _acc;
  }
};

export const web3Disconnect = () => async (dispatch, getState) => {
  const state = getState();
  const { account } = state.web3;

  localStorage.removeItem("_acc");
  localStorage.removeItem("_sign");

  dispatch({
    type: web3Constants.WEB3_DISCONNECT,
    connex: null,
    web3: null,
    account: null,
  });

  dispatch(
    actions.alertActions.success({
      title: "Disconected",
      description: `Wallet: ${addressWalletCompact(account)}`,
    })
  );

  // setTimeout(() => {
  //     dispatch({ type: destroyConstants.DESTROY_SESSION });
  // }, 1000);
};

export const instantiateVetContracts = () => async (dispatch, getState) => {
  const state = getState();

  const { connex, web3, account } = state.web3;

  if (account) {
    const accInfo = await connex.thor.account(account).get();

    let balanceVET = 0;
    let balanceVTHO = 0;

    if (accInfo && accInfo.balance && accInfo.energy) {
      balanceVET = ethers.utils.formatEther(accInfo.balance);
      balanceVET = Math.round(balanceVET * 100) / 100;

      balanceVTHO = ethers.utils.formatEther(accInfo.energy);
      balanceVTHO = Math.round(balanceVTHO * 100) / 100;
    }

    const contractVET = new web3.eth.Contract(assetAbi[TOKEN_VET], TOKEN_VET);
    if (contractVET) {
      // console.log(
      //   "🐶🐶  ~ instantiateVetContracts ~ contractVET.events",
      //   contractVET.events
      // );

      // contractVET.events
      //   .Approval()
      //   .on("data", async (data) => {
      //     // console.log("🐶🐶  ~ contractVET.events.Approval ~ data", data);
      //     // dispatch(instantiateVetContracts());

      //     if (compareString(data.returnValues?.owner, account)) {
      //       const accInfo = await connex.thor.account(account).get();

      //       let balanceVET = 0;
      //       let balanceVTHO = 0;
      //       const approveAmount = Number(
      //         ethers.utils.formatEther(
      //           data.returnValues?.value,
      //           PartialConstants.DEFAULT_ASSET_DECIMAL
      //         )
      //       );

      //       if (accInfo && accInfo.balance && accInfo.energy) {
      //         balanceVET = ethers.utils.formatEther(accInfo.balance);
      //         balanceVET = Math.round(balanceVET * 100) / 100;

      //         balanceVTHO = ethers.utils.formatEther(accInfo.energy);
      //         balanceVTHO = Math.round(balanceVTHO * 100) / 100;

      //         dispatch({
      //           type: web3Constants.INIT_CONTRACT_VET,
      //           accInfo,
      //           balanceVET,
      //           balanceVTHO,
      //         });
      //       }

      //       dispatch({
      //         type: poolConstants.APPROVE_TOKEN,
      //         payload: {
      //           assetAddress: TOKEN_VET,
      //           approveAmount,
      //         },
      //       });
      //     }
      //   })
      //   .on("error", async (err) => {
      //     console.log("🐶🐶  ~ contractVET.events.Approval ~ err", err);
      //   });

      contractVET.events.Withdrawal().removeAllListeners?.();
      contractVET.events
        .Withdrawal()
        .on("data", async (data) => {
          // console.log("🐶🐶  ~ contractVET.events.Withdrawal ~ data", data);
          const accInfo = await connex.thor.account(account).get();

          let balanceVET = 0;
          let balanceVTHO = 0;

          if (accInfo && accInfo.balance && accInfo.energy) {
            balanceVET = ethers.utils.formatEther(accInfo.balance);
            balanceVET = Math.round(balanceVET * 100) / 100;

            balanceVTHO = ethers.utils.formatEther(accInfo.energy);
            balanceVTHO = Math.round(balanceVTHO * 100) / 100;

            dispatch({
              type: web3Constants.INIT_CONTRACT_VET,
              accInfo,
              balanceVET,
              balanceVTHO,
            });
          }
        })
        .on("error", async (err) => {
          console.log("🐶🐶  ~ contractVET.events.Withdrawal ~ err", err);
        });

      contractVET.events.Transfer({}).removeAllListeners?.();
      contractVET.events
        .Transfer({})
        .on("data", async function (event) {
          // console.log("onTransferEvent - VET", event);
          // Do something here
          // let balance = Number(selectBalanceById(getState(), TOKEN_VET));
          // const { wad: value } = event?.returnValues;
          const { txOrigin } = event?.meta;
          // const formattedValue = Number(ethers.utils.formatUnits(value, 18));
          if (compareString(txOrigin, account)) {
            // console.log("User send amount away");
            // balance -= formattedValue;
            // dispatch(instantiateVetContracts());
            const accInfo = await connex.thor.account(account).get();

            let balanceVET = 0;
            let balanceVTHO = 0;

            if (accInfo && accInfo.balance && accInfo.energy) {
              balanceVET = ethers.utils.formatEther(accInfo.balance);
              balanceVET = Math.round(balanceVET * 100) / 100;

              balanceVTHO = ethers.utils.formatEther(accInfo.energy);
              balanceVTHO = Math.round(balanceVTHO * 100) / 100;

              dispatch({
                type: web3Constants.INIT_CONTRACT_VET,
                accInfo,
                balanceVET,
                balanceVTHO,
              });
            }
          }
          // balance = Math.round(balance * 100) / 100;
          // dispatch({
          //   type: web3Constants.ON_VET_BALANCE_CHANGED,
          //   payload: balance,
          // });
        })
        .on("changed", (changed) =>
          // When event is attached or removed from the chain
          console.log("🐶🐶  ~ instantiateVBContracts ~ changed", changed)
        )
        .on("error", console.error);
    }

    const contractVTHO = new web3.eth.Contract(
      assetAbi[TOKEN_VTHO],
      TOKEN_VTHO
    );
    if (contractVTHO) {
 
      // contractVTHO.events.Approval?.().removeAllListeners?.();
      // contractVTHO.events
      //   .Approval?.()
      //   .on("data", async (data) => {
      //     // console.log("🐶🐶  ~ contractVTHO.events.Approval ~ data", data);
      //     // dispatch(instantiateVetContracts());
      //     if (compareString(data.returnValues?.owner, account)) {
      //       const accInfo = await connex.thor.account(account).get();

      //       let balanceVET = 0;
      //       let balanceVTHO = 0;
      //       const approveAmount = Number(
      //         ethers.utils.formatEther(
      //           data.returnValues?.value,
      //           PartialConstants.DEFAULT_ASSET_DECIMAL
      //         )
      //       );

      //       if (accInfo && accInfo.balance && accInfo.energy) {
      //         balanceVET = ethers.utils.formatEther(accInfo.balance);
      //         balanceVET = Math.round(balanceVET * 100) / 100;

      //         balanceVTHO = ethers.utils.formatEther(accInfo.energy);
      //         balanceVTHO = Math.round(balanceVTHO * 100) / 100;

      //         dispatch({
      //           type: web3Constants.INIT_CONTRACT_VET,
      //           accInfo,
      //           balanceVET,
      //           balanceVTHO,
      //         });
      //       }

      //       dispatch({
      //         type: poolConstants.APPROVE_TOKEN,
      //         payload: {
      //           assetAddress: TOKEN_VTHO,
      //           approveAmount,
      //         },
      //       });
      //     }
      //   })
      //   .on("error", async (err) => {
      //     console.log("🐶🐶  ~ contractVTHO.events.Approval ~ err", err);
      //   });

      contractVTHO.events.Withdrawal?.().removeAllListeners?.();
      contractVTHO.events
        .Withdrawal?.()
        .on("data", async (data) => {
          console.log("🐶🐶  ~ contractVTHO.events.Withdrawal ~ data", data);
        })
        .on("error", async (err) => {
          console.log("🐶🐶  ~ contractVTHO.events.Withdrawal ~ err", err);
        });

      contractVTHO.events.Transfer?.().removeAllListeners?.();
      contractVTHO.events
        .Transfer({})
        .on("data", async function (event) {
          // console.log("onTransferEvent", event);
          // Do something here
          // let balance = Number(selectBalanceById(getState(), TOKEN_VTHO));
          // const { wad: value } = event?.returnValues;
          const { txOrigin } = event?.meta;
          // const formattedValue = Number(ethers.utils.formatUnits(value, 18));
          if (compareString(txOrigin, account)) {
            // console.log("User send amount away");
            // balance -= formattedValue;
            // dispatch(instantiateVetContracts());
            const accInfo = await connex.thor.account(account).get();

            let balanceVET = 0;
            let balanceVTHO = 0;

            if (accInfo && accInfo.balance && accInfo.energy) {
              balanceVET = ethers.utils.formatEther(accInfo.balance);
              balanceVET = Math.round(balanceVET * 100) / 100;

              balanceVTHO = ethers.utils.formatEther(accInfo.energy);
              balanceVTHO = Math.round(balanceVTHO * 100) / 100;

              dispatch({
                type: web3Constants.INIT_CONTRACT_VET,
                accInfo,
                balanceVET,
                balanceVTHO,
              });
            }
          }
          // balance = Math.round(balance * 100) / 100;
          // dispatch({
          //   type: web3Constants.ON_VTHO_BALANCE_CHANGED,
          //   payload: balance,
          // });
        })
        .on("changed", (changed) =>
          // When event is attached or removed from the chain
          console.log("🐶🐶  ~ instantiateVBContracts ~ changed", changed)
        )
        .on("error", console.error);
    }

    dispatch({
      type: web3Constants.INIT_CONTRACT_VET,
      accInfo,
      balanceVET,
      balanceVTHO,
    });

    return accInfo;
  }

  dispatch({
    type: web3Constants.INIT_CONTRACT_VET,
    balanceVET: 0,
    balanceVTHO: 0,
  });
};

export const instantiateVBContracts = () => async (dispatch, getState) => {
  const state = getState();

  const { web3, account } = state.web3;

  if (web3 && account) {
    let contractVB = new web3.eth.Contract(
      assetAbi[TOKEN_VEBANK],
      TOKEN_VEBANK
    );

    // let subscription = web3.eth.subscribe("logs", {}, (err, event) => {
    //   if (!err) console.log(event);
    // });

    // subscription.on("data", (event) => console.log("event", event));
    // subscription.on("changed", (changed) => console.log("changed", changed));

    let balance = 0;

    if (contractVB && account) {
      const balanceBigN = await contractVB.methods.balanceOf(account).call();
      balance = ethers.utils.formatEther(balanceBigN);
      balance = Math.round(balance * 100) / 100;

      // contractVB.events.Approval?.().removeAllListeners?.();
      // contractVB.events
      //   .Approval?.()
      //   .on("data", async (data) => {
      //     console.log("🐶🐶  ~ VB approval event ~ data", data);

      //     if (data.returnValues?.owner?.equals?.(account)) {
       
      //       const approveAmount = Number(
      //         ethers.utils.formatEther(
      //           data.returnValues?.value,
      //           PartialConstants.DEFAULT_ASSET_DECIMAL
      //         )
      //       );

      //       dispatch({
      //         type: poolConstants.APPROVE_TOKEN,
      //         payload: {
      //           assetAddress: TOKEN_VEBANK,
      //           approveAmount,
      //         },
      //       });
            
      //     }
      //   })
      //   .on("error", async (err) => {
      //     console.log("🐶🐶  ~ contractVB.events.Approval ~ err", err);
      //   });

      contractVB.events.Withdrawal?.().removeAllListeners?.();
      contractVB.events
        .Withdrawal?.()
        .on("data", async (data) => {
          console.log("🐶🐶  ~ contractVB.events.Withdrawal ~ data", data);
        })
        .on("error", async (err) => {
          console.log("🐶🐶  ~ contractVB.events.Withdrawal ~ err", err);
        });

      contractVB.events.Transfer?.().removeAllListeners?.();
      contractVB.events
        .Transfer({})
        .on("data", async function (event) {
          console.log("onTransferEvent - VB", event);
          // Do something here
          // let balance = Number(
          //   selectBalanceById(getState(), TOKEN_VEBANK) || 0
          // );
          // const { value, from, to } = event?.returnValues;
          const { txOrigin } = event?.meta;
          // const formattedValue = Number(ethers.utils.formatUnits(value, 18));
          if (txOrigin.equals(account)) {
            // console.log("User send amount away");
            // if (account.toLowerCase() === to) {
            //   balance += formattedValue;
            // } else if (from.toLowerCase() === account) {
            //   balance -= formattedValue;
            // }
            // dispatch(instantiateVBContracts());
            // balance = Math.round(balance * 100) / 100;
            contractVB.methods
              .balanceOf(account)
              .call()
              .then((balanceBigNumber) => {
                // console.log("🐶🐶  ~ balance VB (raw)", balanceBigNumber);
                let balance = ethers.utils.formatUnits(
                  balanceBigNumber,
                  PartialConstants.DEFAULT_ASSET_DECIMAL
                );
                // console.log("🐶🐶  ~ VB formatted ~ balance", balance);
                balance = Math.round(balance * 100) / 100;
                dispatch({
                  type: web3Constants.INIT_CONTRACT_VB,
                  contractVB,
                  balance,
                });
              });
          }
          // dispatch({
          //   type: web3Constants.INIT_CONTRACT_VB,
          //   contractVB,
          //   balance,
          // });
        })
        .on("changed", (changed) =>
          // When event is attached or removed from the chain
          console.log("🐶🐶  ~ instantiateVBContracts ~ changed", changed)
        )
        .on("error", console.error);
    }

    dispatch({
      type: web3Constants.INIT_CONTRACT_VB,
      contractVB,
      balance,
    });

    return balance;
  }

  dispatch({
    type: web3Constants.INIT_CONTRACT_VB,
    contractVB: null,
    balance: 0,
  });
};

export const instantiateVEUSDContracts = createAsyncThunk(
  "accountBalance/fetchVEUSD",
  async (_, { getState, dispatch }) => {
    const currentState = getState();
    const { web3, account } = currentState.web3;

    if (web3 && account) {
      let contractVEUSD = new web3.eth.Contract(
        assetAbi[TOKEN_VEUSD],
        TOKEN_VEUSD
      );

      let balance = 0;

      if (contractVEUSD && account) {
        const balanceBigN = await contractVEUSD.methods
          .balanceOf(account)
          .call();
        balance = ethers.utils.formatUnits(
          balanceBigN,
          PartialConstants.VEUSD_DECIMAL
        );
        balance = Math.round(balance * 100) / 100;

        // contractVEUSD.events
        //   .Approval?.()
        //   .on("data", async (data) => {
        //     // console.log("🐶🐶  ~ contractVEUSD.events.Approval ~ data", data);
        //     if (account.equals?.(data.returnValues?.owner)) {
        //       contractVEUSD.methods
        //         .balanceOf(account)
        //         .call()
        //         .then((balanceBigNumber) => {
        //           // console.log("🐶🐶  ~ balance VeUSD (raw)", balanceBigNumber);
        //           let balance = ethers.utils.formatUnits(
        //             balanceBigNumber,
        //             PartialConstants.VEUSD_DECIMAL
        //           );
        //           // console.log("🐶🐶  ~ VEUSD formatted ~ balance", balance);
        //           balance = Math.round(balance * 100) / 100;
        //           dispatch(
        //             instantiateVEUSDContracts.fulfilled({
        //               balance,
        //               contractVEUSD,
        //             })
        //           );
        //         });

        //       const approveAmount = Number(
        //         ethers.utils.formatEther(
        //           data.returnValues?.value,
        //           PartialConstants.VEUSD_DECIMAL
        //         )
        //       );
        //       dispatch({
        //         type: poolConstants.APPROVE_TOKEN,
        //         payload: {
        //           assetAddress: TOKEN_VEUSD,
        //           approveAmount,
        //         },
        //       });
        //     }
        //   })
        //   .on("error", async (err) => {
        //     console.log("🐶🐶  ~ contractVEUSD.events.Approval ~ err", err);
        //   });

        contractVEUSD.events
          .Transfer()
          .on("data", async function (event) {
            // console.log("onTransferEvent - VeUSD", event);
            // Do something here
            // let balance = Number(selectBalanceById(getState(), TOKEN_VEUSD));
            // const { value, to } = event?.returnValues;
            const { txOrigin } = event?.meta;
            // const formattedValue = Number(ethers.utils.formatUnits(value, 6));
            if (account.equals(txOrigin)) {
              // console.log("User send amount away");
              // if (account.toLowerCase() === to) {
              //   balance += formattedValue;
              // } else balance -= formattedValue;
              // balance = Math.round(balance * 100) / 100;
              // dispatch(instantiateVEUSDContracts());
              contractVEUSD.methods
                .balanceOf(account)
                .call()
                .then((balanceBigNumber) => {
                  // console.log("🐶🐶  ~ balance VeUSD (raw)", balanceBigNumber);
                  let balance = ethers.utils.formatUnits(
                    balanceBigNumber,
                    PartialConstants.VEUSD_DECIMAL
                  );
                  // console.log("🐶🐶  ~ VEUSD formatted ~ balance", balance);
                  balance = Math.round(balance * 100) / 100;
                  dispatch(
                    instantiateVEUSDContracts.fulfilled({
                      balance,
                      contractVEUSD,
                    })
                  );
                });
            }
            // console.log("🐶🐶  ~ VEUSD balance", balance);
            // dispatch({
            //   type: instantiateVEUSDContracts.fulfilled.type,
            //   payload: {
            //     contractVEUSD,
            //     balance,
            //   },
            // });
          })
          .on("changed", (changed) =>
            // When event is attached or removed from the chain
            console.log("🐶🐶  ~ instantiateVBContracts ~ changed", changed)
          )
          .on("error", console.error);
      }
      return { balance, contractVEUSD };
    }
  }
);
