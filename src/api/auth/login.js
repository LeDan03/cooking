import axiosClient from "../axiosClient";

const emailLoginResult = async ({ email, password }) => {
    try {
        const response = await axiosClient.post('/api/accounts/auth/login', { 'email': email, 'password': password });
        return response;
    } catch (error) {
        if (error.response && error.response.data?.message) {
            alert(error.response.data.message);
        } else {
            alert("Có lỗi xảy ra!");
        }
    }
}

export default emailLoginResult;