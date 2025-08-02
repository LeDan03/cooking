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
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ImageIcon,
  Trash2Icon, Trash2, Reply, MoreHorizontal, X,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
/* ---------- STORES ---------- */
import useAuthStore from '../store/useAuthStore';
import useCommonStore from '../store/useCommonStore';
import usePersonalStore from '../store/usePersonalStore';

/* ---------- API ---------- */
import accountResponse from '../api/account/getAccount';
import unitsResponse from '../api/unit/getAllUnit';
import saveResponse from '../api/interaction/save';
import loveResponse from '../api/interaction/love';
import commentsResponse from '../api/recipe/comment/getRecipeComments';
import commentResponse from '../api/recipe/comment/comment';
import { deleteResponse } from '../api/recipe/comment/comment';
import similarRecipesResponse from '../api/recipe/recipe/similarRecipes';
/* ---------- UTILS ---------- */
import path from '../utils/path';
import { HttpStatusCode } from 'axios';
import CreateRecipeButton from '../component/CreateRecipeButton';
import { toast } from 'react-toastify';
import { uploadImageToCloudinary } from '../services/cloudinary';
import ImageWithFallback from '../component/ImageWithFallBack';

const formatCommentTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)} giờ trước`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  }
};

const SimilarRecipes = ({ recipeId, keyword = "" }) => {
  const navigate = useNavigate();
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reached, setReached] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const hasMoreRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const nearEndRef = useRef(null);


  const fetchedPagesRef = useRef(new Set());

  const loadSimilarRecipes = async (recipeId, keyword, page, size = 20) => {
    const key = `${recipeId}_${page}`;
    if (fetchedPagesRef.current.has(key)) {
      // console.log("Đã load rồi, skip:", key);
      return;
    }

    fetchedPagesRef.current.add(key);
    isLoadingMoreRef.current = true;

    const result = await similarRecipesResponse(recipeId, keyword, page, size);

    if (result && Array.isArray(result) && result.length > 0) {
      setSimilarRecipes((prev) => [...prev, ...result]);

      if (result.length < size) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } else {
      hasMoreRef.current = false;
      setHasMore(false);
    }

    isLoadingMoreRef.current = false;
  };

  useEffect(() => {
    setSimilarRecipes([]);
    setHasMore(true);
    hasMoreRef.current = true;
    isLoadingMoreRef.current = false;

    loadSimilarRecipes(recipeId, keyword, 0);
    setCurrentPage(0);
  }, [recipeId, keyword]);


  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);


  useEffect(() => {
    if (!nearEndRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreRef.current && !isLoadingMoreRef.current) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadSimilarRecipes(recipeId, keyword, nextPage);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.2,
      }
    );

    observer.observe(nearEndRef.current);

    return () => {
      if (nearEndRef.current) observer.unobserve(nearEndRef.current);
    };
  }, [recipeId, keyword]);

  if (!similarRecipes || similarRecipes.length === 0) return null;

  return (
    <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-8 xs:pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg xs:rounded-xl shadow-lg p-4 xs:p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4 xs:mb-6">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <ChefHat className="w-5 h-5 xs:w-6 xs:h-6 mr-2 text-orange-500" />
              Công thức tương tự
            </h2>
            <span className="text-sm xs:text-base text-gray-500">
              {similarRecipes.length} món ăn
            </span>
          </div>

          {/* Recipe Cards Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
            {similarRecipes.map((recipe, index) => {
              const isNearEnd = index === similarRecipes.length - 3;

              return (
                <div
                  key={recipe.id}
                  ref={isNearEnd ? nearEndRef : null}
                  className="bg-white rounded-lg xs:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden cursor-pointer group"
                  onClick={() => {
                    sessionStorage.setItem("selectedRecipe", JSON.stringify(recipe));
                    navigate(path.RECIPEDETAIL);
                  }}
                >
                  {/* Recipe Image */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <ImageWithFallback
                      src={recipe.imagesUrl?.[0]}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Overlay */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                      {recipe.cookTime + recipe.prepTime} phút
                    </div>

                    {/* Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${recipe.difficultyId === 1
                        ? 'bg-green-100 text-green-800'
                        : recipe.difficultyId === 2
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {recipe.difficultyId === 1 ? 'Dễ' : recipe.difficultyId === 2 ? 'Trung bình' : 'Khó'}
                      </span>
                    </div>
                  </div>

                  {/* Recipe Content */}
                  <div className="p-3 xs:p-4">
                    <h3 className="font-semibold text-gray-900 text-sm xs:text-base leading-tight mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {recipe.title}
                    </h3>

                    <p className="text-gray-600 text-xs xs:text-sm line-clamp-2 mb-3 leading-relaxed">
                      {recipe.content}
                    </p>

                    <div className="flex items-center justify-between text-xs xs:text-sm text-gray-500 border-t pt-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
                          <span>{recipe.prepTime}p</span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
                          <span>{recipe.servings}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Heart className="w-3 h-3 xs:w-4 xs:h-4 mr-1 text-red-500" />
                          <span>{recipe.loveCount}</span>
                        </div>
                        <div className="flex items-center">
                          <Bookmark className="w-3 h-3 xs:w-4 xs:h-4 mr-1 text-blue-500" />
                          <span>{recipe.saveCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {isLoadingMore && (
            <div className="flex justify-center mt-6 text-sm text-gray-500 italic">
              Đang tải thêm...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RecipeDetail = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { patchRecipe } = useCommonStore.getState();
  const { patchLoved, patchSaved } = usePersonalStore.getState();

  const [recipeData, setRecipeData] = useState({});
  const [units, setUnits] = useState([]);
  const [cmtImg, setCmtImg] = useState(null);
  const [isLoved, setIsLoved] = useState(false);
  const [loveCount, setLoveCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [author, setAuthor] = useState({});
  const [difficulty, setDifficulty] = useState('');
  const [loveDisable, setLoveDisable] = useState(false);
  const [saveDisable, setSaveDisable] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [lastRecipeId, setLastRecipeId] = useState(null);
  const savedList = usePersonalStore((state) => state.savedRecipes)
  const lovedList = usePersonalStore((state) => state.lovedRecipes);

  useEffect(() => {
    if (recipeData?.id && recipeData.id !== lastRecipeId) {
      setLastRecipeId(recipeData.id);
    }
  }, [recipeData]);

  const loadSelectedRecipe = () => {
    const rawData = sessionStorage.getItem('selectedRecipe');
    if (!rawData) navigate(path.HOME);

    const data = JSON.parse(rawData);
    setRecipeData(data);

    const savedStatus = savedList.some((r) => r.id === data.id);
    const lovedStatus = lovedList.some((r) => r.id === data.id);

    setIsSaved(savedStatus);
    setIsLoved(lovedStatus);
    setLoveCount(data.loveCount || 0);
    setSaveCount(data.saveCount || 0);
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
    const match = units.find((unit) => unit.id === unitId);
    return match ? match.name : "N/A";
  };

  const loadComments = async () => {
    const result = await commentsResponse(recipeData.id);
    if (result && result.status === HttpStatusCode.Ok) {
      setComments(result.data);
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const remainingCommentsCount = comments.length - 3;

  const handleNavigateToAuthor = () => {
    navigate(path.PERSONAL, { state: { author } });
  };

  const handleLove = async () => {
    if (loveDisable) return;
    setLoveDisable(true);
    try {
      const res = await loveResponse(recipeData.id);
      if (!res) return alert('Có lỗi xảy ra, vui lòng thử lại!');

      const newLoved = !isLoved;
      const newCount = newLoved ? loveCount + 1 : loveCount - 1;

      setIsLoved(newLoved);
      setLoveCount(newCount);
      patchRecipe(recipeData.id, { loveCount: newCount });
      patchLoved(recipeData.id, !newLoved); // true = xóa, false = thêm
    } finally {
      setTimeout(() => setLoveDisable(false), 2000);
    }
  };

  const handleSave = async () => {
    if (saveDisable) return;
    setSaveDisable(true);
    try {
      const ok = await saveResponse(recipeData.id);
      if (!ok) return alert('Có lỗi xảy ra, vui lòng thử lại!');

      const newSaved = !isSaved;
      const newCount = newSaved ? saveCount + 1 : saveCount - 1;
      setIsSaved(newSaved);
      setSaveCount(newCount);
      patchRecipe(recipeData.id, { saveCount: newCount });
      patchSaved(recipeData.id, !newSaved); // true = xóa, false = thêm
    } finally {
      setTimeout(() => setSaveDisable(false), 2000);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) {
      setCommentError('Vui lòng nhập nội dung bình luận!');
      return;
    }
    if (!currentUser?.id) {
      toast.apply('Vui lòng đăng nhập để bình luận!');
      navigate(path.LOGIN);
      return;
    }

    setIsCommentLoading(true);
    setCommentError(null);

    try {
      let imageDto = null;
      if (cmtImg) {
        const { secureUrl, publicId } = await uploadImageToCloudinary(cmtImg);
        imageDto = { secureUrl, publicId };
      }

      const cmtReq = {
        accountId: currentUser.id,
        content: comment.trim(),
        imageDto,
        parentId: 0,
      };

      const result = await commentResponse(recipeData.id, cmtReq);
      if (result.status === HttpStatusCode.Ok) {
        // const cmtResult = { ...result.data, commenter: { ...result.data.commenter, username: currentUser.username, avatarUrl: currentUser.avatarUrl } }
        // console.log("server data result", result.data);
        // setComments([cmtResult, ...comments]);
        loadComments();
        setComment('');
        setCmtImg(null);
      } else {
        throw new Error(result.message || 'Không thể đăng bình luận!');
      }
    } catch (error) {
      setCommentError(error.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      console.error('Lỗi khi đăng bình luận:', error);
    } finally {
      setIsCommentLoading(false);
    }
  };

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
      loadComments();
    }
  }, [recipeData]);

  const CommentItem = ({ comment, level = 0 }) => {
    const isReply = level > 0;
    const maxUILevel = 3; // Giới hạn độ sâu hiển thị UI
    const displayLevel = Math.min(level, maxUILevel); // UI chỉ hiển thị tối đa 3 cấp
    const [activeReply, setActiveReply] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyImage, setReplyImage] = useState(null);
    const [replyImagePreview, setReplyImagePreview] = useState(null);
    const [isRepliesCollapsed, setIsRepliesCollapsed] = useState(false);
    const [showAllReplies, setShowAllReplies] = useState(false);
    const fileInputRef = useRef();
    const replyBoxRef = useRef(null);

    const handleReply = (commentId) => {
      setActiveReply(activeReply === commentId ? null : commentId);
      setReplyContent('');
    };

    const onDelete = async (id) => {
      const result = await deleteResponse(id);
      if (result.status === HttpStatusCode.Ok) {
        // Cập nhật lại comments sau khi xóa
        setComments(prev => removeCommentById(prev, id));
        toast.success("Xóa bình luận thành công");
      } else {
        toast.error("Xóa bình luận thất bại");
      }
    };

    const removeCommentById = (comments, id) => {
      return comments
        .filter(comment => comment.id !== id)
        .map(comment => ({
          ...comment,
          replies: comment.replies ? removeCommentById(comment.replies, id) : [],
        }));
    };

    const onReply = async (content, parentId) => {
      let imageDto = null;

      if (replyImage) {
        try {
          imageDto = await uploadImageToCloudinary(replyImage);
        } catch (error) {
          toast.error("Upload ảnh thất bại!");
          return;
        }
      }

      const result = await commentResponse(comment.recipeId, {
        accountId: currentUser.id,
        content,
        imageDto,
        parentId,
      });

      if (result && result.status === HttpStatusCode.Ok) {
        toast.success("Đã gửi phản hồi");
        // Thêm vào replies
        const newReply = result.data;
        if (comment.replies) {
          comment.replies.push(newReply);
        } else {
          comment.replies = [newReply];
        }

        setReplyContent("");
        setReplyImage(null);
        setReplyImagePreview(null);
        setActiveReply(null);

        // Mở rộng replies để hiển thị reply mới
        setIsRepliesCollapsed(false);
      } else {
        toast.error("Trả lời thất bại");
      }
    };

    const submitReply = (parentId) => {
      if (replyContent.trim()) {
        onReply(replyContent, parentId);
        setReplyContent('');
        setActiveReply(null);
      }
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          activeReply === comment.id &&
          replyBoxRef.current &&
          !replyBoxRef.current.contains(event.target)
        ) {
          setActiveReply(null);
          setReplyContent('');
          setReplyImage(null);
          setReplyImagePreview(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [activeReply, comment.id]);

    // Tính toán margin left dựa trên displayLevel
    const getMarginLeft = () => {
      if (displayLevel === 0) return '';
      if (displayLevel === 1) return 'ml-6 sm:ml-8 md:ml-12';
      return 'ml-12 sm:ml-16 md:ml-24'; // cho tới cấp 0-1-2
    };

    // Xác định số lượng replies hiển thị
    const hasReplies = comment.replies && comment.replies.length > 0;
    const shouldShowCollapseButton = hasReplies && comment.replies.length > 3;
    const visibleReplies = hasReplies ?
      (showAllReplies ? comment.replies : comment.replies.slice(0, 3)) : [];

    return (
      <div>
        <div className={`bg-white border rounded-lg p-3 sm:p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200 ${getMarginLeft()} ${isReply ? 'border-l-4 border-l-blue-200' : ''}`}>
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={comment?.commenter?.avatarUrl || "https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp"}
                alt={comment?.commenter.username}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>

            {/* Comment content */}
            <div className="flex-grow min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {comment?.commenter.username}
                  </h4>
                  {isReply && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Reply
                    </span>
                  )}
                  {level > maxUILevel && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Level {level}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
                  {formatCommentTime(comment?.createdAt)}
                </span>
              </div>

              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3">
                {comment?.content}
              </p>

              {/* Comment image if exists */}
              {comment?.imageUrl && (
                <div className="mb-3">
                  <img
                    src={comment?.imageUrl || "https://res.cloudinary.com/dkmql9swy/image/upload/v1747635769/asian-food-traditional-restaurants-cooking-menu-vector-illustration_629712-192_zzr6qj.jpg"}
                    alt="Comment image"
                    className="rounded-lg max-w-full h-auto shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center space-x-4 text-sm">
                {/* Reply button - luôn hiển thị */}
                <button
                  onClick={() => handleReply(comment.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Reply size={16} />
                  <span>Reply</span>
                </button>

                {/* Collapse/Expand replies button */}
                {hasReplies && (
                  <button
                    onClick={() => setIsRepliesCollapsed(!isRepliesCollapsed)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isRepliesCollapsed ? (
                      <>
                        <ChevronDown size={16} />
                        <span>Hiển thị {comment.replies.length} phản hồi</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp size={16} />
                        <span>Thu gọn phản hồi</span>
                      </>
                    )}
                  </button>
                )}

                {currentUser.id === comment.commenter.id && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                )}

                <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Reply form */}
          {activeReply === comment.id && (
            <div className="mt-4 ml-11 sm:ml-14" ref={replyBoxRef}>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />

                {/* Icon chọn ảnh */}
                <div className="flex items-center justify-between mt-2">
                  {replyImage !== null && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors space-x-1"
                    >
                      <ImageIcon size={18} />
                      <span>Thêm ảnh</span>
                    </button>
                  )}

                  {/* Nếu có ảnh preview */}
                  {replyImagePreview && (
                    <div className="relative">
                      <img
                        src={replyImagePreview}
                        alt="Preview"
                        className="rounded max-h-40 border shadow-sm"
                      />
                      <button
                        onClick={() => {
                          setReplyImage(null);
                          setReplyImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 hover:bg-red-100"
                        title="Xoá ảnh"
                      >
                        <X size={14} className="text-red-500" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Input ảnh ẩn */}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setReplyImage(file);
                      setReplyImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />

                {/* Nút hành động */}
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => {
                      setActiveReply(null);
                      setReplyImage(null);
                      setReplyImagePreview(null);
                      setReplyContent('');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => submitReply(comment.id)}
                    className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Trả lời
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Render replies */}
        {hasReplies && !isRepliesCollapsed && (
          <div className="space-y-2">
            {visibleReplies.map((reply, index) => (
              <CommentItem
                key={reply.id || index}
                comment={reply}
                level={level + 1}
              />
            ))}

            {/* Show more/less button */}
            {shouldShowCollapseButton && (
              <div className="ml-6 sm:ml-8 md:ml-12">
                <button
                  onClick={() => setShowAllReplies(!showAllReplies)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  {showAllReplies
                    ? `Thu gọn ${comment.replies.length - 3} phản hồi`
                    : `Xem thêm ${comment.replies.length - 3} phản hồi`
                  }
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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
            loop={Array.isArray(recipeData.imagesUrl) && recipeData.imagesUrl.length > 1}
            className="w-full h-full custom-swiper-pagination"
          >
            {Array.isArray(recipeData.imagesUrl) && recipeData.imagesUrl.length > 0 ? (
              recipeData.imagesUrl.map((imgUrl, index) => (
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
              ))
            ) : (
              <SwiperSlide>
                <div className="relative w-full h-full">
                  <img
                    src="https://res.cloudinary.com/dkmql9swy/image/upload/v1747635769/asian-food-traditional-restaurants-cooking-menu-vector-illustration_629712-192_zzr6qj.jpg"
                    alt="Ảnh mặc định"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        </div>
        {/* Back button - Responsive positioning */}
        <button className="absolute top-2 left-2 xs:top-4 xs:left-4 bg-white/90 backdrop-blur-sm p-2 xs:p-3 rounded-full hover:bg-white transition-all duration-200 shadow-lg">
          <ArrowLeft size={18} className="xs:w-6 xs:h-6 text-gray-800" onClick={() => navigate(path.HOME)} />
        </button>
        {/* Title overlay - Responsive text and padding */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent z-10 p-3 xs:p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white drop-shadow-lg">
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
                      <span className="text-gray-700 text-lg xs:text-base">{ingredient.name + ' (' + ingredient.amount + ' ' + unitName(ingredient.unitId) + ')'}</span>
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
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 xs:mb-4 text-gray-800">
                Bình luận ({comments.length})
              </h2>

              <div className="mb-4 xs:mb-6 flex flex-col xs:flex-row gap-2 items-stretch w-full">

                <div className="flex flex-1">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm xs:text-base"
                  />

                  <label className="cursor-pointer bg-gray-100 border border-l-0 border-gray-300 px-3 flex items-center justify-center hover:bg-gray-200 transition-colors rounded-r-lg">
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCmtImg(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  onClick={handleComment}
                  className="bg-orange-500 text-white px-4 py-3 rounded-lg xs:rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center w-full xs:w-auto"
                >
                  <Send size={18} className="xs:w-5 xs:h-5" />
                  <span className="ml-2 xs:hidden">Gửi</span>
                </button>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {comments.length > 0 && displayedComments?.map((comment, index) => (
                  <CommentItem key={comment.id || index} comment={comment} />
                ))}

                {/* Show more/less button */}
                {comments.length > 3 && (
                  <div className="flex justify-center pt-4 sm:pt-6">
                    <button
                      onClick={() => setShowAllComments(!showAllComments)}
                      className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-full text-gray-700 text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      {showAllComments ? (
                        <>
                          <ChevronUp size={16} className="sm:w-5 sm:h-5" />
                          <span>Thu gọn bình luận</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="sm:w-5 sm:h-5" />
                          <span>Xem thêm {remainingCommentsCount} bình luận</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>
              {cmtImg && (
                <div className="flex items-center gap-4 mt-2 bg-gray-50 p-2 rounded-lg border">
                  <img
                    src={URL.createObjectURL(cmtImg)}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{cmtImg.name}</p>
                    <p className="text-xs text-gray-500">
                      {(cmtImg.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setCmtImg(null)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Xoá ảnh"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {lastRecipeId && (
        <SimilarRecipes
          recipeId={lastRecipeId}
          keyword={recipeData.title?.trim().split(" ")[0]}
        />
      )}

      <CreateRecipeButton />
    </div>
  );
};



export default RecipeDetail;