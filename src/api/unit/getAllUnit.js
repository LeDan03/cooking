import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const unitsResponse = async () => {
    try {
        const response = await axiosClient.get('/api/recipes/units');
        if (response.status === HttpStatusCode.Ok) {
            return response.data;
        }
    } catch (error) {
        console.error("/units failed", error);
        return [];
    }
}

export default unitsResponse;