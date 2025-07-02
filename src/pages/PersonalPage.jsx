import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Edit, Calendar, Users, User, ChefHat, Clock } from 'lucide-react';
import { shallow } from 'zustand/shallow';

/* ---------- STORES ---------- */
import useAuthStore from '../store/useAuthStore';
import usePersonalStore from '../store/usePersonalStore';

/* ---------- API ---------- */
import myData from '../api/personal/me';
import recipesResponse from '../api/personal/getMyRecipes';
import mainImagesResponse from '../api/personal/getMainImages';
import followActResponse from '../api/interaction/follow';
import someoneFollowersResponse from '../api/someone/getFollowers';
import someoneFolloweesResponse from '../api/someone/getFollowees';

/* ---------- OTHER ---------- */
import { uploadImageToCloudinary } from '../services/cloudinary';
import { updateAvt } from '../api/personal/me';
import { HttpStatusCode } from 'axios';
import path from '../utils/path';
import ImageWithFallback from '../component/ImageWithFallBack';
import someoneRecipesResponse from '../api/someone/getRecipes';

const PersonalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef();

  const [pageAuthor, setPageAuthor] = useState(null);
  const currentUser = useAuthStore.getState().currentUser;
  const [pageAuthorRecipes, setPageAuthorRecipes] = useState([]);
  const [isOwner, setIsOwner] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [followees, setFollowees] = useState([]);
  // neu currentUser la chu trang thi moi load loved+saved
  const myLovedRecipes = usePersonalStore((state) => state.lovedRecipes);
  const mySavedRecipes = usePersonalStore((state) => state.savedRecipes);

  //anh hien thi
  const [recipeMainImages, setRecipeMainImages] = useState([]);
  const [lovedMainImages, setLovedMainImages] = useState([]);
  const [savedMainImages, setSavedMainImages] = useState([]);
  // Trang thai cho button theo doi
  const [followTag, setFollowTag] = useState("Theo dõi");
  // 
  const [activeTab, setActiveTab] = useState("recipes");

  const loadPageAuthor = () => {
    const author = location.state?.author;
    if (author) { setPageAuthor(author); setIsOwner(false) }
    else { setPageAuthor(currentUser); setIsOwner(true) }
  }
  // load recipes cua chu trang
  const loadPageAuthorRecipes = async () => {
    let result;
    if (isOwner) {
      result = await recipesResponse();
    } else {
      result = await someoneRecipesResponse(pageAuthor.id);
    }
    if (result !== null && Array.isArray(result)) {
      setPageAuthorRecipes(result);
    }
  }

  // Load anh hien thi
  const loadRecipeMainImages = async () => {
    if (pageAuthorRecipes.length === 0) return;
    const ids = pageAuthorRecipes.map((recipe) => recipe.id);
    const result = await mainImagesResponse(ids);
    if (result !== null) {
      setRecipeMainImages(result);
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
    const result = await someoneFolloweesResponse(pageAuthor.id);
    if (result.status === HttpStatusCode.Ok && Array.isArray(result.data)) {
      setFollowees(result.data);
      if (isOwner) {
        usePersonalStore.getState().setFollowees(result.data);
      }
    }
  }

  const loadFollowers = async () => {
    const result = await someoneFollowersResponse(pageAuthor.id);
    if (result.status === HttpStatusCode.Ok && Array.isArray(result.data)) {
      setFollowers(result.data);
      if (isOwner) {
        usePersonalStore.getState().setFollowers(result.data);
      }
    }
  }
  // xử lý trạng thái cho button theo dõi
  const handleChangeFollowTag = () => {
    if (isOwner) return;
    const oldTag = followTag;
    const newTag = followees.some((followee) => followee.id === pageAuthor.id) ? "Đang theo dõi" : "Theo dõi";
    if (oldTag !== newTag) {
      setFollowTag(newTag);
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
      // setLoading(true);
      const secureUrl = await uploadImageToCloudinary(file);
      await updateAvt({ username: pageAuthor.username, newAvtUrl: secureUrl });
      setPageAuthor((prev) => ({ ...prev, avatarUrl: secureUrl }));

    } catch (error) {
      console.error("Lỗi khi thay đổi avatar:", err);
      alert("Thay đổi avatar thất bại.");
    } finally {
      // setLoading(false);
      e.target.value = null;
    }
  }
  // xu ly hanh vi follow
  const handleFollow = async (followeeId) => {
    if (isOwner) return;

    const result = await followActResponse(followeeId);
    if (result.status !== HttpStatusCode.Ok) return alert("failed");

    const myFollowees = usePersonalStore.getState().followees || [];
    const isFollowing = myFollowees.some(f => f.id === pageAuthor.id);

    const updatedFollowees = isFollowing
      ? myFollowees.filter(f => f.id !== pageAuthor.id)
      : [...myFollowees, pageAuthor];

    usePersonalStore.getState().setFollowees(updatedFollowees);

    // ✅ Cập nhật followers bằng callback để tránh dùng giá trị cũ
    setFollowers(prev =>
      isFollowing
        ? prev.filter(f => f.id !== currentUser.id)
        : [...prev, currentUser]
    );

    setFollowTag(isFollowing ? "Theo dõi" : "Đang theo dõi");
  };

  useEffect(() => {
    if (currentUser === null) { navigate(path.LOGIN); return }
    loadPageAuthor();
  }, []);

  useEffect(() => {
    if (pageAuthor !== null) {
      loadPageAuthorRecipes();
      loadFollowees();
      loadFollowers();
    }
  }, [pageAuthor]);

  useEffect(() => {
    handleChangeFollowTag();
  }, [followers]);

  useEffect(() => {
    if (pageAuthorRecipes.length) {
      loadRecipeMainImages();                      // <- chạy LẦN NÀO cũng có dữ liệu
    }
  }, [pageAuthorRecipes]);
  useEffect(() => {
    if (myLovedRecipes.length) loadLovedMainImages();
  }, [myLovedRecipes]);

  useEffect(() => {
    if (mySavedRecipes.length) loadSavedMainImages();
  }, [mySavedRecipes]);


  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 h-48 w-full"></div>

      {/* Thông tin profile */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={pageAuthor?.avatarUrl || "https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp"}
                  alt={pageAuthor?.username}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                />
                {/* handleChangeAvtClick */}
                {isOwner && <span className="absolute bottom-2 right-2 bg-green-500 p-1 rounded-full text-white" onClick={() => { handleChangeAvtClick() }}>
                  <Edit size={16} />
                </span>}
                <input
                  type='file'
                  accept='/image/*'
                  ref={fileInputRef}
                  onChange={handleAvtChange}//
                  style={{ display: 'none' }}
                />
              </div>

              {/* Thông tin người dùng */}
              <div className="mt-4 md:mt-0 md:ml-6 flex-grow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{pageAuthor?.username}</h1>
                  </div>
                  {!isOwner && <button className="mt-3 md:mt-0 bg-orange-500 hover:bg-orange-600
                   text-white py-2 px-4 rounded-full font-medium transition-colors duration-300"
                    onClick={() => handleFollow(pageAuthor.id)}
                  >
                    {followTag}
                  </button>}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar size={18} className="mr-1 text-orange-500" />
                    <span>Tham gia: {new Date(pageAuthor?.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={18} className="mr-1 text-orange-500" />
                    <span><strong>{followers.length > 0 ? followers.length : 0}</strong> người theo dõi</span>
                  </div>
                  <div className="flex items-center">
                    <User size={18} className="mr-1 text-orange-500" />
                    <span>Đang theo dõi <strong>{followees.length > 0 ? followees.length : 0}</strong> người</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex overflow-x-auto">
          <button
            className={`px-6 py-4 font-medium text-sm flex items-center transition-colors duration-300 ${activeTab === 'recipes' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
            onClick={() => setActiveTab('recipes')}
          >
            <ChefHat size={18} className="mr-2" />
            Công thức ({pageAuthorRecipes.length})
          </button>

          {isOwner && (
            <>
              <button
                className={`px-6 py-4 font-medium text-sm flex items-center transition-colors duration-300 ${activeTab === 'loved' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
                onClick={() => setActiveTab('loved')}
              >
                <Heart size={18} className="mr-2" />
                Đã yêu thích ({myLovedRecipes.length})
              </button>

              <button
                className={`px-6 py-4 font-medium text-sm flex items-center transition-colors duration-300 ${activeTab === 'saved' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
                onClick={() => setActiveTab('saved')}
              >
                <Bookmark size={18} className="mr-2" />
                Đã lưu ({mySavedRecipes.length})
              </button>
            </>
          )}

          <button
            className={`px-6 py-4 font-medium text-sm flex items-center transition-colors duration-300 ${activeTab === 'followers' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
            onClick={() => setActiveTab('followers')}
          >
            <Users size={18} className="mr-2" />
            Người theo dõi ({followers.length})
          </button>

          <button
            className={`px-6 py-4 font-medium text-sm flex items-center transition-colors duration-300 ${activeTab === 'following' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
            onClick={() => setActiveTab('following')}
          >
            <User size={18} className="mr-2" />
            Đang theo dõi ({followees.length})
          </button>
        </div>
      </div>

      {/* Content Based on Active Tab */}
      <div className="mb-8">
        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Công thức đã đăng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(pageAuthorRecipes) && pageAuthorRecipes?.map((recipe, index) => (
                <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                  <img
                    src={recipeMainImages[index]?.url}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{recipe.title}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-600">
                          <Heart size={16} className="mr-1 text-red-500" />
                          <span>{recipe.loveCount}</span>
                        </div>
                        {/* <div className="flex items-center text-gray-600">
                            <span>{recipe.comments} bình luận</span>
                          </div> */}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={16} className="mr-1" />
                        <span>{recipe.cookTime}</span>
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
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Công thức đã thích</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLovedRecipes.length > 0 && myLovedRecipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <ImageWithFallback
                    src={lovedMainImages[index]?.url}
                    alt={recipe.title}
                    classname="w-full h-48"
                  />

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{recipe.title}</h3>
                    <p className="text-gray-600">Đăng bởi: {recipe.authorId}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Heart size={16} className="mr-1 text-red-500" />
                        <span>Đã thích</span>
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
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Công thức đã lưu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySavedRecipes.length > 0 && mySavedRecipes.map((recipe, index) => (
                  <div
                    key={recipe.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <ImageWithFallback
                      src={savedMainImages[index]?.url}
                      alt={recipe.title}
                      classname="w-full h-48"
                    />

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{recipe.title}</h3>
                      <p className="text-gray-600">Đăng bởi: {recipe.authorId}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Heart size={16} className="mr-1 text-red-500" />
                          <span>Đã thích</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Followers Tab */}
        {activeTab === 'followers' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Người theo dõi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(followers) && followers.map((follower, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center">
                  <img
                    src={"https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp"}
                    alt="Follower"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    {/* <h3 className="font-medium text-gray-900">Người dùng {index + 1}</h3> */}
                    <p className="text-sm text-gray-600">{follower?.username}</p>

                  </div>
                  <button className="ml-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors">
                    Theo dõi lại
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Đang theo dõi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(followees) && followees.map((followee, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center">
                  <img
                    src={"https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp"}
                    alt="Following"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Đầu bếp {index + 1}</h3>
                    <p className="text-sm text-gray-600">{followee?.username}</p>
                  </div>
                  <button className="ml-auto bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full text-sm transition-colors">
                    Đang theo dõi
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalPage;