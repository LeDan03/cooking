import axiosClient from "../../axiosClient";

const deleteResponse = async (recipeId) => {
    try {
        const response = await axiosClient.delete(`/api/recipes/${recipeId}`);
        return response;
    } catch (error) {
        console.error(error.response.data.message);
        alert("Xóa bài viết thất bại, có lỗi xảy ra");
        return error.response.data;
    }
}

export default deleteResponse;