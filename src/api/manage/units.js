import axiosClient from '../axiosClient';

const unitsResponse = async () => {
    try {
        const response = await axiosClient.get('/api/recipes/units');
        return response;
    } catch (error) {
        console.warn("GET UNITs failed", error.response);
        return error.response.data;
    }
}
export const createUnitResponse = async (unitRequest) => {
    try {
        const response = await axiosClient.post(`/api/recipes/admin/unit`, unitRequest);
        return response;
    } catch (error) {
        console.warn("CREATE UNIT failed", error.response);
        alert(error.response.data.message);
        return error.response.data;
    }
}

export const deleteUnitResponse = async (id) => {
    try {
        const response = await axiosClient.delete(`/api/recipes/admin/unit/${id}`);
        return response;
    } catch (error) {
        console.warn("DELETE UNIT failed", error.response);
        alert(error.response.data.message);
        return error.response.data;
    }
}

export default unitsResponse;