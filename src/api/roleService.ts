import axiosInstance from './axiosInstance';
import { Role } from '../interfaces/Role';

export const roleService = {
  getRoles: async () => {
    const response = await axiosInstance.get('/roles');
    return response.data;
  },

  createRole: async (data: { type: string; level: number; is_active?: boolean }) => {
    const response = await axiosInstance.post('/roles', data);
    return response.data;
  },

  updateRole: async (id: number, data: Partial<Role>) => {
    const response = await axiosInstance.put(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: number) => {
    const response = await axiosInstance.delete(`/roles/${id}`);
    return response.data;
  },
};
