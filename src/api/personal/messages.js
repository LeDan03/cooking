import axiosClient from "../axiosClient";

const messagesResponse = async () => {
    try {
        const response = await axiosClient.get('/api/accounts/me/messages');
        return response;
    } catch (error) {
        console.warn("Tải thông báo cá nhân thất bại", error);
        return [];
    }
}

export const readMessageResponse = async (messageId) => {
    try {
        const response = await axiosClient.put(`/api/accounts/me/message?messageId=${messageId}`);
        return response;
    } catch (error) {
        console.warn("Đọc thông báo thất bại",error);
        return null;
    }
}

export default messagesResponse;