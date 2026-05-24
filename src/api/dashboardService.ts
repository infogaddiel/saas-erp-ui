import axiosInstance from './axiosInstance';
export const dashboardService = {
    getGeneralOverView: async () => {
        const response = await axiosInstance.get('/dashboard/general-overview');
        return response.data;
    }
};