import axiosClient from "../axiosClient";

const someoneRecipesResponse = async(accountId)=>{
    try {
        const response = await axiosClient.get(`/api/recipes/${accountId}/recipes`);
        return response.data;
    } catch (error) {
        console.error("GET someone recipes failed", error);
        return null;
    }
}

export default someoneRecipesResponse;