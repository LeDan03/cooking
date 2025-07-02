import axiosClient from "../axiosClient";

const mainImagesResponse = async (recipeIds) => {
    try {
        const response = await axiosClient.post(
            '/api/recipes/main-images',
            recipeIds,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('/main-images failed', error.response?.data || error);
        return null;
    }
};


export default mainImagesResponse;