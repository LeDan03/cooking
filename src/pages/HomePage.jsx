import { useState, useEffect, useMemo } from "react";
import { SearchIcon, HeartIcon, PlusIcon } from "lucide-react";
import recipesResult from "../api/recipe/getAllRecipe";
import categoriesResult from "../api/recipe/getAllCategory";
import difficultiesResponse from "../api/difficulty/getAllDifficulty";
import myData from "../api/personal/me";
import savedRecipesResponse from "../api/personal/getMySavedRecipes";
import lovedRecipesResponse from "../api/personal/getMyLovedRecipes";

import { useNavigate } from "react-router-dom";

/* Zustand stores */
import useAuthStore from "../store/useAuthStore";
import useCommonStore from "../store/useCommonStore";
import usePersonalStore from "../store/usePersonalStore";

/* Components & utils */
import ImageWithFallback from "../component/ImageWithFallBack";
import path from "../utils/path";

const HomePage = () => {
  /* ---------- GLOBAL STORE ---------- */
  const {
    recipes,
    categories,
    difficulties,
    setRecipes,
    setCategories,
    setDifficulties,
  } = useCommonStore();

  const { setSavedRecipes, setLovedRecipes } = usePersonalStore();

  const navigate = useNavigate();
  const currentUser = useAuthStore((state)=>state.currentUser);
  /* ---------- LOCAL UI STATE ---------- */
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  /* ---------- LOAD ONCE (chỉ khi store chưa có dữ liệu) ---------- */
  useEffect(() => {
    if (recipes.length) return; // đã có dữ liệu (có thể do patch), không ghi đè ngay

    (async () => {
      const list = await recipesResult(true);
      Array.isArray(list) && setRecipes(list);

      const catRes = await categoriesResult();
      Array.isArray(catRes.data) && setCategories(catRes.data);

      if (currentUser) {
        const [diffRes, info, saved, loved] = await Promise.all([
          difficultiesResponse(),
          myData(),
          savedRecipesResponse(),
          lovedRecipesResponse(),
        ]);

        Array.isArray(diffRes) && setDifficulties(diffRes);
        info && useAuthStore.getState().setCurrentUser(info);
        saved && setSavedRecipes(saved);
        loved && setLovedRecipes(loved);
      }
    })();
  }, [currentUser, recipes.length, setRecipes, setCategories, setDifficulties, setSavedRecipes, setLovedRecipes]);

  /* ---------- POLLING 30s */
  useEffect(() => {
    const id = setInterval(async () => {
      const list = await recipesResult(true);
      if (Array.isArray(list)) {
        
        setRecipes(list);
      }
      console.log("[Auto Refresh] Recipes updated");
    }, 30000);
    return () => clearInterval(id);
  }, [setRecipes]);

  /* ---------- HANDLERS ---------- */
  const handleChangeCategory = (e) => setSelectedCategory(e.target.value);

  const handleSelectRecipe = (recipe) => {
    sessionStorage.setItem("selectedRecipe", JSON.stringify(recipe));
    console.log("Selected recipe", recipe);
    navigate(path.RECIPEDETAIL);
  };

  /* ---------- FILTERED LIST ---------- */
  const displayRecipes = useMemo(() => {
    let list = recipes;

    if (selectedCategory !== "Tất cả") {
      list = list.filter(r => r.categoryName === selectedCategory);
    }

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(kw));
    }
    return list;
  }, [recipes, selectedCategory, keyword]);

  /* ---------- RENDER ---------- */
  return (
    <div className="w-full min-h-screen p-2 sm:p-4 lg:p-6 bg-gray-100">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center sm:text-left">
          Danh sách công thức
        </h2>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Category */}
          <select
            className="flex-shrink-0 h-10 sm:h-12 bg-orange-500 text-white rounded-md px-3 text-sm sm:text-base order-1 sm:order-1"
            value={selectedCategory}
            onChange={handleChangeCategory}
          >
            <option value="Tất cả">Tất cả</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 order-2 sm:order-2">
            <div className="flex-shrink-0 bg-orange-400 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl hover:bg-orange-600 transition-colors">
              <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <input
              type="search"
              className="flex-1 h-10 sm:h-12 bg-white px-3 sm:px-4 border border-orange-600 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập tên món cần tìm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      {displayRecipes.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 text-center text-sm sm:text-base">
            Không có công thức nào phù hợp!
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
        >
          {Array.isArray(displayRecipes) && displayRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white border rounded-lg shadow hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer overflow-hidden h-[280px] xs:h-[300px] sm:h-[320px] md:h-[350px] lg:h-[380px] hover:scale-105 transform"
              onClick={() => {
                if (!currentUser) navigate(path.LOGIN);
                else handleSelectRecipe(recipe);
              }}
            >
              {/* Image */}
              <div className="w-full flex-1 min-h-0 relative overflow-hidden">
                <ImageWithFallback
                  src={recipe.imagesUrl[0]}
                  alt={recipe.title}
                  classname="w-full h-full object-cover rounded-t-lg hover:scale-110 transition-transform duration-300"
                />
              </div>
              {/* Info */}
              <div className="flex flex-col justify-between p-2 sm:p-3 h-[100px] xs:h-[110px] sm:h-[120px] md:h-[130px] lg:h-[140px]">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-black line-clamp-2 leading-tight mb-1">
                  {recipe.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 italic mb-1 sm:mb-2 truncate">
                  Danh mục: {recipe.categoryName}
                </p>
                <div className="flex items-center gap-1 text-pink-500 text-xs sm:text-sm">
                  <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4 fill-pink-500 flex-shrink-0" />
                  <span className="font-medium">{recipe.loveCount ?? 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 group">
        <button
          onClick={() => navigate(path.CREATERECIPE)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 sm:p-5 rounded-full shadow-lg transition-all duration-300 ease-in-out"
        >
          <PlusIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
        <div
          className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 whitespace-nowrap bg-black text-white text-xs sm:text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg"
        >
          Tạo bài viết ngay!
        </div>
      </div>
    </div>
  );
};

export default HomePage;
