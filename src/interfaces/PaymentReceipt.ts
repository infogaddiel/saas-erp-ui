export interface PaymentReceipt {
  id?: number;
  customer_name: string;
  receipt_number?: string;
  receipt_date: string; // ISO format: YYYY-MM-DD
  amount: number;
  payment_method: 'cash' | 'cheque' | 'bank_transfer' | 'upi';
  invoice_id: number;
  transaction_reference: string;
  notes: string;
  invoice?:{id:number,customer_name: string,invoice_date:string,total_amount:number,invoice_number?:string}
}