import { Link } from "react-router-dom";
import { FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import CustomButton from "../component/CustomButton"
import path from "../utils/path";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { ChefHatIcon, LogOutIcon } from 'lucide-react';
import logOutResponse from "../api/auth/logOut";

const Header = () => {
    const currentUser = useAuthStore((state)=>state.currentUser);
    const isLoggedIn = Boolean(currentUser);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    const handleLogOut = async ()=>{
        const result = await logOutResponse();
        if(result?.status === 200){
            useAuthStore.getState().clearCurrentUser();
            navigate(path.LOGIN);
        }else{
            alert("Đăng xuất thất bại!");
        }
    }
    return (
        <>
            {/* Main Header */}
            <div className="bg-orange-400 w-full min-h-16 flex items-center relative z-50 px-3 sm:px-6 lg:px-12">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center space-x-2">
                    <div className="flex items-center justify-center rounded-3xl bg-blue-400 border-2 border-white w-10 h-10">
                        <ChefHatIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white text-xl sm:text-2xl lg:text-3xl cursor-pointer hover:text-orange-100 transition-colors"
                        style={{ fontFamily: "Dancing Script" }}
                        translate="no"
                        onClick={() => navigate('/')}>
                        Healthy Wealthy
                    </p>
                </div>

                {/* Desktop Navigation */}
                <div className="ml-auto hidden md:flex items-center space-x-3 lg:space-x-4">
                    {isLoggedIn ? (
                        <>
                            <div
                                className="flex justify-center items-center rounded-full hover:text-white hover:bg-red-600 
                                     w-10 h-10 lg:w-12 lg:h-12 text-white bg-gray-500 cursor-pointer 
                                     transition-all duration-200 hover:scale-105"
                                onClick={() => {
                                    navigate(path.PERSONAL);
                                }}
                            >
                                <FaUser className="w-4 h-4 lg:w-5 lg:h-5" />
                            </div>
                            <div className="w-10 h-10 rounded-3xl flex items-center justify-center border-3 border-white bg-orange-300
                            hover:bg-gray-700" onClick={handleLogOut}>
                                <LogOutIcon className="w-6 h-6 text-white" />
                            </div>
                        </>
                    ) : (
                        <>
                            <CustomButton
                                classname="min-w-20 sm:min-w-24 lg:min-w-28 h-9 lg:h-10 text-orange-600 bg-white hover:text-white hover:bg-orange-500 transition-all duration-200 rounded-lg font-medium text-sm lg:text-base"
                                content={registerContentButton()}
                            />
                            <CustomButton
                                classname="min-w-20 sm:min-w-24 lg:min-w-28 h-9 lg:h-10 bg-white/80 text-orange-700 hover:text-white hover:bg-orange-500 transition-all duration-200 rounded-lg font-medium text-sm lg:text-base"
                                content={loginContentButton()}
                            />
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="ml-auto md:hidden">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-white p-2 hover:bg-orange-500 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <FaTimes className="w-5 h-5" />
                        ) : (
                            <FaBars className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={toggleMobileMenu}>
                </div>
            )}

            {/* Mobile Menu Dropdown */}
            <div className={`fixed top-16 right-0 left-0 bg-orange-400 z-50 md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-4 pointer-events-none'
                }`}>
                <div className="px-4 py-6 space-y-4">
                    {isLoggedIn ? (
                        <div className="flex flex-col items-center space-y-3">
                            <div
                                className="flex justify-center items-center rounded-full hover:text-white hover:bg-sky-600 
                                         w-12 h-12 text-orange-800 bg-gray-100 cursor-pointer 
                                         transition-all duration-200"
                                onClick={() => {
                                    navigate(path.PERSONAL);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <FaUser className="w-5 h-5" />
                            </div>
                            <span className="text-white font-medium">Tài khoản của tôi</span>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-3">
                            <div onClick={() => setIsMobileMenuOpen(false)}>
                                <CustomButton
                                    classname="w-full h-12 text-orange-600 bg-white hover:text-white hover:bg-orange-500 transition-all duration-200 rounded-lg font-medium"
                                    content={registerContentButton()}
                                />
                            </div>
                            <div onClick={() => setIsMobileMenuOpen(false)}>
                                <CustomButton
                                    classname="w-full h-12 bg-white/80 text-orange-700 hover:text-white hover:bg-orange-500 transition-all duration-200 rounded-lg font-medium"
                                    content={loginContentButton()}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

const registerContentButton = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <Link to={path.REGISTER} className="text-center font-quicksand font-bold">
                Đăng ký
            </Link>
        </div>
    )
}

const loginContentButton = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <Link to={path.LOGIN} className="text-center font-quicksand font-bold">
                Đăng nhập
            </Link>
        </div>
    )
}

export default Header;