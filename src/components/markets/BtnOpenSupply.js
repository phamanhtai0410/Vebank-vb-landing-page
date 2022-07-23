import { useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Beforeunload } from 'react-beforeunload';

import * as actions from '../../actions';

import { marketplaceConstants } from '../../constants';

const BtnOpenSupply = ({ item }) => {

    const [disabledRule, setDisabledRule] = useState(false);

    const dispatch = useDispatch();

    const handlerOpenModal = async () => {
        if (item && item.assetsAddress) {
            dispatch(actions.loadModalSupply(item))
        }
    }

    return (<>
        <button onClick={e => { handlerOpenModal(e) }} className="btn-veb h-10" type="submit">Supply </button>
    </>)
}

export default BtnOpenSupply;