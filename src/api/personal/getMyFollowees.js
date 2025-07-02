import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const followeesResponse = async () => {
    try {
        const response = await axiosClient.get(`/api/accounts/me/followees`);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
        else return false;
    } catch (error) {
        console.error('/followees failed', error);
        return null;
    }
}

export default followeesResponse;