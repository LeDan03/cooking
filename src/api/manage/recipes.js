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

export const rejectRecipeResponse = async ({ accountId, messageId, recipeId }) => {
    try {
        const response = await axiosClient.post(`/api/accounts/admin/messages/recipe/rejection?accountId=${accountId}&messageId=${messageId}&recipeId=${recipeId}`);
        return response;
    } catch (error) {
        console.warn("REJECT recipe failed", error);
        return error.response.data;
    }
}

export default pendingRecipesResponse;