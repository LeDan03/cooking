import axiosClient from "../../axiosClient";

const imageUrlsResponse = async (recipeId) =>{
    try {
        const response = await axiosClient.get(`/api/recipes/${recipeId}/images`);
        return response.data;
    } catch (error) {
        console.error("/api/recipes/categories/all ERROR", error);
        return null;
    }
}

export default imageUrlsResponse;