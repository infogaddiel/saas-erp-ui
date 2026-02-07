export type StaffRole = 'Admin' | 'Manager' | 'Technician' | 'Staff';

export interface Staff {
    id?: number;
    name: string;
    email: string;
    mobile: string;
    address: string;
    menu_ids?: number[];
    permissions?:string[];
    password?: string;
    role_id:number;
}

export interface StaffApiResponse {
  users: Staff[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ModulesInterface {
    id:number;
    name:string;
}

export interface Role {
    id: number;
    type: string; // e.g., "Super Admin", "Technician"
    company_id:number;
}