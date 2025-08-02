import axiosClient from "../axiosClient";

const accountsResponse = async (accountsRequest) => {
    try {
        const response = await axiosClient.post('/api/accounts/admin/accounts', accountsRequest);
        return response;
    } catch (error) {
        console.warn('GET ACCOUNTS PAGEABLE failed', error);
        alert(error.data.message);
    }
}

export const toggleAccountStatusResponse = async(accountId)=>{
    try {
        const response = await axiosClient.put(`/api/accounts/admin/accounts/${accountId}`);
        return response; 
    } catch (error) {
        console.warn('TOOGLE ACCOUNTS STATUS failed', error);
        alert(error.response.data.message);
    }
}

export default accountsResponse