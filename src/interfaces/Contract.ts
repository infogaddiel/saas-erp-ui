export type ContractType = 'AMC' | 'Service' | 'Subscription';
export type ContractStatus = 'Draft' | 'Active' | 'Expired' | 'Terminated';

export interface Contract {
    id?: number;
    name: string;
    description?: string | null;
    customer_id?: number | null;
    project_id?: number | null;
    contract_number?: string;
    contract_type: ContractType;
    status: ContractStatus;
    start_date: string;
    end_date: string;
    total_value?: number;
    currency?: string;
    // UI Helpers (optional)
    customer_name?: string;
    project_name?: string;
    customer?: {
        id: number;
        name: string;
        mobile: string;
    };
}