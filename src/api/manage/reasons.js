import axiosClient from "../axiosClient";

const reasonsResponse = async () => {
    try {
        const response = await axiosClient.get('/api/accounts/admin/reasons');
        return response;
    } catch (error) {
        console.warn("/REASONS failed", error);
        return null;
    }
}

export const createReasonResponse = async (reasonRequest) => {
    try {
        const response = await axiosClient.post('/api/accounts/admin/reason', reasonRequest);
        return response;
    } catch (error) {
        console.warn("CREATE REASONS failed", error);
        // alert(error.response.data.message)
        return null;
    }
}

export const deleteReasonResponse = async (id) => {
    try {
        const response = await axiosClient.delete(`/api/accounts/admin/reason/${id}`);
        return response;
    } catch (error) {
        console.warn("DELETE REASONS failed", error);
        // alert(error.response.data.message)
        return null;
    }
}

export default reasonsResponse;