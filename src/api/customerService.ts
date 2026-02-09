import { Customer, CustomerApiResponse } from '../interfaces/Customer';
import axiosInstance from './axiosInstance';



export const customerService = {
    // Get all customers
    getCustomers: async (page: number, limit: number): Promise<CustomerApiResponse> => {
        const response = await axiosInstance.get('/customers', {
            params: { page, limit }
        });
        return response.data;
    },

    // Add a new customer
    addCustomer: async (customerData: Customer): Promise<Customer> => {
        const response = await axiosInstance.post('/customers', customerData);
        return response.data;
    },

    updateCustomer: async (id: number, data: Customer): Promise<Customer> => {
        const response = await axiosInstance.put(`/customers/${id}`, data);
        return response.data;
    },

    deleteCustomer: async (id: number): Promise<Customer> => {
        const response = await axiosInstance.delete(`/customers/${id}`);
        return response.data;
    },
    bulkCreate: async (data: any[]) => {
        return axiosInstance.post('/bulk/create', {
            upload_type: 'customers',
            data: data
        });
    }

};