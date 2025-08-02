import axiosClient from "../axiosClient";

const logOutResponse = async () => {
    try {
        const response = await axiosClient.post("/api/accounts/auth/logOut");
        return response;
    } catch (error) {
        console.warn("/logOut failed", error);
    }
}

export default logOutResponse;