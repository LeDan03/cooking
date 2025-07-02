import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const followersResponse = async () => {
    try {
        const response = await axiosClient.get(`/api/accounts/me/followers`);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
        else return false;
    } catch (error) {
        console.error('/followers failed', error);
        return null;
    }
}

export default followersResponse;