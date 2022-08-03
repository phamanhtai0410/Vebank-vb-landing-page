import React,{useEffect} from 'react';
import { Outlet } from 'react-router-dom';

import Header from '../components/partials/Header';
import Footer from '../components/partials/Footer';
import ModalRemoveLiquidity from '../components/liquidity/RemoveLiquidity/ModalRemoveLiquidity';


const MainLayout = () => {

    // const [spinner, setSpinner] = useState(true);
    // const navigate = useNavigate();

    useEffect(() => {
        console.log(`${process.env.REACT_APP_NAME} ${process.env.REACT_APP_VERSION}`)
    }, []);  

    // if (spinner) {
    //     return "..loading";
    // }

    return (
        <main className="bg-layout-vb text-white leading-loose">
            <Header />
            <Outlet />
            <ModalRemoveLiquidity />
        </main>
    )
}


export default MainLayout;