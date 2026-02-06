import axiosInstance from './axiosInstance';

export interface Customer {
  id?: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  type: 'Individual' | 'Company';
  status?: boolean;
  created_by?: number;
}

export const customerService = {
  // Get all customers
  getCustomers: async (): Promise<Customer[]> => {
    const response = await axiosInstance.get('/customers');
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
  }
};