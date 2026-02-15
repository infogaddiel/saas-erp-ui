export interface Company {
    id?: number;
    name: string;
    address?: string;
    email?: string;
    mobile?: string;
    website_url?: string;
    pan_number?:string;
    gst_number?: string;
    logo?: string | File | null;
    status?: boolean;
    created_at?:string,
    updated_at?:string
    // Add other fields from your Joi schema as needed
}

export interface CompanyApiResponse {
    success: boolean;
    data: Company;
    message?: string;
}