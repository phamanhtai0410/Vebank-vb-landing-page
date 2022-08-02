


import BtnOpenBorrow from './BtnOpenBorrow';
import BtnOpenWithdraw from './BtnOpenWithdraw';
import BtnOpenSupply from './BtnOpenSupply';
import BtnOpenRepay from './BtnOpenRepay';

const AssetsRowAction = ({ openRowAssets, item }) => {

    if (openRowAssets.indexOf(item.assetsAddress) === -1) {
        return <></>;
    }

    return (

        <div className='bg-[#293A55] rounded-b-lg p-6 mt-2 flex flex-row justify-between space-x-6 fade-in-box' >

            <div className='bg-[#182233] p-4 rounded-lg font-montserrat'>
                <h4 className='text-[#778CC0] text-sm'>Supply balance</h4>
                <div className='flex flex-row mt-3'>
                    <input
                        className="bg-transparent rounded focus:outline-none placeholder-slate-300 appearance-none text-base w-full mr-4"
                        type="text"
                        placeholder={"0"}
                        disabled={true}
                    />
                    <BtnOpenWithdraw item={item} />
                </div>
            </div>

            <div className='bg-[#182233] p-4 rounded-lg font-montserrat'>
                <h4 className='text-[#778CC0] text-sm'>Balance</h4>
                <div className='flex flex-row mt-3'>
                    <input
                        className="bg-transparent rounded focus:outline-none placeholder-slate-300 appearance-none text-base w-full mr-4"
                        type="text"
                        placeholder={"0"}
                        disabled={true}
                    />
                    <BtnOpenSupply item={item} />
                </div>
            </div>

            <div className='bg-[#182233] p-4 rounded-lg font-montserrat'>
                <h4 className='text-[#778CC0] text-sm'>Borrow balance</h4>
                <div className='flex flex-row mt-3'>
                    <input
                        className="bg-transparent rounded focus:outline-none placeholder-slate-300 appearance-none text-base w-full mr-4"
                        type="text"
                        placeholder={"0"}
                        disabled={true}
                    />
                    <BtnOpenRepay item={item} />
                </div>
            </div>

            <div className='bg-[#182233] p-4 rounded-lg'>
                <h4 className='text-[#778CC0] text-sm font-montserrat'>Available</h4>
                <div className='flex flex-row mt-3'>
                    <input
                        className="bg-transparent rounded focus:outline-none placeholder-slate-300 appearance-none text-base w-full mr-4"
                        type="text"
                        placeholder={"0"}
                        disabled={true}
                    />
                    <BtnOpenBorrow item={item} />
                </div>
            </div>

        </div>

    )


}

export default AssetsRowAction;