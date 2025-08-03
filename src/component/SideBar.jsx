import { X, ChefHat, Search, LogOut, Home, } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useSidebarStore from "../store/useSidebarStore";
import logOutResponse from "../api/auth/logOut";
import path from "../utils/path";
import { HttpStatusCode } from "axios";
import useCommonStore from "../store/useCommonStore";
import usePersonalStore from "../store/usePersonalStore";
import useTrendingStore from "../store/useTrendingStore";

const Sidebar = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { sidebarOpen, setSidebarOpen } = useSidebarStore();

  const handleLogout = async () => {
    const result = await logOutResponse();
    if (result.status === HttpStatusCode.Ok) {
      sessionStorage.removeItem("common-storage");

      sessionStorage.removeItem("personal-storage");

      sessionStorage.removeItem("selectedRecipe");

      useAuthStore.getState().clearCurrentUser();
      usePersonalStore.getState().clearStore();
      useTrendingStore.getState().clearStore();
      navigate(path.HOME);
    } else {
      alert("Đăng xuất thất bại, có lỗi xảy ra!");
    }
  }

  const sidebarItems = [
    { icon: Home, label: "Trang chủ", action: () => navigate(path.HOME) },
    { icon: ChefHat, label: "Bếp của tôi", action: () => navigate(path.PERSONAL) },
    { icon: Search, label: "Tìm đầu bếp", action: () => navigate(path.SEARCHACCOUNT) },
    { icon: LogOut, label: "Đăng xuất", action: () => handleLogout() },
  ];

  return (
    <>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {currentUser && (
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <img
                  src={currentUser?.avatarUrl || "https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp"}
                  alt={currentUser?.username}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-800">{currentUser.username || 'Người dùng'}</p>
                <p className="text-sm text-gray-600">{currentUser.email || 'user@example.com'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.action();
                setSidebarOpen(false);
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-gray-700 group-hover:text-gray-900">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;