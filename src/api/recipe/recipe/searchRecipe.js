import axiosClient from "../../axiosClient";

const searchResult = async (keyword, page = 0, size = 20) => {
    const searchKey = keyword.trim();
    try {
        const response = await axiosClient.get(`/api/recipes/search?keyword=${searchKey}&page=${page}&size=${size}`);
        return response.data;
    } catch (error) {
        console.warn(error.response.data.message);
        return [];
    }
}

export default searchResult;