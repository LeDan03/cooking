import { Outlet } from "react-router-dom";
import Header from "../component/Header";
import SideBar from "../component/SideBar";
import Footer from "../component/Footer";
const MainLayout=()=>{
    return <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex w-full flex-1 min-h-screen">
            <Outlet/>
        </div>
        <Footer/>
    </div>
}
export default MainLayout;