import axiosClient from "../axiosClient";

const followActResponse = async(followeeId)=>{
    try {
        const response = await axiosClient.post(`/api/accounts/me?followeeId=${followeeId}`);
        return response;
    } catch (error) {
        console.warn("/me follow failed", error);
        return false;
    }
}

export default followActResponse;