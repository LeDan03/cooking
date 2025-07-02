import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const accountResponse = async(accountId)=>{
    try {
        const response = await axiosClient.get(`/api/accounts/${accountId}`);
        if(response.status===HttpStatusCode.Ok){
            return response.data;
        }else{
            return {}
        }
    } catch (error) {
        console.error('/accounts/id failed',error);
        return false;
    }
}

export default accountResponse;