import { Project } from '../interfaces/Project';
import axiosInstance from './axiosInstance';

export const projectService = {
    addProject: async (projectData: Project) => {
        const response = await axiosInstance.post('/projects', projectData);
        return response.data;
    },

    getProjects: async (page = 1, limit = 10) => {
        const response = await axiosInstance.get('/projects', {
            params: { page, limit }
        });
        return response.data;
    },

    getProjectDropdown: async (searchText: string) => {
        const response = await axiosInstance.get(`/projects/dropdown/`, {
            params: { searchText }
        });
        return response.data;
    },

    getProjectById: async (id: number) => {
        const response = await axiosInstance.get(`/projects/${id}`);
        return response.data;
    },

    updateProject: async (id: number, projectData: Project) => {
        const response = await axiosInstance.put(`/projects/${id}`, projectData);
        return response.data;
    },

    deleteProject: async (id: number) => {
        const response = await axiosInstance.delete(`/projects/${id}`);
        return response.data;
    },
    exportToExcel: async () => {
        const response = await axiosInstance.get('/projects/export/excel', {
            responseType: 'blob' // Tells Axios to handle the binary stream correctly
        });
        return response.data;
    },
     bulkCreate: async (data: any[]) => {
    return axiosInstance.post('/projects/bulk/create', {
      upload_type: 'Projects',
      projects: data
    });
  },
};