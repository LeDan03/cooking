import axiosClient from "../../axiosClient";

const defaultYear = new Date().getFullYear();

export const getMonthlyRegisteredAccountsOfYear = async (year = defaultYear) => {
    try {
        const response = await axiosClient.get(`/api/accounts/admin/analytics/accounts/registrations?year=${year}`);
        return response;
    } catch (error) {
        console.warn("Can not get monthly registered accounts", error);
        return error;
    }
}

export const getMonthlyRecipeLovesOfYear = async (year = defaultYear) => {
    try {
        const response = await axiosClient.get(`/api/accounts/admin/analytics/accounts/loves?year=${year}`);
        return response;
    } catch (error) {
        console.warn("Can not get monthly loved recipes action", error);
        return error;
    }
}

export const getWeeklyRecipesOfYear = async (year = defaultYear) => {
    try {
        const response = await axiosClient.get(`/api/recipes/admin/analytics/recipes/weekly?year=${year}`);
        return response;
    } catch (error) {
        console.warn("Can not get monthly loved recipes action", error);
        return { data: [], status: 500 };
    }
}