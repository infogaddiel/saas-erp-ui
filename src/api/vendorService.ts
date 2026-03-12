import { Vendor } from '../interfaces/Vendor';
import axiosInstance from './axiosInstance';

export const vendorService = {
    // Create a new vendor
    addVendor: async (vendorData: Vendor) => {
        const response = await axiosInstance.post('/vendors', vendorData);
        return response.data;
    },

    // Get paginated list of vendors
    getVendors: async (page = 1, limit = 10) => {
        const response = await axiosInstance.get('/vendors', {
            params: { page, limit }
        });
        return response.data;
    },

    // Search for vendors (useful for IonSelect or search bars)
    getVendorDropdown: async (searchText: string) => {
        const response = await axiosInstance.get(`/vendors/dropdown/`, {
            params: { searchText }
        });
        return response.data;
    },

    // Fetch a single vendor by ID
    getVendorById: async (id: number) => {
        const response = await axiosInstance.get(`/vendors/${id}`);
        return response.data;
    },

    // Update existing vendor details
    updateVendor: async (id: number, vendorData: Vendor) => {
        const response = await axiosInstance.put(`/vendors/${id}`, vendorData);
        return response.data;
    },

    // Delete a vendor
    deleteVendor: async (id: number) => {
        const response = await axiosInstance.delete(`/vendors/${id}`);
        return response.data;
    },
    getVendorsDropDown: async (searchText: string) => {
        const response = await axiosInstance.get(`/vendors/dropdown/`, {
            params: { searchText }
        });
        return response.data;
    },

    // Download vendors list as Excel (Blob handling for Ionic/Web)
    exportToExcel: async () => {
        const response = await axiosInstance.get('/vendors/export/excel', {
            responseType: 'blob'
        });
        return response.data;
    },

    // Bulk upload/create vendors
    bulkCreate: async (data: Vendor[]) => {
        return axiosInstance.post('/vendors/bulk/create', {
            upload_type: 'Vendors',
            vendors: data
        });
    },
};