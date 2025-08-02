import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const accountResponse = async (accountId) => {
    try {
        const response = await axiosClient.get(`/api/accounts/${accountId}`);
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        } else {
            return {}
        }
    } catch (error) {
        console.warn('/accounts/id failed', error);
        return false;
    }
}

export const searchByEmailResponse = async (email) => {
    try {
        const response = await axiosClient.get(`/api/accounts/search?email=${email}`);
        return response;
    } catch (error) {
        if (error.response.data.status === HttpStatusCode.NotFound) {
            return null;
        }
        console.warn('search by email failed', error);
        return false;
    }
}

export const searchByUsernameResponse = async (username) => {
    try {
        const response = await axiosClient.get(`/api/accounts/search?username=${username}`);
        return response;
    } catch (error) {
        if (error.response.data.status === HttpStatusCode.NotFound) {
            return null;
        }
        console.warn('search by username failed', error);
        return false;
    }
}

export default accountResponse;