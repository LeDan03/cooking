import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const recipesResponse = async () => {
    try {
        const response = await axiosClient('/api/recipes/me/recipes');
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
        else {
            return [];
        }
    } catch (error) {
        console.warn('/recipes/me/recipes failed', error);
        return null;
    }
}

export default recipesResponse;