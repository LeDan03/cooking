import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const lovedRecipesResponse = async()=>{
    try {
        const response = await axiosClient('/api/accounts/me/loved-recipes');
        if(response.status === HttpStatusCode.Ok){
            return response.data;
        }
        else{
            return [];
        }
    } catch (error) {
        console.warn('/loved-recipes failed', error);
        return null;
    }
}

export default lovedRecipesResponse;