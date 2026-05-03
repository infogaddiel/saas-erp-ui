import axiosInstance from './axiosInstance';
import { DebitNote } from '../interfaces/CreditDebitNote';

export const debitNoteService = {
    /**
     * Fetch paginated list of Debit Notes
     * Aligned with GET /api/debit-notes
     */
    getDebitNotes: async (page: number, limit: number) => {
        const response = await axiosInstance.get('/debit-notes', {
            params: { page, limit }
        });
        return response.data; // Expecting { success: true, data: { debitNotes: [], pagination: {} } }
    },

    /**
     * Fetch a single Debit Note by ID
     * Aligned with GET /api/debit-notes/{id}
     */
    getDebitNoteById: async (id: number) => {
        const response = await axiosInstance.get(`/debit-notes/${id}`);
        return response.data;
    },

    /**
     * Create a new Debit Note
     * Aligned with POST /api/debit-notes
     */
    addDebitNote: async (data: DebitNote) => {
        return axiosInstance.post('/debit-notes', data);
    },

    /**
     * Update an existing Debit Note by ID
     * Aligned with PUT /api/debit-notes/{id}
     */
    updateDebitNote: async (id: number, data: DebitNote) => {
        return axiosInstance.put(`/debit-notes/${id}`, data);
    },

    /**
     * Delete a Debit Note
     * Aligned with DELETE /api/debit-notes/{id}
     */
    deleteDebitNote: async (id: number) => {
        return axiosInstance.delete(`/debit-notes/${id}`);
    },

    /**
     * Export Debit Notes to Excel
     * Aligned with GET /api/debit-notes/export/excel
     */
    exportToExcel: async () => {
        const response = await axiosInstance.get('/debit-notes/export/excel', {
            responseType: 'blob'
        });
        return response.data;
    }
};