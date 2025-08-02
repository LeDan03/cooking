import { HttpStatusCode } from "axios";
import axiosClient from "../../axiosClient";

const similarRecipesResponse = async (recipeId, keyword, page = 0, size = 10) => {
    try {
        const response = await axiosClient.get(`/api/recipes/${recipeId}/similar?keyword=${keyword}&page=${page}&size=${size}`);
        return response.data;
    } catch (error) {
        if (error.response.data.status !== HttpStatusCode.NotFound) {
            console.error(error.response.data.message);
            return error.response;
        }
        else {
            console.error(error.response.data.message);
            return error.response;
        }
    }
}

export default similarRecipesResponse;