export interface Role {
  id?: number;
  type: string;
  level: number;
  is_active?: boolean;
  company_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoleApiResponse {
  success: boolean;
  data: Role | Role[];
  message?: string;
}
