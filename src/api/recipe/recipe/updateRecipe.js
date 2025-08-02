import axiosClient from "../../axiosClient";

const updateResponse = async (recipeId, updateRecipe) => {
    try {
        const response = await axiosClient.put(`/api/recipes/${recipeId}`, updateRecipe);
        return response;
    } catch (error) {
        console.warn("Cập nhật bài viết gặp lỗi",error);
        alert("Cập nhật bài viết thất bại, có lỗi xảy ra");
        return false;
    }
}

export default updateResponse;