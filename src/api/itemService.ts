import axiosInstance from './axiosInstance';
import { Item } from '../interfaces/Item';

export const itemService = {
  getItems: async (page: number, limit: number) => {
    const response = await axiosInstance.get('/items', { params: { page, limit } });
    return response.data; // Expecting { items: [], pagination: {} }
  },
  saveItem: async (data: Item) => {
    return data.id
      ? axiosInstance.put(`/items/${data.id}`, data)
      : axiosInstance.post('/items', data);
  },
  deleteItem: async (id: number) => axiosInstance.delete(`/items/${id}`),
  bulkCreate: async (data: any[]) => {
    return axiosInstance.post('/items/bulk/create', {
      upload_type: 'Items',
      items: data
    });
  },
  exportToExcel: async () => {
    const response = await axiosInstance.get('/items/export/excel', {
      responseType: 'blob' // Tells Axios to handle the binary stream correctly
    });
    return response.data;
  },

  getItemsDropdown: async (searchText: string) => {
        const response = await axiosInstance.get(`/items/dropdown/`, {
            params: { searchText }
        });
        return response.data;
    },
  
};