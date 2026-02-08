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
    deleteItem: async (id: number) => axiosInstance.delete(`/items/${id}`)
};