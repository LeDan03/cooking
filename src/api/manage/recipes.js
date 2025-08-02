import axiosClient from '../axiosClient';

const pendingRecipesResponse = async () => {
    try {
        const response = await axiosClient.get('/api/accounts/admin/pending-recipes');
        return response;
    } catch (error) {
        console.warn("/GET pending recipes failed", error);
        return [];
    }
}
export const approveRecipeResponse = async (recipeId) => {
    try {
        const response = await axiosClient.post(`/api/accounts/admin/${recipeId}/approval`);
        return response;
    } catch (error) {
        console.warn("Approve RECIPE with id: " + recipeId + " failed", error);
        return false;
    }
}

export const rejectRecipeResponse = async (messageRequest) => {
    try {
        const response = await axiosClient.post("/api/accounts/admin/rejection", messageRequest);
        return response;
    } catch (error) {
        console.warn("REJECT recipe failed", error);
        return error.response.data;
    }
}

export default pendingRecipesResponse;