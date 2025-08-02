import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react"; // hoặc bất kỳ icon nào bạn đang dùng
import path from "../utils/path";

const CreateRecipeButton = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse opacity-75 scale-110"></div>
        <button
          onClick={() => navigate(path.CREATERECIPE)}
          className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 group"
        >
          <Plus className="w-6 h-6" />
          <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 whitespace-nowrap bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Tạo công thức mới
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default CreateRecipeButton;
