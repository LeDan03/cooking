import React, { useState } from 'react';
import { Search, User, Mail, Calendar, Shield, CheckCircle, XCircle, Clock, ChefHat, Utensils, Coffee, Cookie, Star, Flame } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import {
  searchByEmailResponse,
  searchByUsernameResponse
} from '../api/account/getAccount';
import path from '../utils/path';
import { UserImageFallBack } from '../component/ImageWithFallBack';

const SearchAccount = () => {

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('');

  // Mock API call - thay thế bằng API thực tế
  const mockApiCall = async (query, type) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (type === 'email') {
      // Mock single account response for email search
      return {
        id: 1,
        username: 'master_chef_john',
        email: query,
        avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&h=150&fit=crop&crop=face',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z',
        status: 'ACTIVE',
        role: 'CHEF'
      };
    } else {
      // Mock multiple accounts response for username search
      return [
        {
          id: 1,
          username: query,
          email: 'masterchef@cookingworld.com',
          avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&h=150&fit=crop&crop=face',
          createdAt: '2023-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:45:00Z',
          status: 'ACTIVE',
          role: 'CHEF'
        },
        {
          id: 2,
          username: query + '_baker',
          email: 'sweetbaker@cookingworld.com',
          avatarUrl: 'https://images.unsplash.com/photo-1594736797933-d0dc65ba8303?w=150&h=150&fit=crop&crop=face',
          createdAt: '2023-02-10T09:15:00Z',
          updatedAt: '2024-01-18T16:20:00Z',
          status: 'INACTIVE',
          role: 'BAKER'
        },
        {
          id: 3,
          username: query + '_foodie',
          email: 'foodlover@cookingworld.com',
          avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          createdAt: '2023-03-05T14:20:00Z',
          updatedAt: '2024-01-15T11:30:00Z',
          status: 'ACTIVE',
          role: 'FOODIE'
        }
      ];
    }
  };

  const handleSearchByEmail = async (email) => {
    const result = await searchByEmailResponse(email);
    if (result !== null) {
      navigate(path.PERSONAL, { state: { author: result.data } });
    }
  }

  const handleSearchByUsername = async (username) => {
    const result = await searchByUsernameResponse(username);
    console.log("Search by username response", result);
    if (result !== null) {
      setSearchResults(result.data);
    }
  }

  // Detect if input is email or username
  const isEmail = (str) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    const type = isEmail(searchTerm) ? 'email' : 'username';
    setSearchType(type);

    try {
      const searchKey = searchTerm.trim();
      if (type === 'email') {
        handleSearchByEmail(searchKey);
      } else {
        handleSearchByUsername(searchKey);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (account) => {
    navigate(path.PERSONAL, { state: { author: account } });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disable':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'CHEF':
        return {
          icon: <ChefHat className="w-4 h-4" />,
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          label: 'Đầu Bếp'
        };
      case 'BAKER':
        return {
          icon: <Cookie className="w-4 h-4" />,
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          label: 'Thợ Làm Bánh'
        };
      case 'FOODIE':
        return {
          icon: <Utensils className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Người Sành Ăn'
        };
      case 'ADMIN':
        return {
          icon: <Star className="w-4 h-4" />,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          label: 'Quản Trị'
        };
      default:
        return {
          icon: <User className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Thành Viên'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-orange-200 opacity-20">
          <ChefHat className="w-32 h-32 rotate-12" />
        </div>
        <div className="absolute top-40 right-20 text-red-200 opacity-20">
          <Utensils className="w-24 h-24 -rotate-12" />
        </div>
        <div className="absolute bottom-32 left-1/4 text-amber-200 opacity-20">
          <Coffee className="w-20 h-20 rotate-45" />
        </div>
        <div className="absolute bottom-20 right-1/3 text-orange-200 opacity-20">
          <Cookie className="w-28 h-28 -rotate-12" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Tìm Kiếm Đầu Bếp
            </h1>
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-orange-700 text-lg font-medium">
            Khám phá thế giới ẩm thực cùng các đầu bếp tài năng 👨‍🍳✨
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border-2 border-orange-100 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-orange-400 to-red-400 px-4 py-1 rounded-full">
              <Flame className="w-5 h-5 text-white inline" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo email hoặc tên đầu bếp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-4 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-gray-700 placeholder-orange-300 bg-orange-50/50"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang tìm kiếm...
                </>
              ) : (
                <>
                  <ChefHat className="w-5 h-5" />
                  Tìm Đầu Bếp
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchType === 'username' && searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Utensils className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-orange-800">
                Kết quả tìm kiếm ({searchResults.length})
              </h2>
              <Coffee className="w-6 h-6 text-orange-600" />
            </div>

            {searchResults.map((account) => {
              const roleInfo = getRoleInfo(account.role);
              return (
                <div
                  key={account.id}
                  onClick={() => handleAccountSelect(account)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl border-2 border-orange-100 hover:border-orange-300 p-6 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 opacity-5">
                    <ChefHat className="w-32 h-32 text-orange-500" />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-red-400 p-1">
                        <UserImageFallBack
                          src={account.avatarUrl}
                          alt={account.username}
                          className="w-full h-full rounded-full object-cover border-2 border-white"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNGRUQ3QUEiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjRUE1ODA2Ij4KPHA+Q2hlZjwvcD4KPHN2Zz4K';
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                        {getStatusIcon(account.status)}
                      </div>
                      <div className="absolute -top-2 -left-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full p-2">
                        {roleInfo.icon}
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <h3 className="font-bold text-gray-800 text-xl truncate flex items-center gap-2">
                          <ChefHat className="w-5 h-5 text-orange-600" />
                          {account.username}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 flex items-center gap-2 ${roleInfo.color}`}>
                            {roleInfo.icon}
                            {roleInfo.label}
                          </span>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${account.status === 'active'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                            {account.status === 'active' ? 'Đang Hoạt Động' : 'Tạm Nghỉ'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600 mb-3 bg-orange-50 rounded-lg p-2">
                        <Mail className="w-5 h-5 mr-3 text-orange-600" />
                        <span className="truncate font-medium">{account.email}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 bg-amber-50 rounded-lg p-2">
                        <Calendar className="w-4 h-4 mr-2 text-amber-600" />
                        <span>Gia nhập: {formatDate(account.createdAt)}</span>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="text-orange-400 self-center bg-orange-100 rounded-full p-2 hover:bg-orange-200 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {searchType === 'username' && searchResults.length === 0 && !loading && searchTerm && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-lg border-2 border-orange-100">
            <div className="mb-6">
              <ChefHat className="w-24 h-24 text-orange-300 mx-auto mb-4" />
              <div className="flex justify-center gap-2 text-orange-300">
                <Utensils className="w-8 h-8" />
                <Coffee className="w-8 h-8" />
                <Cookie className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-orange-700 mb-3">Không tìm thấy đầu bếp nào</h3>
            <p className="text-orange-600 text-lg">
              Không có đầu bếp nào khớp với từ khóa "<span className="font-bold">{searchTerm}</span>" 🍳
            </p>
            <p className="text-orange-500 mt-2">Hãy thử với từ khóa khác nhé!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAccount;