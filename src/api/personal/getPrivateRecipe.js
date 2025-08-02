import axiosClient from "../axiosClient";

const privateRecipeResponse = async()=>{
    try {
        const response = await axiosClient.get('/api/recipes/me/private-recipes');
        return response;
    } catch (error) {
        console.warn("GET private recipes failed", error);
        return [];
    }
}

export default privateRecipeResponse;