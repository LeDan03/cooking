import axiosClient from "../axiosClient";

const recipesResult = async (all = false, page = 0, limit = 30) => {
    try {
        const url = all
            ? `/api/recipes?all=true`
            : `/api/recipes?page=${page}&limit=${limit}`;
        
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
};

export default recipesResult;
