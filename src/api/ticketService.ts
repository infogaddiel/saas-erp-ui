import { ServiceReportRequest, ServiceReportResponse, ServicResponse, Ticket, TicketDropdownApiResponse, TicketResponse, TicketStatusHistoryResponse } from '../interfaces/Ticket';
import axiosInstance from './axiosInstance';

export const ticketService = {
    // Get all tickets with pagination
    getTickets: async (page: number, limit: number): Promise<TicketResponse> => {
        const response = await axiosInstance.get('/tickets', {
            params: { page, limit }
        });
        return response.data;
    },

    // Add a new ticket
    addTicket: async (ticketData: Ticket): Promise<Ticket> => {
        const response = await axiosInstance.post('/tickets', ticketData);
        return response.data;
    },

    // Update an existing ticket
    updateTicket: async (id: number, data: Ticket): Promise<Ticket> => {
        const response = await axiosInstance.put(`/tickets/${id}`, data);
        return response.data;
    },

    // Delete a ticket
    deleteTicket: async (id: number): Promise<Ticket> => {
        const response = await axiosInstance.delete(`/tickets/${id}`);
        return response.data;
    },

    // Bulk creation for tickets (matches your customer implementation)
    bulkCreate: async (data: any[]) => {
        return axiosInstance.post('/bulk/create', {
            upload_type: 'tickets',
            data: data
        });
    },

    // Optional: Get tickets filtered by technician (Common in ERPs)
    getTicketsByTechnician: async (techId: number): Promise<Ticket[]> => {
        const response = await axiosInstance.get(`/tickets/technician/${techId}`);
        return response.data;
    },
    getTicketStatusHistory: async (id: number): Promise<TicketStatusHistoryResponse> => {
        const response = await axiosInstance.get(`/tickets/${id}/status-history`);
        return response.data
    },
    getTicketsDropDown: async (searchText: string, customer_id: number | null = null): Promise<TicketDropdownApiResponse> => {
        const response = await axiosInstance.get(`/tickets/dropdown`, {
            params: { searchText, customer_id }
        });
        return response.data;
    },
     getServiceReports: async (page: number, limit: number): Promise<ServicResponse> => {
        const response = await axiosInstance.get('/tickets/services', {
            params: { page, limit }
        });
        return response.data;
    },
    getServiceReportById: async (ticketId:number, serviceId:number): Promise<ServiceReportResponse> => {
        const response = await axiosInstance.get(`/tickets/${ticketId}/services/${serviceId}`);
        return response.data;
    },

    createServiceReport: async (ticketId: number, reportData: Partial<ServiceReportRequest>): Promise<ServiceReportResponse> => {
        const response = await axiosInstance.post(`/tickets/${ticketId}/services`, reportData);
        return response.data;
    },
     updateServiceReport: async (ticketId: number,serviceId: number, reportData: Partial<ServiceReportRequest>): Promise<ServiceReportResponse> => {
        const response = await axiosInstance.put(`/tickets/${ticketId}/services/${serviceId}`, reportData);
        return response.data;
    },
    upload: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/uploads', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // According to your controller: return res.status(201).json({ data: { url: ... } })
        return response.data.data.url;
    },
     deleteServiceReport: async (ticketId:number,serviceId: number): Promise<Ticket> => {
        const response = await axiosInstance.delete(`/tickets/${ticketId}/services/${serviceId}`);
        return response.data;
    },

};