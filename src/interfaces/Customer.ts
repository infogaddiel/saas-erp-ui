export interface Customer {
  id?: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  pan_number?: string;
  gst_number?: string;
  ship_address?: string;
  type?: 'Individual' | 'Company';
  customer_type_id?: number;
  customerType?: {
    id: number,
    name: string
  };
  customerDetails?: ContactPerson[];
  status?: boolean;
  created_by?: number;
}

export interface CustomerApiResponse {
  users: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CustomeDropdownApiResponse {
  success: boolean;
  data: Customer[]; // This is the 'data' property the error is looking for
  message?: string;
}

export interface SingleCustomerResponse {
  success: boolean;
  data: Customer;
  message?: string;
}

export interface ContactPerson {
  id?: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
}