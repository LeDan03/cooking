import { HttpStatusCode } from "axios";
import axiosClient from "../axiosClient";

const getThisWeekTrending = async()=>{
    try {
        const response = await axiosClient.get("/api/analytics/trending");
        return response;
    } catch (error) {
        if(error.response.data.status === HttpStatusCode.NotFound){
            return;
        }
        console.warn("Lấy dữ liệu trending thất bại", error.response);
        return null;
    }
}

export default getThisWeekTrending