import axiosInstance from './axiosInstance';
import { CreditNote } from '../interfaces/CreditDebitNote';

export const creditNoteService = {
    /**
     * Fetch paginated list of Purchase Orders
     * Aligned with GET /api/purchase-orders
     */
    getCreditNotes: async (page: number, limit: number) => {
        const response = await axiosInstance.get('/credit-notes', {
            params: { page, limit }
        });
        return response.data; // Expecting { success: true, data: { purchaseOrders: [], pagination: {} } }
    },

    /**
     * Fetch a single PO by ID
     * Aligned with GET /api/purchase-orders/{id}
     */
    getCreditNoteById: async (id: number) => {
        const response = await axiosInstance.get(`/credit-notes/${id}`);
        return response.data;
    },

    /**
     * Create or Update a Purchase Order
     * Aligned with POST /api/purchase-orders and PUT /api/purchase-orders/{id}
     */
    addCreditNote: async (data: CreditNote) => {
        return axiosInstance.post('/credit-notes', data);
    },
    updateCreditNote: async (id: number, data: CreditNote) => {
        return axiosInstance.put(`/credit-notes/${id}`, data);

    },

    /**
     * Delete a Purchase Order
     * Aligned with DELETE /api/purchase-orders/{id}
     */
    deleteCreditNote: async (id: number) => {
        return axiosInstance.delete(`/credit-notes/${id}`);
    },


    /**
     * Export POs to Excel
     * Note: Ensure the backend endpoint matches your export naming convention
     */
    exportToExcel: async () => {
        const response = await axiosInstance.get('/credit-notes/export/excel', {
            responseType: 'blob'
        });
        return response.data;
    }
};