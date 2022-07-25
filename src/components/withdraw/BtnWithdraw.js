

import { useState } from 'react';
import { useDispatch } from "react-redux";
import { Beforeunload } from 'react-beforeunload';

import * as actions from '../../actions';

const BtnWithdraw = ({ dataToken, amount, pending }) => {

    const [isPending, setIsPending] = useState(false);

    const dispatch = useDispatch();

    const handlerSubmit = async () => {

        if (isPending === false && dataToken && amount) {

            setIsPending(true);
            console.log("BtnWithdraw dataToken",dataToken,amount);

            if (dataToken.assetsChain === "VET") {
                await dispatch(actions.withdrawETHMarket(dataToken, amount)).then(() => {
                    setIsPending(false);
                }).catch((e) => {
                    setIsPending(false);
                });
            } else {

                await dispatch(actions.withdrawMarket(dataToken, amount)).then(() => {
                    setIsPending(false);
                }).catch((e) => {
                    setIsPending(false);
                });

            }


        }
    }

    return (<>

        {/* {isPending ? <Beforeunload onBeforeunload={(event) => event.preventDefault()} /> : ""} */}
        <button onClick={e => { handlerSubmit(e) }} disabled={pending} className={`btn-modal-veb fade-in-box ${pending ? "bg-btn-veb-disabled hidden" : "bg-btn-veb"}`} type="submit">
            {isPending ? "Pending..." : "Withdraw"}
        </button>

    </>)
}

export default BtnWithdraw;