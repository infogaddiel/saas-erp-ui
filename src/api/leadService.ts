import axiosInstance from './axiosInstance';
import { Lead } from '../interfaces/Lead'; // Ensure you create this interface

export const leadService = {
    // Basic CRUD
    addLead: async (leadData: Lead) => {
        const response = await axiosInstance.post('/leads', leadData);
        return response.data;
    },

    getLeads: async (page = 1, limit = 10, search = '') => {
        const response = await axiosInstance.get('/leads', {
            params: { page, limit, search }
        });
        return response.data;
    },

    getLeadById: async (id: number) => {
        const response = await axiosInstance.get(`/leads/${id}`);
        return response.data;
    },

    updateLead: async (id: number, leadData: Lead) => {
        const response = await axiosInstance.put(`/leads/${id}`, leadData);
        return response.data;
    },

    deleteLead: async (id: number) => {
        const response = await axiosInstance.delete(`/leads/${id}`);
        return response.data;
    },

    // Lead Status Management
    updateCurrentStatus: async (id: number, statusData: { lead_status_id: number; remarks?: string }) => {
        const response = await axiosInstance.put(`/leads/${id}/status`, statusData);
        return response.data;
    },

    getLeadStatusHistory: async (id: number) => {
        const response = await axiosInstance.get(`/leads/${id}/status-history`);
        return response.data;
    },

    // Dropdowns
    getLeadDropdown: async (searchText: string) => {
        const response = await axiosInstance.get('/leads/dropdown', {
            params: { search: searchText }
        });
        return response.data;
    },

    getLeadStatusDropdown: async () => {
        const response = await axiosInstance.get('/leads/statuses/dropdown');
        return response.data;
    },
    exportToExcel: async () => {
        const response = await axiosInstance.get('/leads/export/excel', {
            responseType: 'blob' // Tells Axios to handle the binary stream correctly
        });
        return response.data;
    },
    // Bulk Operations
    bulkCreate: async (data: any[]) => {
        return axiosInstance.post('/leads/bulk/create', {
            upload_type: 'Leads',
            leads: data
        });
    },

    // Status Master Data (Configuration)
    getLeadStatuses: async () => {
        const response = await axiosInstance.get('/leads/statuses');
        return response.data;
    }
};