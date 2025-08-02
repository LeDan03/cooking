import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Edit, Calendar, Users, User, ChefHat, Clock, Lock, ChevronDown, Pencil } from 'lucide-react';

/* ---------- STORES ---------- */
import useAuthStore from '../store/useAuthStore';
import usePersonalStore from '../store/usePersonalStore';
import useCommonStore from '../store/useCommonStore';

/* ---------- API ---------- */
import recipesResponse from '../api/personal/getMyRecipes';
import mainImagesResponse from '../api/personal/getMainImages';
import followActResponse from '../api/interaction/follow';
import someoneFollowersResponse from '../api/someone/getFollowers';
import someoneFolloweesResponse from '../api/someone/getFollowees';
import privateRecipeResponse from '../api/personal/getPrivateRecipe'
import someoneRecipesResponse from '../api/someone/getRecipes';
import CreateRecipeButton from '../component/CreateRecipeButton';
import requiredPublicResponse from '../api/personal/requiredPublicRecipe';
import deleteResponse from '../api/recipe/recipe/deleteRecipe';
/* ---------- OTHER ---------- */
import { uploadImageToCloudinary } from '../services/cloudinary';
import { updateAvt, updateUsername } from '../api/personal/me';
import { HttpStatusCode } from 'axios';
import path from '../utils/path';
import ImageWithFallback from '../component/ImageWithFallBack';
import CustomButton from '../component/CustomButton';

const PersonalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef();

  const [pageAuthor, setPageAuthor] = useState(null);
  const currentUser = useAuthStore((state) => state.currentUser);
  const [publicRecipes, setPublicRecipes] = useState([]);
  const [privateRecipes, setPrivateRecipes] = useState([]);
  const [isOwner, setIsOwner] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [followees, setFollowees] = useState([]);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(pageAuthor?.username || "");

  // neu currentUser la chu trang thi moi load loved+saved
  const myLovedRecipes = usePersonalStore((state) => state.lovedRecipes);
  const mySavedRecipes = usePersonalStore((state) => state.savedRecipes);

  // Guess
  const guessFollowees = usePersonalStore((state) => state.followees);

  //anh hien thi
  const [publicRecipeMainImages, setPublicRecipeMainImages] = useState([]);
  const [privateRecipeMainImages, setPrivateRecipeMainImages] = useState([]);
  const [lovedMainImages, setLovedMainImages] = useState([]);
  const [savedMainImages, setSavedMainImages] = useState([]);

  // Tag cho button
  const [activeTab, setActiveTab] = useState("recipes");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const followTag = useMemo(() => {
    return guessFollowees.some((fle) => fle?.id === pageAuthor?.id) ? "Đang theo dõi" : "Theo dõi";
  }, [guessFollowees, pageAuthor]);

  // Tạo danh sách các tab
  const tabs = useMemo(() => {
    const allTabs = [
      {
        id: 'recipes',
        label: 'Công thức đã đăng',
        icon: ChefHat,
        count: publicRecipes.length,
        show: true
      },
      {
        id: 'private-recipes',
        label: 'Công thức riêng',
        icon: Lock,
        count: privateRecipes.length,
        show: pageAuthor?.id === currentUser?.id
      },
      {
        id: 'loved',
        label: 'Đã yêu thích',
        icon: Heart,
        count: myLovedRecipes.length,
        show: pageAuthor?.id === currentUser?.id
      },
      {
        id: 'saved',
        label: 'Đã lưu',
        icon: Bookmark,
        count: mySavedRecipes.length,
        show: pageAuthor?.id === currentUser?.id
      },
      {
        id: 'followers',
        label: 'Người theo dõi',
        icon: Users,
        count: followers.length,
        show: true
      },
      {
        id: 'following',
        label: 'Đang theo dõi',
        icon: User,
        count: followees.length,
        show: true
      }
    ];

    return allTabs.filter(tab => tab.show);
  }, [publicRecipes.length, privateRecipes.length, myLovedRecipes.length, mySavedRecipes.length, followers.length, followees.length, pageAuthor?.id, currentUser?.id]);

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const loadPageAuthor = () => {
    const author = location.state?.author;
    if (author) { setPageAuthor(author); setIsOwner(false) }
    else { setPageAuthor(currentUser); setIsOwner(true) }
  }

  // load recipes cua chu trang
  const loadPublicRecipes = async () => {
    let result;
    if (isOwner) {
      result = await recipesResponse();
    } else {
      result = await someoneRecipesResponse(pageAuthor.id);
    }
    if (result !== null && Array.isArray(result)) {
      setPublicRecipes(result);
    }
  }

  const loadPrivateRecipes = async () => {
    if (!isOwner) { return }
    const result = await privateRecipeResponse();
    if (result.status === HttpStatusCode.Ok) {
      setPrivateRecipes(result.data);
    }
  }

  const loadPrivateRecipeMainImages = async () => {
    if (privateRecipes.length === 0) return;
    const ids = privateRecipes.map((recipe) => recipe.id);
    const result = await mainImagesResponse(ids);
    if (result !== null) {
      setPrivateRecipeMainImages(result);
    }
  }

  // Load anh hien thi
  const loadPublicRecipeMainImages = async () => {
    if (publicRecipes.length === 0) return;
    const ids = publicRecipes.map((recipe) => recipe.id);
    const result = await mainImagesResponse(ids);
    if (result !== null) {
      setPublicRecipeMainImages(result);
    }
  }

  const loadLovedMainImages = async () => {
    if (myLovedRecipes.length === 0) return;
    const ids = myLovedRecipes.map((recipe) => recipe.id);
    const result = await mainImagesResponse(ids);
    if (result !== null) {
      setLovedMainImages(result);
    }
  }

  const loadSavedMainImages = async () => {
    if (mySavedRecipes.length === 0) return;
    const ids = mySavedRecipes.map((recipe) => recipe.id);
    const result = await mainImagesResponse(ids);
    if (result !== null) {
      setSavedMainImages(result);
    }
  }

  // Load followers, followees
  const loadFollowees = async () => {
    const result = await someoneFolloweesResponse(pageAuthor?.id);
    if (result.status === HttpStatusCode.Ok && Array.isArray(result.data)) {
      setFollowees(result.data);
      if (isOwner) {
        usePersonalStore.getState().setFollowees(result.data);
      }
    }
  }

  const loadFollowers = async () => {
    const result = await someoneFollowersResponse(pageAuthor?.id);
    if (result.status === HttpStatusCode.Ok && Array.isArray(result.data)) {
      setFollowers(result.data);
      if (isOwner) {
        usePersonalStore.getState().setFollowers(result.data);
      }
    }
  }

  // Xu ly thay doi avatar
  const handleChangeAvtClick = () => {
    if (!isOwner) { return };
    fileInputRef.current?.click();
  }

  const handleAvtChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const response = await uploadImageToCloudinary(file);
      alert("Public id: " + response.publicId)
      const result = await updateAvt({ avatarUrl: response.secureUrl, publicId: response.publicId });
      if (result && result.status === HttpStatusCode.Ok) {
        useAuthStore.getState().setCurrentUser({ ...currentUser, avatarUrl: response.secureUrl });
        setPageAuthor((prev) => ({ ...prev, avatarUrl: response.secureUrl }));
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi avatar:", error);
      alert("Thay đổi avatar thất bại.");
    } finally {
      e.target.value = null;
    }
  }
  const handleUsernameUpdate = async () => {
    const cleandUsername = newUsername.trim()
      .replace(/\s+/g, ' ') //Giữ 1 khoảng trắng giữa các từ
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join();

    const usernameWords = cleandUsername.split(' ');
    if (usernameWords.length < 2 || !usernameWords.every(word => /^[A-Za-zÀ-ỹ]+$/.test(word))) {
      alert("Tên người dùng không hợp lệ! Tên người dùng cần có ít nhất 2 từ và chỉ chứa chữ cái");
      return;
    }

    const res = await updateUsername({ cleandUsername });
    if (res && res.status === 200) {
      // alert("Đã cập nhật username");
      setIsEditingUsername(false);
      const updatedUser = { ...currentUser, username: cleandUsername }
      useAuthStore.getState().setCurrentUser(updatedUser);
      setPageAuthor(updatedUser);
    }
  };

  // xu ly hanh vi follow
  const handleFollow = async (followee) => {
    if (isOwner) return;

    const result = await followActResponse(followee.id);
    if (result.status !== HttpStatusCode.Ok) return alert("failed");

    const myFollowees = usePersonalStore.getState().followees || [];
    const isFollowing = myFollowees?.some(f => f.id === followee.id);

    const updatedFollowees = isFollowing
      ? myFollowees.filter(f => f.id !== followee.id)
      : [...myFollowees, followee];

    usePersonalStore.getState().setFollowees(updatedFollowees);

    // Cập nhật followers bằng callback để tránh dùng giá trị cũ
    setFollowers(prev =>
      isFollowing
        ? prev.filter(f => f.id !== currentUser.id)
        : [...prev, currentUser]
    );

    // setFollowTag(isFollowing ? "Theo dõi" : "Đang theo dõi");
  };

  const handleUpdateRecipe = (recipe) => {
    navigate(path.CREATERECIPE, { state: { updateRecipe: recipe } });
  }

  const handlePublish = async (recipe) => {
    try {
      const result = await requiredPublicResponse(recipe.id);
      if (result.status === HttpStatusCode.Ok) {
        const recipes = useCommonStore.getState().recipes;
        useCommonStore.getState().setRecipes([recipe, ...recipes]);
        setPrivateRecipes(privateRecipes.filter((r) => r.id !== recipe.id));
        setPublicRecipes([recipe, ...publicRecipes]);
      }
    } catch (error) {
      alert(error.message)
      console.error("Đăng tải bài viết thất bại");
    }
  }

  const handleDeleteRecipe = async (recipeId, isPublic) => {
    const result = await deleteResponse(recipeId);
    if (result?.status === HttpStatusCode.Ok) {
      if (isPublic) {
        if (isPublic) {
          const newMyPublicRecipes = publicRecipes.filter(r => r.id != recipeId);
          setPublicRecipes(newMyPublicRecipes);
        } else {
          const newMyPrivateRecipes = privateRecipes.filter(r => r.id !== recipeId);
          setPrivateRecipes(newMyPrivateRecipes);
        }
      }
    }
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  }

  useEffect(() => {
    if (currentUser === null) {
      navigate(path.LOGIN);
      return;
    }
    loadPageAuthor();
  }, [location.key]);

  useEffect(() => {
    if (pageAuthor !== null) {
      loadPublicRecipes();
      loadPrivateRecipes();
      loadFollowees();
      loadFollowers();
    }
  }, [pageAuthor]);

  useEffect(() => {
    if (publicRecipes.length) {
      loadPublicRecipeMainImages();
    }
  }, [publicRecipes]);

  useEffect(() => {
    if (privateRecipes.length) {
      loadPrivateRecipeMainImages();
    }
  }, [privateRecipes]);

  useEffect(() => {
    if (myLovedRecipes.length) loadLovedMainImages();
  }, [myLovedRecipes]);

  useEffect(() => {
    if (mySavedRecipes.length) loadSavedMainImages();
  }, [mySavedRecipes]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 h-32 sm:h-48 w-full"></div>

      {/* Thông tin profile */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-12 sm:-mt-16">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="relative flex justify-center sm:justify-start mb-4 sm:mb-0">
                <img
                  src={pageAuthor?.avatarUrl || "https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp"}
                  alt={pageAuthor?.username}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md object-cover"
                />
                {/* handleChangeAvtClick */}
                {pageAuthor?.id === currentUser?.id && (
                  <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-green-500 p-1 rounded-full text-white cursor-pointer" onClick={handleChangeAvtClick}>
                    <Edit size={14} className="sm:w-4 sm:h-4" />
                  </span>
                )}
                <input
                  type='file'
                  accept='/image/*'
                  ref={fileInputRef}
                  onChange={handleAvtChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Thông tin người dùng */}
              <div className="sm:ml-6 flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-center sm:text-left flex items-center gap-2">
                    {isEditingUsername ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        />
                        <button
                          className="text-orange-600 font-medium"
                          onClick={handleUsernameUpdate}
                        >
                          Lưu
                        </button>
                        <button
                          className="text-gray-500 hover:text-red-500"
                          onClick={() => setIsEditingUsername(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {pageAuthor?.username}
                        </h1>
                        {pageAuthor?.id === currentUser?.id && (
                          <button
                            className="text-green-500 hover:text-red-700"
                            onClick={() => setIsEditingUsername(true)}
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  {pageAuthor?.id !== currentUser?.id && (
                    <button className="mt-3 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-full font-medium transition-colors duration-300 min-w-28 sm:min-w-40 self-center sm:self-auto"
                      onClick={() => handleFollow(pageAuthor)}
                    >
                      {followTag}
                    </button>
                  )}
                </div>

                {/* Thông tin chi tiết - Layout cho mobile */}
                <div className="mt-4">
                  {/* Mobile: 2 cột grid */}
                  <div className="grid grid-cols-1 gap-2 sm:hidden">
                    <div className="flex items-center justify-start">
                      <Calendar size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Tham gia: {new Date(pageAuthor?.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="flex items-center ">
                      <div className="flex items-center">
                        <Users size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Người theo dõi: </span>
                        <span className="ml-2 text-sm font-semibold text-gray-900">{followers?.length > 0 ? followers?.length : 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Đang theo dõi: </span>
                        <span className="ml-2 text-sm font-semibold text-gray-900">{followees?.length > 0 ? followees?.length : 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Hiển thị ngang */}
                  <div className="hidden sm:flex sm:flex-wrap sm:gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span>Tham gia: {new Date(pageAuthor?.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span><strong>{followers?.length > 0 ? followers?.length : 0}</strong> người theo dõi</span>
                    </div>
                    <div className="flex items-center">
                      <User size={16} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span>Đang theo dõi <strong>{followees?.length > 0 ? followees?.length : 0}</strong> người</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow-md">
          {/* Desktop Navigation */}
          <div className="hidden md:flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`px-4 lg:px-6 py-4 font-medium text-sm flex items-center transition-colors duration-300 whitespace-nowrap ${activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-orange-500'
                    }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="relative">
              <button
                className="w-full px-4 py-4 flex items-center justify-between text-gray-800 hover:text-orange-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="flex items-center">
                  {currentTab && (
                    <>
                      <currentTab.icon size={18} className="mr-2" />
                      <span className="font-medium">{currentTab.label} ({currentTab.count})</span>
                    </>
                  )}
                </div>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Mobile Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg rounded-b-lg z-10">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className={`w-full px-4 py-3 flex items-center text-left hover:bg-gray-50 transition-colors ${activeTab === tab.id ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                          }`}
                        onClick={() => handleTabChange(tab.id)}
                      >
                        <Icon size={18} className="mr-3" />
                        <span>{tab.label} ({tab.count})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-100 rounded-xl">
        <CreateRecipeButton />

        {/* Content Based on Active Tab */}
        <div className="mb-8">
          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 pt-4">Công thức đã đăng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.isArray(publicRecipes) && publicRecipes?.map((recipe, index) => (
                  <div key={recipe.id}
                    onClick={() => { sessionStorage.setItem("selectedRecipe", JSON.stringify(recipe)); navigate(path.RECIPEDETAIL) }}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                    <ImageWithFallback
                      src={recipe.imagesUrl[0]}
                      alt={recipe.title}
                      className="w-full h-36 sm:h-48 object-cover"
                    />
                    <div className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{recipe.title}</h3>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-gray-600">
                            <Heart size={16} className="mr-1 text-red-500" />
                            <span className="text-sm">{recipe.loveCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock size={16} className="mr-1" />
                          <span className="text-sm">{recipe.cookTime}</span>
                        </div>
                      </div>
                      {currentUser.id === pageAuthor.id && <div className='flex items-center space-x-2 mt-2'>
                        <CustomButton
                          classname="ml-auto bg-emerald-600 text-emerald-100 p-2 hover:bg-cyan-800 hover:text-white"
                          content={<span>Chỉnh sửa</span>}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateRecipe(recipe)
                          }}
                        />
                        <CustomButton
                          classname="bg-gray-400 p-2 text-gray-100 hover:bg-red-600"
                          content={<span>Xóa</span>}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecipe(recipe.id, true);
                          }}
                        />
                      </div>}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Private recipes */}
          {activeTab === 'private-recipes' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Công thức riêng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
                {Array.isArray(privateRecipes) && privateRecipes?.map((recipe, index) => (
                  <div
                    onClick={() => {
                      sessionStorage.setItem("selectedRecipe", JSON.stringify(recipe));
                      navigate(path.RECIPEDETAIL);
                    }}
                    key={recipe.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full"
                  >
                    <ImageWithFallback
                      src={privateRecipeMainImages[index]?.url}
                      alt={recipe.title}
                      className="w-full h-36 sm:h-60"
                    />
                    <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 overflow-hidden">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{recipe.title}</h3>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-gray-600">
                              <Heart size={16} className="mr-1 text-red-500" />
                              <span className="text-sm">{recipe.loveCount}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock size={16} className="mr-1" />
                            <span className="text-sm">{recipe.cookTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Các nút điều khiển */}
                      <div className="flex flex-col items-center mt-4 space-y-2">
                        {/* Nút Đăng tải */}
                        <CustomButton
                          classname="w-4/5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold py-2 rounded-lg shadow-md hover:scale-105 hover:brightness-110 transition-transform duration-200"
                          content={<span>🚀 Đăng tải</span>}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublish(recipe);
                          }}
                        />

                        {/* Nhóm nút Chỉnh sửa và Xóa */}
                        <div className="flex justify-center space-x-3">
                          <CustomButton
                            classname="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-200"
                            content={<span>✏️ Chỉnh sửa</span>}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateRecipe(recipe);
                            }}
                          />
                          <CustomButton
                            classname="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-200"
                            content={<span>🗑️ Xóa</span>}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRecipe(recipe.id, false);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Loved tab */}
          {activeTab === 'loved' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Công thức đã thích</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {myLovedRecipes.length > 0 && myLovedRecipes?.map((recipe, index) => (
                  <div
                    key={recipe.id}
                    onClick={() => { sessionStorage.setItem("selectedRecipe", JSON.stringify(recipe)), navigate(path.RECIPEDETAIL) }}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <ImageWithFallback
                      src={lovedMainImages[index]?.url}
                      alt={recipe.title}
                      className="w-full h-36 sm:h-48"
                    />

                    <div className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{recipe.title}</h3>
                      {/* <p className="text-sm text-gray-600 mt-1">Đăng bởi: {recipe.authorId}</p> */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Heart size={16} className="mr-1 text-red-500" />
                          <span className="text-sm">Đã thích</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Recipes Tab */}
          {activeTab === 'saved' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Công thức đã lưu</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {mySavedRecipes.length > 0 && mySavedRecipes?.map((recipe, index) => (
                  <div
                    key={recipe.id}
                    onClick={() => { sessionStorage.setItem("selectedRecipe", JSON.stringify(recipe)), navigate(path.RECIPEDETAIL) }}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <ImageWithFallback
                      src={savedMainImages[index]?.url}
                      alt={recipe.title}
                      className="w-full h-36 sm:h-48"
                    />

                    <div className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{recipe.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Đăng bởi: {recipe.authorId}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Heart size={16} className="mr-1 text-red-500" />
                          <span className="text-sm">Đã thích</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Followers Tab */}
          {activeTab === 'followers' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Người theo dõi</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(followers) && followers?.map((follower, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-3 sm:p-4 flex items-center">
                    <img
                      src={follower?.avatarUrl || "https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp"}
                      alt="Follower"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                    <div className="ml-3 sm:ml-4">
                      <p className="text-sm sm:text-base">Bếp trưởng <strong className='text-blue-700 hover:text-orange-600 cursor-pointer'
                        onClick={() => navigate(path.PERSONAL, { state: { author: follower } })}>{follower?.username}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Following Tab */}
          {activeTab === 'following' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Đang theo dõi</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(followees) && followees?.map((followee, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-3 sm:p-4 flex items-center">
                    <img
                      src={followee?.avatarUrl || "https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp"}
                      alt="Following"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                    <div className="ml-3 sm:ml-4">
                      <p className="text-sm sm:text-base">Bếp trưởng <strong className='text-blue-700 hover:text-orange-600 cursor-pointer'
                        onClick={() => navigate(path.PERSONAL, { state: { author: followee } })}>{followee?.username}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;