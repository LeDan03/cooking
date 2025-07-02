import axios from "axios";
import path from "../utils/path";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
            try {
                error.config._retry = true; // tránh vòng lặp vô hạn
                await axiosClient.post("/auth/refresh-access-token"); // gọi API refresh token
                return axiosClient(error.config); // gọi lại request gốc
            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError);
                window.location.href = path.LOGIN; 
            }
        }

        console.error("API error:", error);
        return Promise.reject(error);
    }
);

export default axiosClient;
