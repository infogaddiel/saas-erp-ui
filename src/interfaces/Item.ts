export interface Item {
    id?: number;
    item_code: string;
    item_name: string;
    description: string;
    type: 'Product' | 'Service' | 'Part';
    category: 'Equipments' | 'Parts' | 'Labor' | 'Materials';
    unit_price: number;
    gst_percentage: number;
    unit: string; // e.g., Pcs, Kg, Hr
    stock_quantity: number;
    notes: string;
    status: boolean;
    created_by?: number;
}