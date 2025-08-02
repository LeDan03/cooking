import axiosClient from "../axiosClient";

export const deleteCategoryResponse = async (id) => {
    try {
        const response = await axiosClient.delete(`/api/recipes/admin/category/${id}`);
        return response;
    } catch (error) {
        console.warn(error.response);
        alert(error.response.data.message);
    }
}

export const createCategoryResponse = async (categoryRequest) => {
    try {
        const response = await axiosClient.post(`/api/recipes/admin/category`, categoryRequest);
        return response;
    } catch (error) {
        console.warn('CREATE CATEGORY FAILED', error);
        alert(error.response.data.message);
        return error.response;
    }
}