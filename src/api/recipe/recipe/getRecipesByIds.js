import axiosClient from "../../axiosClient"

const getRecipesByIdsResponse = async(ids)=>{
    try {
        const repsonse = await axiosClient.post("/api/recipes/by-ids", ids);
        console.log("RECIPES By ids repsonse", repsonse);
        return repsonse;
    } catch (error) {
        console.warn("Lấy danh sách công thức thất bại", error.repsonse);
        return error;
    }
}

export default getRecipesByIdsResponse;