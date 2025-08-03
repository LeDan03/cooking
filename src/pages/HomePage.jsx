import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Heart,
  Plus,
  User,
  Tag,
  Star,
  TrendingUp,
  Clock,
  Flame,
  Trophy,
  Crown,
  Award
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import recipesResult from "../api/recipe/recipe/getAllRecipe";
import categoriesResult from "../api/recipe/recipe/getAllCategory";
import difficultiesResponse from "../api/difficulty/getAllDifficulty";
import myData from "../api/personal/me";
import savedRecipesResponse from "../api/personal/getMySavedRecipes";
import lovedRecipesResponse from "../api/personal/getMyLovedRecipes";
import getThisWeekTrending from "../api/analytics/trending";
import getRecipesByIdsResponse from "../api/recipe/recipe/getRecipesByIds"

import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useCommonStore from "../store/useCommonStore";
import usePersonalStore from "../store/usePersonalStore";
import useTrendingStore from "../store/useTrendingStore";

import ImageWithFallback, { UserImageFallBack } from "../component/ImageWithFallBack";
import path from "../utils/path";

import CreateRecipeButton from "../component/CreateRecipeButton";
import messagesResponse from "../api/personal/messages";
import { HttpStatusCode } from "axios";
import searchResult from "../api/recipe/recipe/searchRecipe";

import { useCallback } from "react";
import { debounce } from "lodash";

const fetchSearchRecipes = async (keyword, setIsSearching, setSearchPage, setSearchRecipes, searchResult) => {
  const trimmed = keyword.trim();
  if (trimmed) {
    setIsSearching(true);
    setSearchPage(0);
    try {
      const result = await searchResult(trimmed, 0, 20);
      setSearchRecipes(result ?? []);
    } catch (err) {
      console.warn("Lỗi tìm kiếm:", err);
      setSearchRecipes([]);
    } finally {
      setIsSearching(false);
    }
  } else {
    setSearchRecipes([]); // reset nếu keyword rỗng
  }
};

const HomePage = () => {
  const {
    recipes,
    categories,
    difficulties,
    setRecipes,
    setCategories,
    setDifficulties,
  } = useCommonStore();
  const { setSavedRecipes, setLovedRecipes } = usePersonalStore();

  const setMessages = usePersonalStore((state) => state.setMessages);

  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [reached, setReached] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchRecipes, setSearchRecipes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [searchPage, setSearchPage] = useState(0); // riêng cho search
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Trending
  const { thisWeekTrending, trendingRecipeDetails } = useTrendingStore();
  const topUsers = useMemo(() => thisWeekTrending?.weeklyAccounts || [], [thisWeekTrending]);
  const topRecipes = useMemo(() => trendingRecipeDetails, [trendingRecipeDetails]);
  // console.log("top users", topUsers);
  // pulic notification
  const [publicNotification, setPublicNotification] = useState("Hãy cùng chung tay xây dựng cộng đồng lành mạnh!");
  const [filtering, setFiltering] = useState(false);

  // tránh re render 
  const hasCurrentUser = useRef(false);

  const loadWeekTrending = async () => {
    const result = await getThisWeekTrending();
    if (result?.status === HttpStatusCode.Ok) {
      const trending = result.data;
      // Lấy danh sách recipeId
      const recipeIds = trending.weeklyRecipes?.map(r => r.recipeId) ?? [];

      let sortedRecipes = [];
      if (recipeIds.length > 0) {
        const detailedRecipesResponse = await getRecipesByIdsResponse(recipeIds);

        if (Array.isArray(detailedRecipesResponse.data)) {
          // Sort theo rank tăng dần
          sortedRecipes = [...detailedRecipesResponse.data].sort((a, b) => {
            const rankA = trending.weeklyRecipes.find(r => r.recipeId === a.id)?.rank ?? 9999;
            const rankB = trending.weeklyRecipes.find(r => r.recipeId === b.id)?.rank ?? 9999;
            return rankA - rankB;
          });

          // Lưu chi tiết recipe đã sort
          useTrendingStore.getState().setTrendingRecipeDetails(sortedRecipes);
        }
      }
      // Sort weeklyAccounts theo rank tăng dần
      const sortedUsers = trending.weeklyAccounts?.sort((a, b) => a.rank - b.rank) ?? [];
      const sortTrending = {
        ...trending,
        weeklyAccounts: sortedUsers,
        weeklyRecipes: sortedRecipes // dùng danh sách đã sort
      };
      useTrendingStore.getState().setThisWeekTrending(sortTrending);
    }
  };
  // Theo doi nguoi dung cuon toi dau
  useEffect(() => {
    const handleScroll = debounce(async () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;

      if (scrollPercent > 0.7 && !reached && !isLoadingMore) {
        setReached(true);
        setIsLoadingMore(true);
        try {
          if (keyword.trim()) {
            const nextPage = searchPage + 1;
            const moreSearch = await searchResult(keyword, nextPage, 20);
            if (Array.isArray(moreSearch) && moreSearch.length > 0) {
              setSearchRecipes(prev => [...prev, ...moreSearch]);
              setSearchPage(nextPage);
            }
          } else {
            const nextPage = currentPage + 1;
            const newPart = await recipesResult(false, nextPage, 30);
            if (Array.isArray(newPart.recipeResponses) && newPart.recipeResponses.length > 0) {
              setRecipes(prev => [...prev, ...newPart.recipeResponses]);
              setCurrentPage(nextPage);
            }
          }
        } catch (err) {
          console.error("Lỗi load thêm recipe:", err);
        }
        setReached(false);
        setIsLoadingMore(false);
      }
    }, 300); // Delay 300ms để giảm tần suất

    window.addEventListener("scroll", handleScroll);
    return () => {
      handleScroll.cancel(); // Cleanup debounce
      window.removeEventListener("scroll", handleScroll);
    };
  }, [reached, currentPage, searchPage, keyword, isLoadingMore]);


  useEffect(() => {
    if (currentUser && currentUser.role === 'ADMIN') {
      navigate(path.ADMIN);
    }
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // try {
        const list = await recipesResult();
        Array.isArray(list.recipeResponses) && setRecipes(list.recipeResponses);

        const catRes = await categoriesResult();
        Array.isArray(catRes.data) && setCategories(catRes.data);

        if (currentUser && !hasCurrentUser.current) {
          const [info, saved, loved, diffRes, mess] = await Promise.all([
            myData(),
            savedRecipesResponse(),
            lovedRecipesResponse(),
            difficultiesResponse(),
            messagesResponse(),
          ]);

          if (isMounted && info && (!currentUser || currentUser.id !== info.id)) {
            useAuthStore.getState().setCurrentUser(info);
            hasCurrentUser.current = true;
          }

          saved && setSavedRecipes(saved);
          loved && setLovedRecipes(loved);
          diffRes && setDifficulties(diffRes);
          mess && setMessages(mess.data);

          // console.log("My messages", mess);
        }
      // } catch (err) {
      //   console.warn("Không thể tải dữ liệu người dùng:", err);
      // }
    })();
    return () => {
      isMounted = false;
    };
  }, []); // Chạy một lần khi mount

  useEffect(() => {
    if (currentUser) {
      const { thisWeekTrending } = useTrendingStore.getState();
      if (!thisWeekTrending) { // Chỉ gọi nếu chưa có dữ liệu
        loadWeekTrending();
      }
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const id = setInterval(async () => {
      // console.log("REFRESH RECIPES");
      const list = await recipesResult();
      if (Array.isArray(list)) setRecipes(list.recipeResponses);
    }, 300000); //5p
    return () => clearInterval(id);
  }, []);

  const handleChangeCategory = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setFiltering(value !== "Tất cả");
  };
  const handleSelectRecipe = (recipe) => {
    sessionStorage.setItem("selectedRecipe", JSON.stringify(recipe));
    navigate(path.RECIPEDETAIL);
  };

  const debouncedFetch = useCallback(
    debounce((keyword) => {
      fetchSearchRecipes(keyword, setIsSearching, setSearchPage, setSearchRecipes, searchResult);
    }, 500),
    [] // Dependency array rỗng để chỉ tạo một lần
  );

  useEffect(() => {
    debouncedFetch(keyword);
    // Hủy debounce khi component unmount
    return () => {
      debouncedFetch.cancel();
    };
  }, [keyword, debouncedFetch]);

  const featuredRecipes = useMemo(() => {
    return recipes.filter((r) => r.featured);
  }, [recipes]);

  const displayRecipes = useMemo(() => {
    let list = keyword.trim() ? searchRecipes : recipes.filter(r => !r.featured);
    if (selectedCategory !== "Tất cả") {
      list = list.filter(r => r.categoryName === selectedCategory);
    }
    return list;
  }, [recipes, searchRecipes, selectedCategory, keyword]);

  const filterUserForPersonal = (user) => {
    return {
      id: user.accountId, // Giả sử accountId từ WeeklyAccountDto tương ứng với id
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt, // Nếu có trong dữ liệu nguồn
      updatedAt: user.updatedAt, // Nếu có trong dữ liệu nguồn
      status: user.status, // Nếu có trong dữ liệu nguồn
      role: user.role, // Nếu có trong dữ liệu nguồn
    };
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Main Content */}
      <span className="w-full min-h-16 max-h-32 
                      bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-50
                      flex items-center justify-center text-lg font-semibold text-orange-600
                      border border-orange-200 rounded-xl shadow-lg shadow-amber-100 mb-4
                      animate-pulse">
        {publicNotification}
      </span>

      <div className="p-4 pb-24">


        {/* Top Section - Users & Recipes */}
        {!(keyword || filtering) && (
          <div className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Users */}
              <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 rounded-2xl p-5 shadow-md border border-purple-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    3 quả tim vàng tuần trước
                  </h3>
                </div>

                <div className="space-y-3">
                  {currentUser === null ? (
                    <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-pink-100 p-4 rounded-xl text-center shadow-md border border-pink-200 animate-pulse">
                      <div className="flex items-center justify-center gap-2 text-lg font-bold text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-pink-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 2a4 4 0 00-4 4v2H5a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3v-6a3 3 0 00-3-3h-1V6a4 4 0 00-4-4z" />
                        </svg>
                        Hãy đăng nhập để theo dõi bảng xếp hạng nhé!!!
                      </div>
                    </div>
                  ) : topUsers.length > 0 ? (
                    topUsers.slice(0, 3).map((user, index) => (
                      <div
                        key={user.accountId}
                        onClick={() => {
                          const filteredUser = filterUserForPersonal(user);
                          navigate(path.PERSONAL, { state: { author: filteredUser } });
                        }}
                        className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-200 ${index === 0
                          ? "bg-orange-200 shadow-lg scale-[1.03] shine-effect"
                          : index === 1
                            ? "bg-gray-100 shadow-md scale-[1.01]"
                            : "bg-white/70"
                          } hover:bg-white`}
                      >
                        <div className="relative">
                          <UserImageFallBack
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-15 h-15 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          <div
                            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0
                              ? "bg-yellow-500"
                              : index === 1
                                ? "bg-gray-400"
                                : "bg-orange-500"
                              }`}
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">{user.username}</p>
                          <div className="flex items-center gap-1 text-xs text-pink-600">
                            <Heart className="w-3 h-3 fill-pink-600" />
                            <span>{user.totalLoveAction} lượt thích</span>
                          </div>
                        </div>
                        {index === 0 && (
                          <div className="w-10 h-10 bg-yellow-500 flex items-center justify-center rounded">
                            <Trophy className="w-7 h-7 text-white animate-bounce" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 italic">
                      Tuần rồi vắng lặng quá... Không có người dùng nổi bật 🥲
                    </p>
                  )}
                </div>
              </div>

              {/* Top Recipes */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 shadow-md border border-amber-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Siêu công thức được yêu thích nhất tuần qua
                  </h3>
                </div>
                <div className="space-y-3">
                  {currentUser === null ? (
                    <div className="bg-gradient-to-l from-orange-300 via-red-100 to-yellow-100 p-4 rounded-xl text-center shadow-md border border-pink-200 animate-pulse">
                      <div className="flex items-center justify-center gap-2 text-lg font-bold text-transparent bg-gradient-to-r from-red-700 to-orange-400 bg-clip-text">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20" //vẽ hình trong khung 20x20 (hệ trục tọa độ 0 0 20 20)
                        >
                          {/* vẽ một đường bằng chuỗi lệnh vẽ vector */}
                          <path d="M10 2a4 4 0 00-4 4v2H5a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3v-6a3 3 0 00-3-3h-1V6a4 4 0 00-4-4z" />
                        </svg>
                        Hãy đăng nhập để theo dõi bảng xếp hạng nhé!!!
                      </div>
                    </div>
                  ) :
                    topRecipes.length === 0 ? (
                      <p className="text-sm text-gray-600 italic">
                        Tuần này chưa có công thức nào nổi bật cả. Hãy là người đầu tiên chia sẻ món ăn yêu thích của bạn và nhận được sự yêu thích từ cộng đồng nhé!
                      </p>
                    ) : (
                      topRecipes.map((recipe, index) => (
                        <div
                          key={recipe.id}
                          className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-200 cursor-pointer group
                        ${index === 0 ? 'bg-gradient-to-r from-orange-100 to-yellow-300 shadow-md scale-[1.015]' :
                              index === 1 ? 'bg-white shadow-md border border-gray-200 scale-[1.01]' :
                                'bg-gray-50 shadow-sm'} hover:bg-white`}
                          onClick={() => currentUser ? handleSelectRecipe(recipe) : navigate(path.LOGIN)}
                        >
                          <div className="relative">
                            <ImageWithFallback
                              src={recipe.imagesUrl[0]}
                              alt={recipe.title}
                              className="w-15 h-15 rounded-lg object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'}`}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors 
              ${index === 0 ? 'text-red-600 text-md' : 'text-sm'}`}>
                              {recipe.title}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-pink-600">
                              <Heart className="w-3 h-3 fill-pink-600" />
                              <span>{recipe.loveCount} lượt thích</span>
                            </div>
                          </div>
                          {index === 0 && (
                            <div className="relative w-10 h-10">
                              <Flame className="absolute top-0 left-0 w-8 h-8 text-orange-500 flame-realistic" style={{ animationDelay: '0s' }} />
                              <Flame className="absolute top-0 left-0 w-7 h-7 text-yellow-500 flame-realistic" style={{ animationDelay: '0.3s' }} />
                              <Flame className="absolute top-0 left-0 w-6 h-6 text-red-600 flame-realistic" style={{ animationDelay: '0.6s' }} />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Search Section */}
        <div className="mb-8 space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              BẾP CỘNG ĐỒNG
            </h2>
            <p className="text-gray-600">Tìm kiếm món ăn yêu thích của bạn</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl px-4 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={selectedCategory}
              onChange={handleChangeCategory}
            >
              <option value="Tất cả" className="bg-red-800">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name} className="bg-red-800">{c.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  className="w-full h-12 pl-12 pr-4 bg-white border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="Tìm kiếm món ăn..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Recipes */}
        {!(keyword || filtering) && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Công thức nổi bật
              </h3>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-300 to-transparent"></div>
            </div>

            <div className="relative bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100 p-6 rounded-2xl shadow-inner border border-orange-200/50">
              {featuredRecipes.length > 0 ? (
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={20}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 }
                  }}
                  navigation
                  loop={featuredRecipes.length > 2}
                  className="pb-4"
                >
                  {featuredRecipes.map((recipe) => (
                    <SwiperSlide key={recipe.id}>
                      <div
                        onClick={() => currentUser ? handleSelectRecipe(recipe) : navigate(path.LOGIN)}
                        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-orange-100"
                      >
                        <div className="relative overflow-hidden">
                          <ImageWithFallback
                            src={recipe.imagesUrl[0]}
                            alt={recipe.title}
                            classname="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Nổi bật
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {recipe.title}
                          </h4>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {recipe.categoryName}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 text-pink-500">
                              <Heart className="w-4 h-4 fill-pink-500" />
                              <span className="font-medium">{recipe.loveCount ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-orange-500">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{recipe.cookingTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">
                    Không có bài viết nổi bật nào hiện tại!
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Hãy tạo bài viết nổi bật của riêng bạn ngay!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        {displayRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy công thức nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border border-gray-100 h-[320px] flex flex-col"
                onClick={() => currentUser ? handleSelectRecipe(recipe) : navigate(path.LOGIN)}
              >
                <div className="relative overflow-hidden h-60">
                  <ImageWithFallback
                    src={recipe.imagesUrl[0]}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="text-base font-bold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {recipe.categoryName}
                    </span>
                    <div className="flex items-center gap-1 text-pink-500">
                      <Heart className="w-3 h-3 fill-pink-500" />
                      <span className="font-medium">{recipe.loveCount ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <CreateRecipeButton />
    </div>
  );
};

export default HomePage;