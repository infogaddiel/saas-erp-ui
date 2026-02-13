import { Ticket, TicketResponse, TicketStatusHistoryResponse } from '../interfaces/Ticket';
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
    }
};