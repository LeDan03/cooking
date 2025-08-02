import axiosClient from "../axiosClient";

const myData = async () => {
    try {
        const response = await axiosClient.get("/api/accounts/me");
        return response.data;
    } catch (error) {
        console.error("/me failed", error);
        return null;
    }
}

export const updateAvt = async (avatarDto) => {
    try {
        const response = await axiosClient.put('/api/accounts/me/avatar', avatarDto);
        console.log("Update avt response:", response.data);
        return response; // Trả về dữ liệu từ server nếu có
    } catch (error) {
        console.error("/me update avt failed", error.response?.data || error.message);
        return error.response.data;
    }
};

export const updateUsername = async ({ newUsername }) => {
    try {
        const response = await axiosClient.put('/api/accounts/me/username', { newUsername: newUsername });
        return response;
    } catch (error) {
        console.error("/me update username failed", error);
        return false;
    }
}

export default myData;