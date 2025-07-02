import axiosClient from "../axiosClient";

const myData = async () => {
    try {
        const response = await axiosClient.get("/api/accounts/me");
        return response.data;
    } catch (error) {
        console.error("/me failed", error);
        return null;
    }
}

export const updateAvt = async ({ username, newAvtUrl }) => {
    try {
        const response = await axiosClient.put('/api/accounts/me', { username: username, avatarUrl: newAvtUrl });
        return response;
    } catch (error) {
        console.error("/me update avt failed", error);
        return false;
    }
}

export default myData;