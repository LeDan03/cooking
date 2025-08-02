import { ChefHat, Menu, House, Mails } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useSidebarStore from "../store/useSidebarStore";
import useMessageBoxStore from "../store/useMessageBoxStore";
import path from "../utils/path";
import useCommonStore from "../store/useCommonStore";
import { useMemo } from "react";

const Header = () => {
    const currentUser = useAuthStore((state) => state.currentUser);
    const { setSidebarOpen } = useSidebarStore();
    const { setMessageBoxOpen } = useMessageBoxStore();
    const messages = useCommonStore((state) => state.messages);
    const unreadMessagesCount = useMemo(() => {
        return messages.filter(m => !m.read).length;
    },[messages])

    const navigate = useNavigate();

    return (
        <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-orange-200/50 shadow-sm">
            <div className="flex items-center justify-between p-3 sm:p-4">
                {/* Logo và tên web */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <ChefHat className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent truncate">
                            Healthy Wealthy
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Khám phá hương vị mới</p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* Khi chưa đăng nhập */}
                    {!currentUser && (
                        <>
                            <button
                                onClick={() => navigate(path.LOGIN)}
                                className="px-3 py-2 text-sm sm:text-base rounded-lg bg-orange-400 hover:bg-orange-600 text-white border border-orange-500 transition-all duration-200 hover:scale-105 whitespace-nowrap">
                                Đăng nhập
                            </button>
                            <button
                                onClick={() => navigate(path.REGISTER)}
                                className="px-3 py-2 text-sm sm:text-base rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg ring-2 ring-red-300 transition-all duration-200 hover:scale-110 whitespace-nowrap">
                                Đăng ký
                            </button>
                        </>
                    )}

                    {/* Khi đã đăng nhập */}
                    {currentUser && (
                        <>
                            <button
                                onClick={() => navigate(path.HOME)}
                                className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 hover:scale-105">
                                <House className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            <button
                                onClick={() => setMessageBoxOpen(true)}
                                className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 hover:scale-105 relative">
                                <Mails className="w-4 h-4 sm:w-5 sm:h-5" />
                                {unreadMessagesCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md animate-bounce min-w-[1.25rem] h-5 flex items-center justify-center">
                                        {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 hover:scale-105">
                                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;