import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const difficultiesResponse = async()=>{
    try {
        const response = await axiosClient.get('/api/recipes/difficulties');
        if(response.status === HttpStatusCode.Ok){
            return response.data;
        }
    } catch (error) {
        console.error("/difficulties failed", error);
        return [];
    }
}
export default difficultiesResponse;