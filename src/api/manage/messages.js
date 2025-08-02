import axiosClient from "../axiosClient";

const createMessageResponse = async (messageRequest) => {
    try {
        const response = await axiosClient.post("/api/accounts/admin/notifications", messageRequest);
        return response;
    } catch (error) {
        console.warn(error.response);
        alert(error.response.data.message);
        return error.response.data;
    }
}

export const adminMessagesResponse = async () => {
    try {
        const response = await axiosClient.get("/api/accounts/admin/notifications");
        return response;
    } catch (error) {
        console.warn(error.response);
        alert(error.response.data.message);
        return error.response.data;
    }
}

export const deleteMessageResponse = async (id) => {
    try {
        const response = await axiosClient.delete(`/api/accounts/admin/notifications/${id}`);
        return response;
    } catch (error) {
        console.warn(error.response);
        alert(error.response.data.message);
        return error.response.data;
    }
}

export const sendToAllResponse = async (id) => {
    try {
        const response = await axiosClient.post(`/api/accounts/admin/notifications/${id}/send`);
        return response;
    } catch (error) {
        console.warn(error.response);
        alert(error.response.data.message);
        return error.response.data;
    }
}

export default createMessageResponse