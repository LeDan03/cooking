import axiosClient from "../axiosClient";

const createMessageResponse = async (messageRequest) => {
    try {
        const response = await axiosClient.post("/api/accounts/admin/messages", messageRequest);
        return response;
    } catch (error) {
        console.warn(error.response);
        return null;
    }
}

export const sendMessageToUser = async ({ accountId, messageId, recipeId }) => {
    try {
        const response = await axiosClient.post(`/api/accounts/admin//messages/account/disability?accountId=${accountId}&messageId=${messageId}`);
        // console.log("Phân trang message repsonse", response);
        return response;
    } catch (error) {
        console.warn("Send message to user failed", error);
        return null;
    }
}

export const adminMessagesResponse = async (page, size) => {
    try {
        const response = await axiosClient.get(`/api/accounts/admin/messages?page=${page}&size=${size}`);
        console.log("Phân trang message repsonse", response);
        return response;
    } catch (error) {
        console.warn("Lấy danh sách thông báo của người quản lý thất bại", error);
        return null;
    }
}

export const deleteMessageResponse = async (id) => {
    try {
        const response = await axiosClient.delete(`/api/accounts/admin/messages/${id}`);
        return response;
    } catch (error) {
        console.warn("Xóa thông báo thất bại", error);
        return null;
    }
}

export const sendToAllResponse = async (id) => {
    try {
        const response = await axiosClient.post(`/api/accounts/admin/messages/${id}/send`);
        return response;
    } catch (error) {
        console.warn("gửi thông báo cho tất cả người dùng thất bại", error);
        return null;
    }
}

export const togglePinnedMessage = async (id) => {
    try {
        const response = await axiosClient.post(`/api/accounts/admin/messages/${id}/pinned`);
        return response;
    } catch (error) {
        console.warn("Ghim thông báo thất bại", error);
        return null;
    }
}

export default createMessageResponse