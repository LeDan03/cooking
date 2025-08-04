import axiosClient from "../axiosClient";

const communityMessageResponse = async()=>{
    try {
        const response = await axiosClient.get("/api/accounts/messages/community");
        return response;
    } catch (error) {
        console.warn("Get community message failed", error);
        return null;
    }
}

export default communityMessageResponse;