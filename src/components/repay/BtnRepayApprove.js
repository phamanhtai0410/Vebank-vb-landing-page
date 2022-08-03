import { useState } from 'react';
import { useDispatch } from "react-redux";
import { Beforeunload } from 'react-beforeunload';

import * as actions from '../../actions';

const BtnRepayApprove = ({ dataToken, pending }) => {

    const [isPending, setIsPending] = useState(false);
    const dispatch = useDispatch();

    const approveHandler = async () => {
        if (!isPending) {
            setIsPending(true);
            await dispatch(actions.approveRepay(dataToken)).then(() => {
                setIsPending(false);
            }).catch((e) => {
                setIsPending(false);
            });
        }
    }


    return (
        <>
            {isPending ? <Beforeunload onBeforeunload={(event) => event.preventDefault()} /> : ""}
            <button onClick={e => { approveHandler(e) }} className={`btn-modal-veb ${pending ? "bg-btn-veb-disabled hidden" : "bg-btn-veb"}`} type="submit">{isPending ? "Approving..." : `Approve ${dataToken.assetsChain}`} </button>
        </>

    )
}

export default BtnRepayApprove;