import React, { useEffect, useState } from 'react';
import {
  Eye, Plus, Trash2, User, FileText, Grid, Building2, CheckCircle, XCircle, MessageSquare,
  ChevronDown, AlertCircle, BarChart2, LogOut
} from 'lucide-react';

// API
import pendingRecipesResponse from '../api/manage/recipes';
import {
  approveRecipeResponse,
  rejectRecipeResponse,
} from '../api/manage/recipes';

import { createReasonResponse, deleteReasonResponse } from '../api/manage/reasons'
import { deleteCategoryResponse, createCategoryResponse } from '../api/manage/categories';
import unitsResponse, { createUnitResponse, deleteUnitResponse } from '../api/manage/units';
import accountsResponse, { toggleAccountStatusResponse } from '../api/manage/accounts';
import reasonsResponse from '../api/manage/reasons';
import categoriesResult from '../api/recipe/recipe/getAllCategory';


import ChartInsightPanel from '../component/ChartInsightPanel';
import createMessageResponse,
{
  adminMessagesResponse,
  deleteMessageResponse,
  sendToAllResponse
} from '../api/manage/messages';

import {
  getMonthlyRegisteredAccountsOfYear,
  getMonthlyRecipeLovesOfYear,
  getWeeklyRecipesOfYear
} from '../api/analytics/adminStatistics/monthlyStatistics';

import getAllIllegalWordsResponse from '../api/manage/illegalWords';

import YearInput from '../component/YearInput';
import Modal from '../component/Modal';

import { HttpStatusCode } from 'axios';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import path from '../utils/path';
import logOutResponse from '../api/auth/logOut';

//chart
import CustomBarChart from '../component/CustomBarChart';

const AdminDashboard = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('statistics');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [warningData, setWarningData] = useState({ title: "", content: '', reasonId: 0, accountIds: [], recipeId: 0 });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newMessageData, setNewMessageData] = useState({ title: '', content: '', accountIds: [], recipeId: -1, reasonId: -1 });
  const [reasons, setReasons] = useState([]);

  const [messages, setMessages] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [usersResponse, setUsersResponse] = useState();
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [units, setUnits] = useState([]);
  const [newReasonContent, setNewReasonContent] = useState('');
  const [newReasonEntity, setNewReasonEntity] = useState('');

  //du lieu cho chart
  const [registeredChartData, setRegisteredChartData] = useState({ dataList: [], year: 0, labelPrefix: 'Tháng' });
  const [lovedRecipesChartData, setLovedRecipesChartData] = useState({ dataList: [], year: 0, labelPrefix: 'Tháng' });
  const [recipesChartData, setRecipesChartData] = useState({ dataList: [], year: 0, labelPrefix: 'Tuần' });

  const [illegalWords, setIllegalWords] = useState([]);

  //hỗ trợ nhập năm
  const currentYear = new Date().getFullYear();
  const [yearRegistered, setYearRegistered] = useState(currentYear);
  const [yearLoved, setYearLoved] = useState(currentYear);
  const [yearRecipe, setYearRecipe] = useState(currentYear);

  //Hỗ trợ phân tích biểu đồ

  const today = new Date();
  const currentMonthIndex = today.getMonth(); // Tháng hiện tại: 0 - 11
  const currentMonth = currentMonthIndex + 1; // Tháng 1 - 12 (dùng để hiển thị hoặc so sánh)

  // Tính tuần hiện tại theo chuẩn ISO (tuần bắt đầu từ thứ 2)
  const getWeekNumber = (date) => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const diff = target - firstThursday;
    return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  };

  const currentWeek = getWeekNumber(today);

  const isValidYear = (year) => /^\d{4}$/.test(year) && +year >= 2000 && +year <= new Date().getFullYear();

  //Thay đổi cách chọn reason cho admin
  const [showReasonTable, setShowReasonTable] = useState(false);

  const handleLogout = async () => {
    const result = await logOutResponse();
    if (result && result.status === HttpStatusCode.Ok) {
      // alert("Đăng xuất thành công");
      setCurrentUser(null);
      navigate(path.HOME)
    } else {
      alert("Đăng xuất thất bại, có lỗi xảy ra");
    }
  }

  const loadRegisteredAccountChartData = async (year = currentYear) => {
    const result = await getMonthlyRegisteredAccountsOfYear(year);
    if (result && result.status === HttpStatusCode.Ok) {
      const list = result.data;
      const year = new Date().getFullYear(); //2025
      setRegisteredChartData({ dataList: list, year: year, labelPrefix: "Tháng" });
    }
  }

  const loadLovedRecipesChartData = async (year = currentYear) => {
    const result = await getMonthlyRecipeLovesOfYear(year);
    if (result && result.status === HttpStatusCode.Ok) {
      const list = result.data;
      const year = new Date().getFullYear();
      setLovedRecipesChartData({ dataList: list, year: year, labelPrefix: "Tháng" });
    }
  }

  const loadWeeklyRecipesChartData = async (year = currentYear) => {
    const result = await getWeeklyRecipesOfYear(year);
    if (result && result.status === HttpStatusCode.Ok) {
      const list = result.data;
      const year = new Date().getFullYear();
      setRecipesChartData({ dataList: list, year: year, labelPrefix: "Tuần" });
      console.log("Recipe list data", result);
    }
  }

  const loadIllegalWords = async () => {
    const result = await getAllIllegalWordsResponse();
    if (result && result.status === HttpStatusCode.Ok) {
      setIllegalWords(result.data);
    }
  }

  const isRecipeHasIllegalWord = (recipe) => {
    return illegalWords.some((w) =>
      recipe.title.toLowerCase().includes(w.word.toLowerCase())
    );
  }

  const loadPendingRecipes = async () => {
    const result = await pendingRecipesResponse();
    if (result.status === HttpStatusCode.Ok) {
      setArticles(result.data);
    }
  }

  const loadReasons = async () => {
    const result = await reasonsResponse();
    if (result.status === HttpStatusCode.Ok) {
      setReasons(result.data);
    }
  }

  const loadCategories = async () => {
    const result = await categoriesResult();
    if (result.status === HttpStatusCode.Ok) {
      setCategories(result.data);
    }
  }

  const loadAccounts = async () => {
    const result = await accountsResponse({ page: 0, size: 20 });
    if (result.status === HttpStatusCode.Ok) {
      setUsersResponse(result.data);
    }
  }

  const loadUnits = async () => {
    const result = await unitsResponse();
    if (result.status === HttpStatusCode.Ok) {
      setUnits(result.data);
    }
  }

  const loadAdminMessages = async () => {
    const result = await adminMessagesResponse();
    if (result && result.status === HttpStatusCode.Ok && result.data.length > 0) {
      setMessages(result.data);
    }
  }

  const handleDeleteMessage = async (id) => {
    const result = await deleteMessageResponse(id);
    if (result && result.status === HttpStatusCode.Ok) {
      setMessages(messages.filter(m => m.id != id));
    }
  }

  const handleSendToAll = async (id) => {
    const message = messages.find(m => m.id === id);
    if (!message || message.isSentToAll) {
      return;
    }
    const result = await sendToAllResponse(id);
    if (result && result.status === HttpStatusCode.Ok) {
      setMessages(prev =>
        prev.map(m =>
          m.id === id ? { ...m, isSentToAll: true } : m
        )
      )
    }
  }

  const handleViewArticle = (article) => {
    setSelectedArticle(article);
    setModalType('view');
    setShowModal(true);
  };

  const handleApprove = async (articleId) => {
    setArticles(articles.filter(a => a.id !== articleId));
    setShowModal(false);
    setSelectedArticle(null);
    const result = await approveRecipeResponse(articleId);
    if (result.status !== HttpStatusCode.Ok) {
      alert("Phê duyệt bài viết thất bại, lỗi hệ thống");
    }
  };

  const handleViolation = () => {
    setModalType('warning');
  };

  const handleSendWarning = async () => {
    if (warningData.reasonId === 0) {
      alert("Vui lòng chọn đủ thông tin");
      return;
    }
    if (activeTab === 'articles' && selectedArticle === null) {
      alert("Vui lòng chọn đủ thông tin");
      return;
    }
    else if (activeTab === 'usersResponse' && selectedUserId === 0) {
      alert("Vui lòng chọn đủ thông tin");
      return;
    }
    let updatedWarning;

    let result;
    if (activeTab === 'articles') {
      updatedWarning = {
        ...warningData,
        recipeId: selectedArticle.id,
        accountIds: [...warningData.accountIds, selectedArticle.authorId]
      };
      result = await rejectRecipeResponse(updatedWarning);
    } else {
      updatedWarning = {
        ...warningData,
        recipeId: 0,
        accountIds: [...warningData.accountIds, selectedUserId]
      };
      result = await createMessageResponse(updatedWarning);
    }
    if (result.data.status !== HttpStatusCode.Ok) {
      console.warn(result.message);
      return;
    }
    if (activeTab === 'articles') {
      setArticles(articles.filter(a => a.id !== selectedArticle.id));
    } else if (activeTab === 'usersResponse') {
      setSelectedUserId(0);
    }
    setShowModal(false);
    setSelectedArticle(null);
    setWarningData({ title: '', content: '', reasonId: 0, accountIds: [], recipeId: 0 });
    navigate(path.ADMIN)
  };

  const handleAddMessage = async (reasonId) => {
    // console.log('New message:', newMessageData);
    // const adminReasonId = reasons.find(r => r.relatedEntityType === 'ADMIN')?.id ?? null;

    const requestData = { ...newMessageData, reasonId: reasonId };

    const result = await createMessageResponse(requestData);
    if (result && result.status === HttpStatusCode.Created) {
      setMessages([result.data, ...messages]);
    }
    setNewMessageData({ title: '', content: '', accountIds: [], recipeId: -1, reasonId: -1 });
    setShowModal(false);
  };

  const handleDeleteCategory = async (category) => {
    const result = await deleteCategoryResponse(category.id);
    if (result && result.status === HttpStatusCode.Ok)
      setCategories(categories.filter(c => c.id !== category.id));
  };

  const handleAddCategory = async () => {
    const categoryRequestName = newCategoryName.trim();
    if (categoryRequestName) {
      const result = await createCategoryResponse({ name: categoryRequestName });
      if (result && result.status === HttpStatusCode.Created) {
        setCategories([result.data, ...categories]);
        setNewCategoryName('');
        setShowModal(false);
      }
    } else {
      alert("Vui lòng điền tên phân loại");
    }
  };

  const handleAddReason = async () => {
    if (newReasonContent.trim() === '' || newReasonEntity.trim() === '') {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    const newReason = { content: newReasonContent.trim(), relatedEntityType: newReasonEntity };
    const result = await createReasonResponse(newReason);
    if (result && result.status === HttpStatusCode.Created) {
      setReasons([result.data, ...reasons]);
      setNewReasonContent('');
      setNewReasonEntity('');
      setShowModal(false);
    }
  }

  const handleDeleteReason = async (id) => {
    const result = await deleteReasonResponse(id);
    if (result && result.status === HttpStatusCode.Ok) {
      setReasons(reasons.filter(r => r.id !== id));
    }
  }

  const handleDeleteUnit = async (unitId) => {
    const result = await deleteUnitResponse(unitId);
    if (result.status === HttpStatusCode.Ok) {
      setUnits(units.filter(u => u.id !== unitId));
    }
  };

  const handleAddUnit = async () => {
    const unitRequestName = newUnitName.trim();
    if (unitRequestName === '' || unitRequestName === null) return
    const isDuplicate = units.some(unit =>
      unit.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === unitRequestName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );

    if (isDuplicate) {
      alert("Tên đơn vị này đã tồn tại!");
      return;
    }
    const result = await createUnitResponse({ name: unitRequestName });
    if (result.status === HttpStatusCode.Created) {
      setUnits([...units, {
        id: units.length + 1,
        name: unitRequestName,
        isUsed: false
      }]);
      setNewUnitName('');
      setShowModal(false);
    }
  };

  const handleResolveToggleAccountStatus = async (userId) => {
    const user = usersResponse.accounts.find(u => u.id === userId);
    // 
    if (user.status === 'active') {
      setModalType('disableUser');
      setShowModal(true);
    } else {
      await handleToggleAccountStatus(userId, true);//true la disable->active
      // const updatedAccounts = usersResponse.accounts.map(u =>
      //   u.id === userId ? { ...u, status: 'active' } : u
      // );
      // setUsersResponse({ ...usersResponse, accounts: updatedAccounts });
    }
  };

  const handleToggleAccountStatus = async (accountId, active) => {
    if (!active) {
      handleSendWarning();
    }
    const result = await toggleAccountStatusResponse(accountId);
    if (result.status === HttpStatusCode.Ok) {
      const user = usersResponse.accounts.find(u => u.id === accountId);
      if (!user) return;
      const newStatus = user.status === 'active' ? 'disable' : 'active';
      setUsersResponse((prev) => ({
        ...prev,
        accounts: prev.accounts.map((u) =>
          u.id === accountId ? { ...u, status: active ? "active" : "disable" } : u
        ),
      }));
      setShowModal(false);
      setWarningData({ title: '', content: '', reasonId: 0, accountIds: [], recipeId: 0 });
    }
  };

  const handleCreateNotification = async () => {
    const result = await createMessageResponse(warningData);
    if (result && result.status === HttpStatusCode.Created) {
      setMessages([result.data, ...messages]);
      setWarningData({ title: "", content: '', reasonId: 0, accountIds: [], recipeId: 0 });
      setShowModal(false);
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReasonText = (reasonId) => {
    const reason = reasons.find(r => r.id === reasonId);
    return reason ? reason.message : 'Không xác định';
  };

  useEffect(() => {
    if (currentUser) {
      loadLovedRecipesChartData();
      loadWeeklyRecipesChartData();
      loadRegisteredAccountChartData();
      loadPendingRecipes();
      loadReasons();
      loadCategories();
      loadAccounts();
      loadUnits();
      loadAdminMessages();
      loadIllegalWords();
    }
  }, [currentUser]);

  useEffect(() => {
    setWarningData({
      title: '',
      content: '',
      reasonId: 0,
      accountIds: [],
      recipeId: 0
    });
  }, [modalType]);

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-200" style={{ fontFamily: "UVN Giong Song" }}>
      {/* Header */}
      <header className="fixed w-full min-h-16 max-h-20 flex items-center bg-gradient-to-r from-blue-950 to-indigo-700 text-white py-6 px-8 shadow-xl border-b border-gray-600 z-10">
        <h1 className="text-4xl italic bg-gradient-to-r from-white to-sky-400 bg-clip-text text-transparent">
          Healthy Wealthy - Quản lý
        </h1>
        <div
          onClick={handleLogout}
          className='ml-auto mr-8 w-10 h-10 bg-white rounded-full flex justify-center items-center hover:bg-gray-200 border-1 border-indigo-600'>
          <LogOut className='w-6 h-6 text-indigo-950' />
        </div>
      </header>

      {/* Body: Sidebar + Main content */}
      <div className="flex flex-1 mt-20">
        {/* Sidebar */}
        <nav className="min-w-80 max-w-110 bg-blue-950 border-r border-gray-700 shadow-lg min-h-screen px-4 py-6 fixed top-0">
          <div className="flex flex-col space-y-2 mt-20">
            {[
              { id: 'statistics', label: 'Thống kê', icon: BarChart2 },
              { id: 'articles', label: 'Công thức chờ', icon: FileText },
              { id: 'categories', label: 'Phân loại', icon: Grid },
              { id: 'usersResponse', label: 'Người dùng', icon: User },
              { id: 'units', label: 'Đơn vị', icon: Building2 },
              { id: 'reasons', label: 'Lý do', icon: AlertCircle },
              { id: 'messages', label: 'Thông báo', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between py-3 px-2 border-l-4 text-left text-lg font-medium transition-all duration-200 ${activeTab === tab.id
                    ? 'border-yellow-400 bg-blue-900 text-yellow-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:bg-blue-800'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </div>

                  {/* Hiển thị số lượng chỉ với tab "Công thức chờ" */}
                  {tab.id === 'articles' && articles.length > 0 && (
                    <span className="ml-2 text-sm bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      {articles.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </nav>
        {/* Main Content */}
        <main className="ml-80  p-4 w-5/6 overflow-y-auto">
          {/* Biểu đồ */}
          {registeredChartData && activeTab === 'statistics' && (
            <div className="w-full  bg-indigo-950 rounded-xl shadow-2xl border border-gray-700">
              <div className="p-8 space-y-8">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-600 pb-4">
                  Thống kê hệ thống
                </h2>
                <div className="space-y-4">
                  <YearInput
                    label="Năm"
                    value={yearRegistered}
                    onChange={(newYear) => {
                      setYearRegistered(newYear);
                      if (isValidYear(newYear)) {
                        loadRegisteredAccountChartData(newYear);
                      }
                    }}
                  />
                  <ChartInsightPanel
                    dataList={registeredChartData.dataList}
                    title={`Phân tích lượt đăng ký năm ${yearRegistered}`}
                    unit='người'
                    isWeeklyChart={false}
                    currentIndex={yearRegistered === currentYear ? currentMonth : 12}
                  />

                  <CustomBarChart
                    dataList={registeredChartData.dataList}
                    year={yearRegistered}
                    labelPrefix={registeredChartData.labelPrefix}
                    chartName="Biểu đồ theo dõi số lượng lượt đăng ký tài khoản năm"
                  />
                </div>
                {/* BIểu đồ count loved */}
                <div className="space-y-4">
                  <YearInput
                    label="Năm"
                    value={yearLoved}
                    onChange={(newYear) => {
                      setYearLoved(newYear);
                      if (isValidYear(newYear)) {
                        loadLovedRecipesChartData(newYear);
                      }
                    }}
                  />

                  <ChartInsightPanel
                    dataList={lovedRecipesChartData.dataList}
                    title={`Phân tích lượt yêu thích năm ${yearLoved}`}
                    unit='lượt'
                    isWeeklyChart={false}
                    currentIndex={yearLoved === currentYear ? currentMonth : 12}
                  />

                  <CustomBarChart
                    dataList={lovedRecipesChartData.dataList}
                    year={yearLoved}
                    labelPrefix={lovedRecipesChartData.labelPrefix}
                    chartName="Biểu đồ theo dõi số lượng lượt tương tác yêu thích năm"
                  />
                </div>
                {/* Biểu đồ recipe theo tuần trong năm */}
                <div className="space-y-4">
                  <YearInput
                    label="Năm"
                    value={yearRecipe}
                    onChange={(newYear) => {
                      setYearRecipe(newYear);
                      if (isValidYear(newYear)) {
                        loadWeeklyRecipesChartData(newYear);
                      }
                    }}
                  />

                  <ChartInsightPanel
                    dataList={recipesChartData.dataList}
                    title={`Phân tích số lượng công thức công khai năm ${yearLoved}`}
                    unit='công thức'
                    isWeeklyChart={true}
                    currentIndex={yearLoved === currentYear ? currentWeek : recipesChartData.dataList.length}
                  />

                  <CustomBarChart
                    dataList={recipesChartData.dataList}
                    year={yearRecipe}
                    labelPrefix={recipesChartData.labelPrefix}
                    chartName="Biểu đồ theo dõi số lượng công thức năm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phê duyệt bài viết */}
          {activeTab === 'articles' && (
            <div className="bg-indigo-950 rounded-xl shadow-2xl border border-gray-700">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-600 pb-4">
                  Danh sách bài viết chờ phê duyệt
                </h2>
                {/* isRecipeHasIllegalWord */}
                <div className="space-y-4">
                  {articles.length > 0 && articles.map((article, index) => (
                    <div
                      key={article.id}
                      className={`${isRecipeHasIllegalWord(article) ? 'bg-red-600' : 'bg-gray-100'} border border-gray-600 rounded-xl p-6 hover:bg-gray-300 transition-all duration-200 hover:shadow-xl`}
                    >
                      {/* Cả hàng gồm STT, nội dung bên trái, nút bên phải */}
                      <div className="flex justify-between items-center space-x-6">
                        {/* STT */}
                        <div className="w-8 h-8 flex items-center justify-center bg-indigo-900 text-white font-semibold rounded-md shrink-0">
                          {index + 1}
                        </div>
                        {/* Nội dung */}
                        <div className="flex-1">
                          <h3 className="text-xl text-black mb-2 font-semibold">{article.title}</h3>
                          <p className="text-sm text-blue-900">Tác giả: {article.authorId}</p>
                        </div>
                        {/* Nút xem */}
                        <button
                          onClick={() => handleViewArticle(article)}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <Eye size={18} />
                          <span>Xem</span>
                        </button>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          )}

          {/* Quản lý phân loại */}
          {activeTab === 'categories' && (
            <div className="bg-indigo-950 rounded-xl shadow-2xl border border-gray-700">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                  <div className='flex ml-0 items-center justify-center'>
                    <h2 className="text-2xl font-bold text-white">Quản lý phân loại {"("}</h2>
                    <p className='text-2xl text-yellow-400'>{categories.length}</p>
                    <p className='text-2xl text-white'>{")"}</p>
                  </div>
                  <button
                    onClick={() => { setModalType('addCategory'); setShowModal(true); }}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus size={18} />
                    <span>Tạo phân loại mới</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {categories?.map((category, index) => (
                    <div key={category.id} className="bg-white border border-gray-600 rounded-xl p-6 flex  items-center hover:bg-gray-300 transition-all duration-200">
                      <div className="w-8 h-8 flex items-center justify-center bg-indigo-900 text-white font-semibold rounded-md">
                        {index + 1}
                      </div>
                      <div className='ml-8'>
                        <h3 className="text-2xl text-black font-semibold">{category.name}</h3>
                        <p className="text-lg text-blue-900">{category.recipeIds?.length > 0 ? category.recipeIds.length : 0} bài viết sử dụng</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="ml-auto mr-4 text-red-400 hover:text-red-600 p-3 rounded-xl hover:bg-white transition-all duration-200"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quản lý người dùng */}
          {activeTab === 'usersResponse' && (
            <div className="bg-indigo-950 rounded-xl shadow-2xl border border-gray-700">
              <div className="p-8">
                <div className='flex ml-0 items-center mb-4'>
                  <h2 className="text-2xl font-bold text-white">Danh sách người dùng {"("}</h2>
                  <p className='text-2xl text-yellow-400'>{usersResponse.accounts.length}</p>
                  <p className='text-2xl text-white'>{")"}</p>
                </div>

                {/* Danh sách người dùng */}
                <div className="space-y-4">
                  {usersResponse.accounts?.map((user, index) => (
                    <div key={user.id} className="bg-white border border-gray-600 rounded-xl p-6 flex justify-between items-center hover:bg-gray-300 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 flex items-center justify-center bg-indigo-900 text-white font-semibold rounded-md">
                          {index + 1}
                        </div>
                        <img
                          src={user?.avatarUrl || "https://res.cloudinary.com/dkmql9swy/image/upload/v1750048115/689pIkbEsT3xi_md3zt5.webp"}
                          alt={user.username}
                          className="w-14 h-14 rounded-full border-2 border-gray-500"
                        />
                        <div>
                          <h3 className="text-xl text-black font-semibold">{user.username}</h3>
                          <p className="text-lg text-gray-700">{user.email}</p>
                          <p className="text-gray-800">Tham gia: {formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${user.status === 'active'
                          ? 'bg-emerald-600 text-emerald-200 border border-emerald-500'
                          : 'bg-red-600 text-red-200 border border-red-500'
                          }`}>
                          {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                        </span>
                        {user.role !== 'ADMIN' && <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            handleResolveToggleAccountStatus(user.id)
                          }}
                          className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${user.status === 'active'
                            ? 'bg-red-600 text-white hover:bg-red-500'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                        >
                          {user.status === 'active' ? 'Vô hiệu' : 'Kích hoạt'}
                        </button>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Phân trang */}
                {accountsResponse?.totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                      disabled={accountsResponse?.currentPage === 0}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${accountsResponse?.currentPage === 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                      Trước
                    </button>

                    {Array.from({ length: accountsResponse?.totalPages }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${accountsResponse?.currentPage === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, accountsResponse?.totalPages - 1))}
                      disabled={accountsResponse?.currentPage === accountsResponse?.totalPages - 1}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${accountsResponse?.currentPage === accountsResponse?.totalPages - 1
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quản lý đơn vị */}
          {activeTab === 'units' && (
            <div className="bg-indigo-950 rounded-xl shadow-2xl border border-gray-700">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                  <h2 className="text-2xl font-bold text-white">Quản lý đơn vị</h2>
                  <button
                    onClick={() => { setModalType('addUnit'); setShowModal(true); }}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus size={18} />
                    <span>Tạo đơn vị mới</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {units.map((unit, index) => (
                    <div
                      key={unit.id}
                      className="bg-white border border-gray-600 rounded-xl p-6 flex justify-between items-center hover:bg-gray-300 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 flex items-center justify-center bg-indigo-900 text-white font-semibold rounded-md">
                          {index + 1}
                        </div>
                        <h3 className="text-2xl text-black font-semibold">{unit.name}</h3>
                      </div>

                      {/* Nút xóa */}
                      <button
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="text-red-400 hover:text-red-300 p-3 rounded-xl hover:bg-red-900/20 transition-all duration-200"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quan ly li do */}
          {activeTab === 'reasons' && (
            <div className="space-y-6 ">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-200 flex items-center space-x-3">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className='text-blue-800'>Quản lý lí do</span>
                </h2>

                <button
                  onClick={() => { setModalType('addReason'); setShowModal(true); }}
                  className="flex items-center space-x-2 bg-indigo-950 text-white px-6 py-3 rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tạo lí do mới</span>
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reasons.map(r => (
                  <div
                    key={r.id}
                    className="bg-white backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-200 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 group"
                  >
                    {/* Header của card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-800 text-emerald-200 border border-emerald-500/20">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {r.relatedEntityType}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteReason(r.id)}
                        className="text-red-400 hover:text-red-700 p-2 rounded-xl hover:bg-red-900/20 transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Nội dung message */}
                    <div className="mt-4">
                      <p className="text-blue-900 text-sm leading-relaxed line-clamp-3">
                        {r.message}
                      </p>
                    </div>

                    {/* Footer với thông tin bổ sung */}
                    <div className="mt-6 pt-4 border-t border-gray-700/50">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>ID: {r.id}</span>

                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {reasons.length === 0 && (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 text-lg mb-2">Chưa có lí do nào</p>
                  <p className="text-gray-500 text-sm">Tạo lí do đầu tiên để bắt đầu quản lý</p>
                </div>
              )}
            </div>
          )}

          {/* Quản lý thông báo */}
          {activeTab === 'messages' && (
            <div className="bg-indigo-950 rounded-xl shadow-2xl border border-gray-700">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                  <h2 className="text-2xl font-bold text-white">Quản lý thông báo quản trị</h2>
                  <button
                    onClick={() => { setModalType('addMessage'); setShowModal(true); }}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus size={18} />
                    <span>Tạo thông báo mới</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {messages.length > 0 && messages.map(message => (
                    <div key={message.id} className="bg-indigo-900 border border-gray-600 rounded-xl p-6 hover:bg-gray-800 transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl text-white font-semibold mb-2">{message.title}</h3>
                          <p className="text-gray-300 mb-3">{message.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>Lý do: {getReasonText(message.reasonId)}</span>
                            <span>•</span>
                            <span>Tạo lúc: {formatDate(message.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => { handleSendToAll(message.id) }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all 
                            duration-200 bg-blue-800 border-1 border-blue-100 text-white hover:bg-indigo-950`}
                          >
                            {message.isSentToAll ? 'All' : 'Send to all'}
                          </button>
                          <button
                            onClick={() => { handleDeleteMessage(message.id) }}
                            className="text-red-500 hover:text-red-700 bg-white p-2 rounded-xl transition-all duration-200"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Modals */}
        {showModal && (
          <Modal>
            {modalType === 'view' && selectedArticle && (
              <div className="p-8 bg-gray-800 rounded-xl shadow-2xl max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                  <h2 className="text-3xl font-bold text-white">{selectedArticle.title}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle size={32} />
                  </button>
                </div>

                <div className="space-y-6 text-sm md:text-base">
                  {/* Tác giả & Ngày tạo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700 p-6 rounded-xl border border-gray-600">
                    <div>
                      <h3 className="font-semibold text-blue-400 mb-2 text-xl">👤 Tác giả</h3>
                      <p className="text-gray-300 text-xl">{selectedArticle.authorId}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-400 mb-2 text-xl">📅 Ngày tạo</h3>
                      <p className="text-gray-300">{formatDate(selectedArticle.createdAt)}</p>
                    </div>
                  </div>

                  {/* Nội dung */}
                  <div className="bg-gray-700 p-6 rounded-xl border border-gray-600">
                    <h3 className="font-semibold text-blue-400 mb-3 border-b border-gray-600 pb-2 text-xl">📝 Nội dung</h3>
                    <p className="text-gray-300 whitespace-pre-line text-xl">{selectedArticle.content}</p>
                  </div>

                  {/* Hình ảnh */}
                  <div className="bg-gray-700 p-6 rounded-xl border border-gray-600">
                    <h3 className="font-semibold text-blue-400 mb-3 border-b border-gray-600 pb-2 text-xl">🖼️ Hình ảnh</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedArticle.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="rounded-xl h-40 w-full object-cover shadow-lg border border-gray-600"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Nguyên liệu */}
                  <div className="bg-gray-700 p-6 rounded-xl border border-gray-600">
                    <h3 className="font-semibold text-blue-400 mb-3 border-b border-gray-600 pb-2 text-xl">🧂 Nguyên liệu</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      {selectedArticle.ingredients?.map((ingredient, index) => (
                        <li key={index} className='text-xl'>{ingredient.name}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Các bước */}
                  <div className="bg-gray-700 p-6 rounded-xl border border-gray-600">
                    <h3 className="font-semibold text-blue-400 mb-3 border-b border-gray-600 pb-2 text-xl">👩‍🍳 Các bước thực hiện</h3>
                    <div className="space-y-4">
                      {selectedArticle.steps.map((step, index) => (
                        <div key={index} className="border border-gray-600 rounded-xl p-4 shadow-lg bg-gray-800">
                          <p className="text-emerald-400 font-medium mb-2 text-xl">Bước {index + 1}:</p>
                          <p className='text-xl text-gray-300'>{step.content}</p>

                          {step?.imageUrl && (
                            <div className='w-full flex items-center justify-center mt-4'>
                              <img
                                src={step.imageUrl}
                                alt={`Step ${index + 1}`}
                                className="w-3/4 object-cover rounded-xl border border-gray-600"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      onClick={() => handleApprove(selectedArticle.id)}
                      className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg"
                    >
                      <CheckCircle size={18} />
                      <span>Phê duyệt</span>
                    </button>
                    <button
                      onClick={handleViolation}
                      className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-500 transition-all duration-200 shadow-lg"
                    >
                      <XCircle size={18} />
                      <span>Vi phạm</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'addMessage' && (
              <div className="p-8 bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                  <h2 className="text-2xl font-bold">Tạo thông báo mới</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle size={28} />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Tiêu đề */}
                  <div>
                    <label className="block text-xl font-medium mb-3">Tiêu đề</label>
                    <input
                      type="text"
                      value={newMessageData.title}
                      onChange={(e) =>
                        setNewMessageData({ ...newMessageData, title: e.target.value })
                      }
                      className="w-full p-4 bg-gray-700 border border-gray-600 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Nhập tiêu đề thông báo"
                      required
                    />
                  </div>

                  {/* Nội dung */}
                  <div>
                    <label className="block text-xl font-medium mb-3">Nội dung</label>
                    <textarea
                      value={newMessageData.content}
                      onChange={(e) =>
                        setNewMessageData({ ...newMessageData, content: e.target.value })
                      }
                      className="w-full p-4 bg-gray-700 border border-gray-600 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      rows={4}
                      placeholder="Nhập nội dung thông báo"
                      required
                    />
                  </div>

                  {/* Lý do */}
                  <div>
                    <label className="block text-xl font-medium mb-3">Lý do</label>
                    <button
                      onClick={() => setShowReasonTable(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-lg transition-all duration-200"
                    >
                      Chọn lý do
                    </button>
                    {newMessageData.reasonId !== -1 && (
                      <p className="mt-2 text-green-400 text-sm">
                        Đã chọn lý do ID: {newMessageData.reasonId}
                      </p>
                    )}
                  </div>

                  {/* Bảng chọn lý do */}
                  {showReasonTable && (
                    <div className="border border-gray-600 rounded-xl overflow-hidden mt-4">
                      <table className="w-full table-auto bg-gray-700 text-white">
                        <thead className="bg-gray-600">
                          <tr>
                            <th className="py-3 px-4 text-left">ID</th>
                            <th className="py-3 px-4 text-left">Message</th>
                            <th className="py-3 px-4 text-left">Entity Type</th>
                            <th className="py-3 px-4 text-left">Chọn</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reasons.map((reason) => (
                            <tr
                              key={reason.id}
                              className="border-t border-gray-600 hover:bg-gray-600"
                            >
                              <td className="py-2 px-4">{reason.id}</td>
                              <td className="py-2 px-4">{reason.message}</td>
                              <td className="py-2 px-4">{reason.relatedEntityType}</td>
                              <td className="py-2 px-4">
                                <button
                                  onClick={() => {
                                    setNewMessageData({
                                      ...newMessageData,
                                      reasonId: reason.id,
                                    });
                                    setShowReasonTable(false);
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg"
                                >
                                  Chọn
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      onClick={() => handleAddMessage(newMessageData.reasonId)}
                      className="bg-emerald-600 text-xl text-white px-8 py-3 rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg"
                    >
                      Tạo thông báo
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-600 text-xl text-white px-8 py-3 rounded-xl hover:bg-gray-500 transition-all duration-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}


            {modalType === 'warning' && (
              <div className="p-8 bg-gray-800 text-white">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                  <h2 className="text-2xl font-bold">GỬI THÔNG BÁO</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle size={32} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xl font-medium mb-3">Tiêu đề</label>
                    <input
                      type="text"
                      value={warningData.title}
                      onChange={(e) => setWarningData({ ...warningData, title: e.target.value })}
                      className="w-full p-4 bg-gray-700 border border-gray-600 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Nhập tiêu đề cảnh báo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-medium mb-3">Nội dung</label>
                    <textarea
                      value={warningData.content}
                      onChange={(e) => setWarningData({ ...warningData, content: e.target.value })}
                      className="w-full p-4 bg-gray-700 border text-lg border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      rows={4}
                      placeholder="Nhập nội dung cảnh báo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-medium mb-3">Lý do</label>
                    <select
                      value={warningData.reasonId}
                      onChange={(e) =>
                        setWarningData({ ...warningData, reasonId: parseInt(e.target.value) })
                      }
                      className="w-full text-lg p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="" key={0}>Chọn lý do</option>
                      {reasons.length > 0 && reasons.map((r) => (
                        <option key={r.id} value={r.id}>{r.message}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={handleSendWarning}
                      className="bg-red-600 text-xl text-white px-8 py-3 rounded-xl hover:bg-red-500 transition-all duration-200 shadow-lg"
                    >
                      Gửi cảnh báo
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-600 text-xl text-white px-8 py-3 rounded-xl hover:bg-gray-500 transition-all duration-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'addCategory' && (
              <div className="p-8 bg-gray-800 text-white">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                  <h2 className="text-2xl font-bold">Tạo phân loại mới</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle size={28} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xl font-medium mb-3">Tên phân loại</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Nhập tên phân loại"
                    />
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={handleAddCategory}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg"
                    >
                      Tạo phân loại
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-600 text-white px-8 py-3 rounded-xl hover:bg-gray-500 transition-all duration-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'addUnit' && (
              <div className="p-8 bg-gray-800 text-white">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                  <h2 className="text-2xl font-bold">Tạo đơn vị mới</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle size={28} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xl font-medium mb-3">Tên đơn vị</label>
                    <input
                      type="text"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Nhập tên đơn vị"
                    />
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={handleAddUnit}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg"
                    >
                      Tạo đơn vị
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-600 text-white px-8 py-3 rounded-xl hover:bg-gray-500 transition-all duration-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'disableUser' && (
              <div className="p-8 bg-gray-800 text-white">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                  <h2 className="text-2xl font-bold">Vô hiệu hóa tài khoản</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle size={28} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xl font-medium mb-3">Tiêu đề</label>
                    <input
                      type="text"
                      value={warningData.title}
                      onChange={(e) => setWarningData({ ...warningData, title: e.target.value })}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Nhập tiêu đề thông báo"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-medium mb-3">Nội dung</label>
                    <textarea
                      value={warningData.content}
                      onChange={(e) => setWarningData({ ...warningData, content: e.target.value })}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      rows={4}
                      placeholder="Nhập nội dung thông báo"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-medium mb-3">Lý do</label>
                    <select
                      value={warningData.reasonId}
                      onChange={(e) => setWarningData({ ...warningData, reasonId: e.target.value })}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Chọn lý do</option>
                      {reasons.length > 0 && reasons.map((r) => (
                        <option key={r.id} value={r.id}>{r.message}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={() => handleToggleAccountStatus(selectedUserId, false)}
                      className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-500 transition-all duration-200 shadow-lg"
                    >
                      Vô hiệu hóa
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-600 text-white px-8 py-3 rounded-xl hover:bg-gray-500 transition-all duration-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'addReason' && (
              <div className="p-8 bg-gray-800 text-white">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                  <h2 className="text-2xl font-bold">Tạo lý do mới</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle size={28} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xl font-medium mb-3">Nội dung lý do</label>
                    <input
                      type="text"
                      value={newReasonContent}
                      onChange={(e) => setNewReasonContent(e.target.value)}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Nhập nội dung lý do"
                    />
                  </div>
                  <div>
                    <label className="block text-xl font-medium mb-3">Đối tượng áp dụng</label>
                    <input
                      type="text"
                      value={newReasonEntity}
                      onChange={(e) => setNewReasonEntity(e.target.value)}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Nhập tên đối tượng áp dụng"
                    />
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={handleAddReason}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg"
                    >
                      Tạo lý do
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-600 text-white px-8 py-3 rounded-xl hover:bg-gray-500 transition-all duration-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          //reason table

        )}
      </div>
    </div>
  );
}

export default AdminDashboard;