export interface Lead {
    id?: number;
    lead_number?: string;
    title_of_lead: string;
    contact_person: string;
    company_name: string;
    contact_no: string;
    address: string;
    lead_source: string;
    lead_status_id: number;
    product_required: string;
    created_at?: string;
}