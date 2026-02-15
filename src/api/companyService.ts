import { Company, CompanyApiResponse } from '../interfaces/Company';
import axiosInstance from './axiosInstance';

export const companyService = {
    // Get company details
    getCompanyDetails: async (id: number): Promise<CompanyApiResponse> => {
        const response = await axiosInstance.get(`/companies/${id}`);
        return response.data;
    },

    // Update company details (handles text and file upload)
    updateCompany: async (id: number, companyData: Company): Promise<CompanyApiResponse> => {
        const response = await axiosInstance.put(`/companies/${id}`, {
            ...companyData

        });
        return response.data;
    },
    uploadLogo: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post('/uploads', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // According to your controller: return res.status(201).json({ data: { url: ... } })
        return response.data.data.url;
    }
};