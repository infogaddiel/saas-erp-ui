import axiosInstance from './axiosInstance';
import { PurchaseOrder } from '../interfaces/PurchaseOrder';

export const purchaseOrderService = {
    /**
     * Fetch paginated list of Purchase Orders
     * Aligned with GET /api/purchase-orders
     */
    getPurchaseOrders: async (page: number, limit: number) => {
        const response = await axiosInstance.get('/purchase-orders', {
            params: { page, limit }
        });
        return response.data; // Expecting { success: true, data: { purchaseOrders: [], pagination: {} } }
    },

    /**
     * Fetch a single PO by ID
     * Aligned with GET /api/purchase-orders/{id}
     */
    getById: async (id: number) => {
        const response = await axiosInstance.get(`/purchase-orders/${id}`);
        return response.data;
    },

    /**
     * Create or Update a Purchase Order
     * Aligned with POST /api/purchase-orders and PUT /api/purchase-orders/{id}
     */
    addPurchaseOrder: async (data: PurchaseOrder) => {
        return axiosInstance.post('/purchase-orders', data);
    },
    updatePurchaseOrder: async (id: number, data: PurchaseOrder) => {
        return axiosInstance.put(`/purchase-orders/${id}`, data);

    },

    /**
     * Delete a Purchase Order
     * Aligned with DELETE /api/purchase-orders/{id}
     */
    deletePurchaseOrder: async (id: number) => {
        return axiosInstance.delete(`/purchase-orders/${id}`);
    },


    /**
     * Export POs to Excel
     * Note: Ensure the backend endpoint matches your export naming convention
     */
    exportToExcel: async () => {
        const response = await axiosInstance.get('/purchase-orders/export/excel', {
            responseType: 'blob'
        });
        return response.data;
    }
};