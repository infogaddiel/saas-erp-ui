export interface Customer {
  id?: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  type?: 'Individual' | 'Company';
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