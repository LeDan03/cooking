import axiosClient from "../../axiosClient";

const commentResponse = async (recipeId, cmtReq) => {
    try {
        const response = await axiosClient.post(`/api/recipes/${recipeId}/comments`, cmtReq);
        return response;
    } catch (error) {
        console.warn(error.response.data);
        return error.response;
    }
}

export const deleteResponse = async (cmtId) => {
    try {
        const response = await axiosClient.delete(`/api/recipes/comments/${cmtId}`);
        return response;
    } catch (error) {
        console.warn(error.response.data.message);
        alert("Có lỗi xảy ra", error)
        return error.response.data;
    }
}

export default commentResponse;