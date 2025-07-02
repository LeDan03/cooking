import { useEffect, useState } from 'react';
import {
  Clock,
  User,
  Calendar,
  Heart,
  Bookmark,
  ChefHat,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';

/* ---------- STORES ---------- */
import useAuthStore from '../store/useAuthStore';
import useCommonStore from '../store/useCommonStore';
import usePersonalStore from '../store/usePersonalStore';

/* ---------- API ---------- */
import accountResponse from '../api/account/getAccount';
import unitsResponse from '../api/unit/getAllUnit';
import saveResponse from '../api/interaction/save';
import loveResponse from '../api/interaction/love';

/* ---------- UTILS ---------- */
import path from '../utils/path';

const RecipeDetail = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  /* ---------- GLOBAL STORE PATCHERS ---------- */
  const { patchRecipe } = useCommonStore.getState();
  const { patchLoved, patchSaved } = usePersonalStore.getState();

  /* ---------- LOCAL STATE ---------- */
  const [recipeData, setRecipeData] = useState({});
  const [units, setUnits] = useState([]);
  const [comment, setComment] = useState('');
  const [isLoved, setIsLoved] = useState(false);
  const [loveCount, setLoveCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [author, setAuthor] = useState({});
  const [difficulty, setDifficulty] = useState('');
  const [loveDisable, setLoveDisable] = useState(false);
  const [saveDisable, setSaveDisable] = useState(false);

  /* ---------- LOAD INIT DATA ---------- */
  const loadSelectedRecipe = () => {
    const rawData = sessionStorage.getItem('selectedRecipe');
    if (!rawData) navigate(path.HOME);

    const data = JSON.parse(rawData);
    setRecipeData(data);
    console.log("SELECTED RECIPE", data);
    const savedList = usePersonalStore.getState().savedRecipes;
    setIsSaved(savedList.some((r) => r.id === data.id));

    const lovedList = usePersonalStore.getState().lovedRecipes;
    console.log("Loved list", lovedList);
    setIsLoved(lovedList.some((r) => r.id === data.id));
  };

  const handleLoadUnits = async () => {
    const res = await unitsResponse();
    Array.isArray(res) && setUnits(res);
  };

  const loadDifficulty = () => {
    const dft = useCommonStore
      .getState()
      .difficulties.find((d) => d.id === recipeData.difficultyId);
    dft && setDifficulty(dft);
  };

  const loadAuthor = async () => {
    const res = await accountResponse(recipeData.authorId);
    res && setAuthor(res);
  };
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const unitName = (unitId) => {
    if (!unitId || !Array.isArray(units)) return "N/A";
    const match = units.find(unit => unit.id === unitId);
    return match ? match.name : "N/A";
  };

  const handleNavigateToAuthor = () => {
    navigate(path.PERSONAL, { state: { author } });
  }

  /* ---------- TOGGLE LOVE ---------- */
  const handleLove = async () => {
    if (loveDisable) return;
    setLoveDisable(true);

    try {
      const res = await loveResponse(recipeData.id); // backend nên trả loveCount mới
      if (!res) return alert('Có lỗi xảy ra, vui lòng thử lại!');

      const newLoved = !isLoved; // sau toggle
      const newCount = res.loveCount ?? (isLoved ? loveCount - 1 : loveCount + 1);

      // Cập nhật local UI
      setIsLoved(newLoved);
      setLoveCount(newCount);

      // Patch vào stores
      patchRecipe(recipeData.id, { loveCount: newCount });
      patchLoved(recipeData.id, !newLoved);
    } finally {
      setTimeout(() => setLoveDisable(false), 1000);
    }
  };

  const handleSave = async () => {
    if (saveDisable) return;
    setSaveDisable(true);

    try {
      const ok = await saveResponse(recipeData.id);
      if (!ok) return alert('Có lỗi xảy ra, vui lòng thử lại!');

      const newSaved = !isSaved;
      const newCount = isSaved ? Math.max(saveCount - 1, 0) : saveCount + 1;

      setIsSaved(newSaved);
      setSaveCount(newCount);

      patchRecipe(recipeData.id, { saveCount: newCount });
      patchSaved(recipeData.id, !newSaved);
    } finally {
      setTimeout(() => setSaveDisable(false), 1000);
    }
  };

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    loadSelectedRecipe();
    handleLoadUnits();
  }, [currentUser]);

  useEffect(() => {
    if (Object.keys(recipeData).length) {
      setLoveCount(recipeData.loveCount);
      setSaveCount(recipeData.saveCount);
      loadAuthor();
      loadDifficulty();
    }
  }, [recipeData]);
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Image - Responsive cho tất cả thiết bị */}
      <div className="relative w-full">
        {/* Mobile Portrait: 4:3, Mobile Landscape: 16:6, Tablet: 16:7, Desktop: 21:8 */}
        <div className="relative w-full overflow-hidden aspect-[4/3] xs:aspect-[16/6] sm:aspect-[16/7] lg:aspect-[21/8] rounded-md">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            autoplay={{ delay: 3000 }}
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1}
            loop={recipeData.imagesUrl?.length > 1}
            className="w-full h-full custom-swiper-pagination"
          >
            {recipeData.imagesUrl?.map((imgUrl, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full">
                  <img
                    src={imgUrl}
                    alt={`Ảnh ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {/* Back button - Responsive positioning */}
        <button className="absolute top-2 left-2 xs:top-4 xs:left-4 bg-white/90 backdrop-blur-sm p-2 xs:p-3 rounded-full hover:bg-white transition-all duration-200 shadow-lg">
          <ArrowLeft size={18} className="xs:w-6 xs:h-6 text-gray-800" onClick={() => navigate(path.HOME)} />
        </button>
        {/* Title overlay - Responsive text and padding */}
        <div className="absolute bottom-0 left-0 right-0 p-3 xs:p-4 sm:p-6 lg:p-8 text-white">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
            {recipeData.title}
          </h1>
        </div>
      </div>
      {/* Main Content - Responsive container */}
      <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-6xl mx-auto pt-4 xs:pt-6 pb-8 xs:pb-10">
          <div className="bg-white rounded-lg xs:rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 lg:p-8">
            {/* Recipe Meta - Responsive layout */}
            <div className="flex flex-col space-y-4 xs:space-y-0 xs:flex-row xs:justify-between xs:items-center mb-6 border-b pb-4 gap-2 xs:gap-4">
              <div className="flex items-center">
                <div className="w-10 h-10 xs:w-12 xs:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <img className='rounded-2xl' src={author.avatarUrl || "https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp"}
                    onClick={() => handleNavigateToAuthor()} />
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium text-sm xs:text-base">Đăng bởi</p>
                  <button
                    className="text-orange-600 font-semibold hover:underline text-sm xs:text-base"
                    onClick={() => handleNavigateToAuthor()}
                  >
                    {author.username}
                  </button>
                </div>
              </div>
              <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4">
                <div className="flex items-center">
                  <Calendar size={16} className="xs:w-5 xs:h-5 mr-1 text-gray-600" />
                  <span className="text-gray-600 text-xs xs:text-sm">{formatDate(recipeData.createdAt)}</span>
                </div>
                <div className="flex space-x-2 xs:space-x-3">
                  <button
                    disabled={loveDisable}
                    className={`flex items-center space-x-1 px-2 xs:px-3 py-1 xs:py-2 rounded-full text-xs xs:text-sm ${isLoved ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'
                      } transition-all duration-200 hover:scale-105`}
                    onClick={() => handleLove()}
                  >
                    <Heart size={14} className={`xs:w-4 xs:h-4 ${isLoved ? 'fill-red-600 text-red-600' : ''}`} />
                    <span>{loveCount}</span>
                  </button>
                  <button
                    disabled={saveDisable}
                    className={`flex items-center space-x-1 px-2 xs:px-3 py-1 xs:py-2 rounded-full text-xs xs:text-sm ${isSaved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700'
                      } transition-all duration-200 hover:scale-105`}
                    onClick={() => handleSave()}
                  >
                    <Bookmark size={14} className={`xs:w-4 xs:h-4 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
                    <span>{saveCount}</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Recipe Info - Responsive text and spacing */}
            <div className="mb-6 xs:mb-8">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 xs:mb-4 text-gray-800">Giới thiệu</h2>
              <p className="text-gray-700 mb-4 xs:mb-6 text-xl xs:text-base leading-relaxed">{recipeData.content}</p>
              {/* Stats Grid - Responsive columns */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 my-4 xs:my-6">
                <div className="bg-orange-50 p-3 xs:p-4 rounded-lg text-center hover:bg-orange-100 transition-colors">
                  <Clock className="mx-auto text-orange-500 mb-2" size={20} />
                  <p className="text-xs xs:text-sm text-gray-600">Chuẩn bị</p>
                  <p className="font-semibold text-gray-900 text-sm xs:text-base">{recipeData.prepTime + ' phút'}</p>
                </div>
                <div className="bg-orange-50 p-3 xs:p-4 rounded-lg text-center hover:bg-orange-100 transition-colors">
                  <ChefHat className="mx-auto text-orange-500 mb-2" size={20} />
                  <p className="text-xs xs:text-sm text-gray-600">Nấu</p>
                  <p className="font-semibold text-gray-900 text-sm xs:text-base">{recipeData.cookTime + ' phút'}</p>
                </div>
                <div className="bg-orange-50 p-3 xs:p-4 rounded-lg text-center hover:bg-orange-100 transition-colors">
                  <User className="mx-auto text-orange-500 mb-2" size={20} />
                  <p className="text-xs xs:text-sm text-gray-600">Khẩu phần</p>
                  <p className="font-semibold text-gray-900 text-sm xs:text-base">{recipeData.servings} người</p>
                </div>
                <div className="bg-orange-50 p-3 xs:p-4 rounded-lg text-center hover:bg-orange-100 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto text-orange-500 mb-2"
                  >
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  </svg>
                  <p className="text-xs xs:text-sm text-gray-600">Độ khó</p>
                  <p className="font-semibold text-gray-900 text-sm xs:text-base">{difficulty.name}</p>
                </div>
              </div>
            </div>
            {/* Ingredients - Responsive layout */}
            <div className="mb-6 xs:mb-8">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 xs:mb-4 text-gray-800">Nguyên liệu</h2>
              <div className="bg-gray-50 p-3 xs:p-4 rounded-lg">
                <ul className="space-y-2 xs:space-y-3">
                  {recipeData.ingredients?.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-orange-500 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 text-sm xs:text-base">{ingredient.name + ' (' + ingredient.amount + ' ' + unitName(ingredient.unitId) + ')'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Steps - Responsive layout and images */}
            <div className="mb-6 xs:mb-8">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 xs:mb-4 text-gray-800">Các bước thực hiện</h2>
              <div className="space-y-6 xs:space-y-8">
                {recipeData.steps?.map((step, index) => (
                  <div key={index} className="border-b pb-4 xs:pb-6 last:border-0">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-orange-500 text-white rounded-full w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center font-bold mr-3 xs:mr-4 text-sm xs:text-base">
                        {step.stt}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-gray-700 text-xl xs:text-base leading-relaxed mb-3">{step.content}</p>
                        {step?.imageUrl && (
                          <div className="mt-3 xs:mt-4">
                            <img
                              src={step.imageUrl}
                              alt={`Bước ${step.stt}`}
                              className="rounded-lg w-full sm:w-4/5 lg:w-3/4 xl:w-2/3 mx-auto object-cover shadow-md hover:shadow-lg transition-shadow"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Comment Section - Responsive input */}
            <div className="mb-6 xs:mb-8">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 xs:mb-4 text-gray-800">Bình luận</h2>

              <div className="mb-4 xs:mb-6 flex flex-col xs:flex-row gap-2 xs:gap-0">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  className="flex-grow p-3 border rounded-lg xs:rounded-l-lg xs:rounded-r-none focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm xs:text-base"
                />
                <button
                  // onClick={handleComment}
                  className="bg-orange-500 text-white px-4 py-3 rounded-lg xs:rounded-l-none xs:rounded-r-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <Send size={18} className="xs:w-5 xs:h-5" />
                  <span className="ml-2 xs:hidden">Gửi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;