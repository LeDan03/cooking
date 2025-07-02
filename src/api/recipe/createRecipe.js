import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const createRecipeResponse = async(recipe)=>{
    try {
        const response = await axiosClient.post('/api/recipes', recipe);
        if(response.status === HttpStatusCode.Ok){
            return response.data;
        }
    } catch (error) {
        console.error('/recipe create new failed', error);
        return null;
    }
}

export default createRecipeResponse;