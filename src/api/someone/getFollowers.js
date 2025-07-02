import axiosClient from "../axiosClient";

const someoneFollowersResponse = async(accountId)=>{
    try {
        const response = await axiosClient.get(`/api/accounts/${accountId}/followers`);
        return response;
    } catch (error) {
        console.error("GET someone followees failed", error);
        return null;
    }
}

export default someoneFollowersResponse;