export interface InvoiceSummary {
    id: number;
    invoice_number: string;
    total_amount?: string | number;
    payment_status?: string;
}

export interface CreditNote {
    id?: number;
    crn_number?: string;
    customer_name: string;
    invoice_id: number;
    issue_date: string;
    amount: number;
    reason: string;
    status: string;
    description?: string;
    notes?: string;
    invoice?: InvoiceSummary;
}

export interface DebitNote {
    id?: number;
    crn_number?: string;
    customer_name: string;
    invoice_id: number;
    issue_date: string;
    amount: number;
    reason: string;
    status: string;
    description?: string;
    notes?: string;
    invoice?: InvoiceSummary;
}