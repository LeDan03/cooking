import { Outlet } from "react-router-dom";
import Header from "./component/Header";
import Footer from "./component/Footer";
import Sidebar from "./component/SideBar";
import MessageBox from "./component/MessageBox";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Sidebar />
      <MessageBox />
    </div>
  );
};

export default App;