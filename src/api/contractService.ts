import { Contract } from '../interfaces/Contract';
import axiosInstance from './axiosInstance';

export const contractService = {
    addContract: async (contractData:Contract) => {
        const response = await axiosInstance.post('/contracts', contractData);
        return response.data;
    },

    getContracts: async (page = 1, limit = 10) => {
        const response = await axiosInstance.get('/contracts', {
            params: { page, limit }
        });
        return response.data;
    },

    getContractDropdown: async (customerId:number) => {
        const response = await axiosInstance.get(`/contracts/dropdown/${customerId}`);
        return response.data;
    },

    getContractById: async (id:number) => {
        const response = await axiosInstance.get(`/contracts/${id}`);
        return response.data;
    },

    updateContract: async (id:number, contractData:Contract) => {
        const response = await axiosInstance.put(`/contracts/${id}`, contractData);
        return response.data;
    },

    deleteContract: async (id:number) => {
        const response = await axiosInstance.delete(`/contracts/${id}`);
        return response.data;
    }
};