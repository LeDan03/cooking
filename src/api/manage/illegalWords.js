import axiosClient from "../axiosClient";

const getAllIllegalWordsResponse = async () => {
    try {
        const result = await axiosClient.get("/api/recipes/illegal-word");
        return result;
    } catch (error) {
        console.warn("Lỗi lấy danh sách từ cấm", error);
        return error;
    }
}

export default getAllIllegalWordsResponse