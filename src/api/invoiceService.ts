import axiosInstance from './axiosInstance';
import { Invoice } from '../interfaces/Invoice';

export const invoiceService = {
    /**
     * Fetch paginated list of Purchase Orders
     * Aligned with GET /api/purchase-orders
     */
    getInvoices: async (page: number, limit: number) => {
        const response = await axiosInstance.get('/invoices', {
            params: { page, limit }
        });
        return response.data; // Expecting { success: true, data: { purchaseOrders: [], pagination: {} } }
    },

    /**
     * Fetch a single PO by ID
     * Aligned with GET /api/purchase-orders/{id}
     */
    getById: async (id: number) => {
        const response = await axiosInstance.get(`/invoices/${id}`);
        return response.data;
    },

    /**
     * Create or Update a Purchase Order
     * Aligned with POST /api/purchase-orders and PUT /api/purchase-orders/{id}
     */
    addInvoice: async (data: Invoice) => {
        return axiosInstance.post('/invoices', data);
    },
    updateInvoice: async (id: number, data: Invoice) => {
        return axiosInstance.put(`/invoices/${id}`, data);

    },

    /**
     * Delete a Purchase Order
     * Aligned with DELETE /api/purchase-orders/{id}
     */
    deleteInvoice: async (id: number) => {
        return axiosInstance.delete(`/invoices/${id}`);
    },
    getInvoiceDropdown: async (searchText: string) => {
        const response = await axiosInstance.get(`/invoices/dropdown/`, {
            params: { searchText }
        });
        return response.data;
    },

    /**
     * Export POs to Excel
     * Note: Ensure the backend endpoint matches your export naming convention
     */
    exportToExcel: async () => {
        const response = await axiosInstance.get('/invoices/export/excel', {
            responseType: 'blob'
        });
        return response.data;
    }
};