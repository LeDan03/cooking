import axios from "axios";
import path from "../utils/path";
import useAuthStore from "../store/useAuthStore";

const baseURL = import.meta.env.VITE_API_BASE_URL;

// instance chính
const axiosClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// instance chuyên refresh, KHÔNG interceptor
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const currentUser = useAuthStore.getState().currentUser;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-access-token") &&
      currentUser // ❗ chỉ gọi refresh nếu đang login
    ) {
      originalRequest._retry = true;

      try {
        await refreshClient.post("/api/accounts/auth/refresh-access-token");
        console.log("Refresh token thành công. Gọi lại request gốc...");

        return axiosClient(originalRequest);
      } catch (err) {
        console.error("Refresh token failed:", err);
        // Reset state trước khi redirect
        useAuthStore.getState().setCurrentUser(null);
        window.location.href = path.LOGIN;
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
