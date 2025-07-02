import axiosClient from "../axiosClient";

const createAccountResult = async ({email, password, username}) => {
    try {
        const response = await axiosClient.post("/api/accounts/auth/register", { 'email': email, 'password': password, 'username': username });
        return response;
    } catch (error) {
        console.error("/api/accounts/auth/register FAILED", error);
        return error;
    }
}

export default createAccountResult;