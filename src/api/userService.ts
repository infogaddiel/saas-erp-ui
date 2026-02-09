import { Staff, StaffApiResponse, StaffDropdown, StaffDropdownApiResponse } from '../interfaces/Staff';
import axiosInstance from './axiosInstance';



export const userService = {
    // Get all customers
    getUsers: async (page: number, limit: number): Promise<StaffApiResponse> => {
        const response = await axiosInstance.get('/users', {
            params: { page, limit }
        });
        return response.data;
    },

    // Add a new customer
    addUser: async (customerData: Staff): Promise<Staff> => {
        const response = await axiosInstance.post('/users', customerData);
        return response.data;
    },

    updateUser: async (id: number, data: Staff): Promise<Staff> => {
        const response = await axiosInstance.put(`/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: number): Promise<Staff> => {
        const response = await axiosInstance.delete(`/users/${id}`);
        return response.data;
    },
    getUsersByRole: async (role_id:number): Promise<StaffDropdownApiResponse> => {
        const response = await axiosInstance.get('/users/dropdown', {
            params: { role_id }
        });
        return response.data;
    },

};