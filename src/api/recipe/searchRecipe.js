import axiosClient from "../axiosClient";

const searchResult = async(keyword)=>{
    const searchKey = keyword.trim();
    try {
        const response = await axiosClient.get(`/api/recipes/search?keyword=${searchKey}`);
        return response.data;
    } catch (error) {
        console.error("API /search error", error.message)
        return [];
    }
}

export default searchResult;