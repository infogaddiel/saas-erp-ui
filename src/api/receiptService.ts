import axiosInstance from './axiosInstance';
import { CreditNote } from '../interfaces/CreditDebitNote';

export const receiptService = {
    /**
     * Fetch paginated list of Purchase Orders
     * Aligned with GET /api/purchase-orders
     */
    getReceipts: async (page: number, limit: number) => {
        const response = await axiosInstance.get('/receipts', {
            params: { page, limit }
        });
        return response.data; // Expecting { success: true, data: { purchaseOrders: [], pagination: {} } }
    },

    /**
     * Fetch a single PO by ID
     * Aligned with GET /api/purchase-orders/{id}
     */
    getReceiptById: async (id: number) => {
        const response = await axiosInstance.get(`/receipts/${id}`);
        return response.data;
    },

    /**
     * Create or Update a Purchase Order
     * Aligned with POST /api/purchase-orders and PUT /api/purchase-orders/{id}
     */
    addReceipt: async (data: CreditNote) => {
        return axiosInstance.post('/receipts', data);
    },
    updateReceipt: async (id: number, data: CreditNote) => {
        return axiosInstance.put(`/receipts/${id}`, data);

    },

    /**
     * Delete a Purchase Order
     * Aligned with DELETE /api/purchase-orders/{id}
     */
    deleteReceipt: async (id: number) => {
        return axiosInstance.delete(`/receipts/${id}`);
    },


    /**
     * Export POs to Excel
     * Note: Ensure the backend endpoint matches your export naming convention
     */
    exportToExcel: async () => {
        const response = await axiosInstance.get('/receipts/export/excel', {
            responseType: 'blob'
        });
        return response.data;
    }
};