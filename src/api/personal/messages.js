import axiosClient from "../axiosClient";

const messagesResponse = async () => {
    try {
        const response = await axiosClient.get('/api/accounts/me/messages');
        return response;
    } catch (error) {
        console.error(error.response.data.message);
        return null;
    }
}

export const readMessageResponse = async (id) => {
    try {
        const response = await axiosClient.put(`/api/accounts/me/message/${id}`);
        return response;
    } catch (error) {
        console.error(error.response.data.message);
        return error.response.data;
    }
}

export default messagesResponse;