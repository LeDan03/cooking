import React, { useState } from 'react';
import { ChefHat, Lock, Mail, Eye, EyeOff, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import path from '../utils/path';
import createAccountResult from '../api/auth/register';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [formError, setFormError] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    if (name === 'username') {
      const cleanedValue = value.trim();
      const words = cleanedValue.split(/\s+/); // chia thành các từ

      const isValid = words.length >= 2 && words.every(word => /^[A-Za-zÀ-ỹ]+$/.test(word));

      if (!isValid) {
        setFormError(prev => ({
          ...prev,
          username: 'Tên người dùng phải có ít nhất 2 từ, chỉ chứa chữ cái.'
        }));
      } else {
        setFormError(prev => ({
          ...prev,
          username: ''
        }));
      }
    }
    if (name === 'password') {
      const passwordValid =
        value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /[^A-Za-z0-9]/.test(value) &&
        !/\s/.test(value); // không chứa khoảng trắng

      if (!passwordValid) {
        setFormError(prev => ({
          ...prev,
          password: 'Mật khẩu phải có ít nhất 8 kí tự, bao gồm chữ cái thường, chữ hoa, ít nhất một kí tự đặc biệt và không chứa khoảng trắng.'
        }));
      } else {
        setFormError(prev => ({
          ...prev,
          password: ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Chuẩn hóa dữ liệu đầu vào
    const cleanedEmail = formData.email.trim();
    alert(cleanedEmail);
    const cleanedUsername = formData.username
      .trim()
      .replace(/\s+/g, ' ') // chỉ giữ 1 khoảng trắng giữa các từ
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Viết hoa chữ cái đầu
      .join(' ');

    const cleanedPassword = formData.password.trim();

    const errors = {};

    // Username: ít nhất 2 từ và chỉ chứa chữ cái
    const usernameWords = cleanedUsername.split(' ');
    if (
      usernameWords.length < 2 ||
      !usernameWords.every(word => /^[A-Za-zÀ-ỹ]+$/.test(word))
    ) {
      errors.username = 'Tên người dùng phải có ít nhất 2 từ, chỉ chứa chữ cái.';
    }

    // Password: tối thiểu 8 ký tự, ít nhất 1 hoa, 1 thường, 1 ký tự đặc biệt, không có dấu cách
    const passwordValid =
      cleanedPassword.length >= 8 &&
      /[A-Z]/.test(cleanedPassword) &&
      /[a-z]/.test(cleanedPassword) &&
      /[^A-Za-z0-9]/.test(cleanedPassword) &&
      !/\s/.test(cleanedPassword);

    if (!passwordValid) {
      errors.password =
        'Mật khẩu phải ít nhất 8 ký tự, gồm chữ hoa, chữ thường, ký tự đặc biệt và không có khoảng trắng.';
    }

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      setIsLoading(false);
      return;
    }

    // Gửi dữ liệu chuẩn hóa
    try {
      const result = await createAccountResult({
        email: cleanedEmail,
        username: cleanedUsername,
        password: cleanedPassword,
      });

      if (result) {
        alert("Vui lòng kiểm tra email để xác thực tài khoản!");
        navigate(path.LOGIN);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo và tiêu đề */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <ChefHat className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h2>
          <p className="text-gray-600">Bắt đầu hành trình ẩm thực của bạn</p>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Tên người dùng
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="username"
                required
                disabled={isLoading}
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

            </div>
            {formError.username && (
              <p className='text-sm text-red-600 mt-1'>{formError.username}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

            </div>
            {formError.password && (
              <p className='text-sm text-red-600 mt-1'>{formError.password}</p>
            )}
          </div>

          {/* Terms + conditions */}
          <div className="flex items-start">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-0.5"
              required
              disabled={isLoading}
            />
            <label className="ml-2 text-sm text-gray-600">
              Tôi đồng ý với {' '}
              <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                Điều khoản & Điều kiện
              </a>
              {' '} và {' '}
              <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                Chính sách bảo mật
              </a>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-orange-600 hover:to-amber-600 hover:scale-105'
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Đang xử lý...
              </div>
            ) : (
              'Đăng ký'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Hoặc</span>
          </div>
        </div>

        {/* Login link */}
        <p className="text-center mt-6 text-gray-600">
          Đã có tài khoản?{' '}
          <Link to={path.LOGIN} className="font-semibold text-orange-600 hover:text-orange-700">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;