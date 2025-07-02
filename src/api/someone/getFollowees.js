import axiosClient from "../axiosClient";

const someoneFolloweesResponse = async(accountId)=>{
    try {
        const response = await axiosClient.get(`/api/accounts/${accountId}/followees`);
        return response;
    } catch (error) {
        console.error("GET someone followees failed", error);
        return null;
    }
}

export default someoneFolloweesResponse;