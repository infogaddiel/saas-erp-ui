export const PURCHASE_ORDER_STATUSES = ['Draft', 'Pending', 'Approved', 'Received', 'Cancelled'] as const;
export type PurchaseOrderStatus = typeof PURCHASE_ORDER_STATUSES[number];

export interface PurchaseOrder {
    id?: number;
    po_number: string;
    vendor_id: number | null;
    vendor_name?: string; // UI Helper
    order_date?: string | null;
    expected_delivery?: string | null;
    total_amount: number;
    status: PurchaseOrderStatus;
    items_description?: string;
    notes?: string;
    created_by?: number;
}