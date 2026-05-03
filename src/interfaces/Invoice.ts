export interface LineItem {
  description: string;
  quantity: number;
  price: number;
  final_price: number;
  tax:number
}

export interface Invoice {
  customer_name: string;
  payment_status: string;
  invoice_date: string; // Format: YYYY-MM-DD
  due_date: string;
  sub_total: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  line_items: LineItem[];
  notes: string;
  created_by: number;
}