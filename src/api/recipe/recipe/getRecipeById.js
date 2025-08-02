import axiosClient from "../../axiosClient";

const recipeResult = async(recipeId)=>{
    try {
        const response = await axiosClient.get(`/api/recipes/${recipeId}`);
        return response.data;
    } catch (error) {
        console.error("get recipe by id failed", error);
        return null;
    }
}

export default recipeResult;