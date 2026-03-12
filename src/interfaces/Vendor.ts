export interface Vendor {
    id?: number;
    vendor_name: string;
    company: string;
    email?: string;
    phone?: string;
    category: string;
    address?: string;
    status?: boolean;
    notes?: string;
    created_by?: number;
}