import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const savedRecipesResponse = async()=>{
    try {
        const response = await axiosClient('/api/accounts/me/saved-recipes');
        if(response.status === HttpStatusCode.Ok){
            return response.data;
        }
        else{
            return [];
        }
    } catch (error) {
        console.warn('/saved-recipes failed', error);
        return null;
    }
}

export default savedRecipesResponse;