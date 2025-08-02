import { HttpStatusCode } from "axios";
import axiosClient from "../../axiosClient";

const commentsResponse = async (recipeId) => {
    try {
        const response = await axiosClient.get(`/api/recipes/${recipeId}/comments`);
        return response;
    } catch (error) {
        console.warn(error)
        return;
    }
}

export default commentsResponse;