import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const loveResponse = async(recipeId)=>{
    try {
        const response = await axiosClient.post(`/api/accounts/${recipeId}/love`);
        if(response.status===HttpStatusCode.Ok){
            return true;
        }
        else return false;
    } catch (error) {
        console.error('/save failed', error);
        return null;
    }
}

export default loveResponse;