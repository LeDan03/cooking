import axiosClient from "../axiosClient";

const categoriesResult = async () =>{
    try {
        const response = await axiosClient.get("/api/recipes/categories/all");
        return response;
    } catch (error) {
        console.error("/api/recipes/categories/all ERROR", error);
        return [];
    }
}

export default categoriesResult;