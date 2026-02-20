import { ContactPerson, CustomeDropdownApiResponse, Customer, CustomerApiResponse, SingleCustomerResponse } from '../interfaces/Customer';
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
    addCustomer: async (customerData: Customer): Promise<SingleCustomerResponse> => {
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
        return axiosInstance.post('/customers/bulk/create', {
            upload_type: 'customers',
            customers: data
        });
    },
    getCustomersDropDown: async (searchText: string): Promise<CustomeDropdownApiResponse> => {
        const response = await axiosInstance.get('/customers/dropdown', {
            params: { searchText }
        });
        return response.data;
    },

    exportToExcel: async () => {
        const response = await axiosInstance.get('/customers/export/excel', {
            responseType: 'blob' // Tells Axios to handle the binary stream correctly
        });
        return response.data;
    },
    getCustomersType: async (): Promise<any> => {
        const response = await axiosInstance.get('/customers/customer-types');
        return response.data;
    },
    async addContactDetail(customerId: number, contactData: ContactPerson | ContactPerson[]) {
        const response = await axiosInstance.post(`/customers/${customerId}/details`, contactData);
        return response.data;
    },
    async updateContactDetail(customerId: number, detailId: number, data: ContactPerson) {
        const response = await axiosInstance.put(`/customers/${customerId}/details/${detailId}`, data);
        return response.data;
    },
    async deleteContactDetail(customerId: number, detailId: number) {
    const response = await axiosInstance.delete(`/customers/${customerId}/details/${detailId}`);
    return response.data;
}

};