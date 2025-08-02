import getAxiosClient from "../axiosClient";

const requiredPublicResponse = async (recipeId) => {
    try {
         const axiosClient = await getAxiosClient();
        const response = await axiosClient.post(`/api/recipes/me/${recipeId}/required-public`);
        return response;
    } catch (error) {
        console.warn("UPDATE private recipes->public failed", error);
        return [];
    }
}

export default requiredPublicResponse;