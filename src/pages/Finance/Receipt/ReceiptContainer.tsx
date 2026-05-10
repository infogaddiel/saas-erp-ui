import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonInput, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent, IonTextarea, IonSelect, IonSelectOption
} from '@ionic/react';
import {
    addOutline, pencilOutline, trashOutline, closeOutline,
    saveOutline, walletOutline
} from 'ionicons/icons';
import { receiptService } from '../../../api/receiptService';
import { customerService } from '../../../api/customerService';
import { invoiceService } from '../../../api/invoiceService';
import Pagination from '../../../components/Pagination';
import { PaymentReceipt } from '../../../interfaces/PaymentReceipt';

// Using a dedicated interface for Receipts

const ReceiptContainer: React.FC = () => {
    const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1, limit: 10 });

    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();

    // Auto-suggest states
    const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [invoiceSuggestions, setInvoiceSuggestions] = useState<any[]>([]);
    const [showInvoiceSuggestions, setShowInvoiceSuggestions] = useState(false);
    const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');

    const initialFormState: PaymentReceipt = {
        customer_name: '',
        invoice_id: 0,
        receipt_date: new Date().toISOString().split('T')[0],
        amount: 0,
        payment_method: 'cash',
        transaction_reference: '',
        notes: ''
    };

    const [formData, setFormData] = useState<PaymentReceipt>(initialFormState);

    const loadData = async () => {
        try {
            const response = await receiptService.getReceipts(currentPage, 10);
            if (response?.success || response?.data) {
                // Adjust mapping based on your service's return structure
                setReceipts(response.data.receipts || response.data);
                if (response.data.pagination) {
                    setPaginationData({
                        total: response.data.pagination.total,
                        totalPages: response.data.pagination.totalPages,
                        limit: response.data.pagination.limit
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching receipts:', err);
        }
    };

    useEffect(() => { loadData(); }, [currentPage]);

    const handleCustomerSearch = async (query: string) => {
        setFormData({ ...formData, customer_name: query });
        if (query.length > 2) {
            try {
                const res = await customerService.getCustomersDropDown(query);
                setCustomerSuggestions(res.data || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Customer fetch error:", err);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    const handleInvoiceSearch = async (query: string) => {
        setInvoiceSearchQuery(query);
        if (query.trim().length > 0) {
            try {
                const res = await invoiceService.getInvoiceDropdown(query.trim());
                setInvoiceSuggestions(res.data || res || []);
                setShowInvoiceSuggestions(true);
            } catch (err) {
                console.error("Invoice fetch error:", err);
            }
        } else {
            setInvoiceSuggestions([]);
            setShowInvoiceSuggestions(false);
        }
    };

    const handleEdit = (receipt: PaymentReceipt) => {
        setIsEditMode(true);
        setFormData({
            ...receipt,
            receipt_date: receipt.receipt_date ? receipt.receipt_date.split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setInvoiceSearchQuery(receipt.invoice?.invoice_number || receipt.invoice_id.toString());
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        presentAlert({
            header: 'Delete Receipt',
            message: 'Are you sure you want to delete this payment record?',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        await presentLoading('Deleting...');
                        try {
                            await receiptService.deleteReceipt(id);
                            loadData();
                        } finally {
                            dismissLoading();
                        }
                    }
                }
            ]
        });
    };

    const handleSubmit = async () => {
        if (!formData.customer_name || !formData.amount || !formData.invoice_id) {
            presentAlert({ header: 'Error', message: 'Invoice, Customer, and Amount are required.', buttons: ['OK'] });
            return;
        }

        await presentLoading('Saving Receipt...');
        try {
            if (isEditMode && formData.id) {
                await receiptService.updateReceipt(formData.id, formData as any);
            } else {
                await receiptService.addReceipt(formData as any);
            }
            setShowModal(false);
            loadData();
        } catch (err: any) {
            presentAlert({
                header: 'Save Failed',
                message: err.response?.data?.message || 'Failed to save receipt.',
                buttons: ['OK']
            });
        } finally {
            dismissLoading();
        }
    };

    return (
        <div className="invoice-container">
            <div className="page-header-section">
                <div className="search-wrapper">
                    <IonSearchbar placeholder="Search Receipts..." className="erp-searchbar" />
                </div>
                <div className="page-action-bar">
                    <IonButton size="small" className="btn-primary" onClick={() => { setIsEditMode(false); setFormData(initialFormState); setInvoiceSearchQuery(''); setShowModal(true); }}>
                        <IonIcon icon={addOutline} slot="start" /> New Receipt
                    </IonButton>
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-container table-responsive-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Invoice Ref</th>
                                <th>Method</th>
                                <th>Amount</th>
                                <th>Reference</th>
                                <th className="ion-text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipts?.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.receipt_number}</td>
                                    <td>{r.receipt_date}</td>
                                    <td className="bold-text">{r.customer_name}</td>
                                    <td>{r.invoice?.invoice_number || `#${r.invoice_id}`}</td>
                                    <td>
                                        <span className={`status-badge ${r.payment_method}`}>
                                            {r.payment_method.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="bold-text">₹{Number(r.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td>{r.transaction_reference || 'N/A'}</td>
                                    <td className="ion-text-center">
                                        <IonButton fill="clear" onClick={() => handleEdit(r)}>
                                            <IonIcon icon={pencilOutline} color="primary" />
                                        </IonButton>
                                        <IonButton fill="clear" onClick={() => handleDelete(r.id!)}>
                                            <IonIcon icon={trashOutline} color="danger" />
                                        </IonButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {paginationData.totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={paginationData.totalPages}
                        totalItems={paginationData.total}
                        itemsPerPage={paginationData.limit}
                        onPageChange={(newPage) => setCurrentPage(newPage)}
                    />
                )}
            </div>

            {/* Modal - Receipt CRUD */}
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="large-erp-modal">
                <div className="modal-header-custom">
                    <div className="header-title-box">
                        <IonIcon icon={walletOutline} className="header-icon" />
                        <h2>{isEditMode ? 'Update Receipt' : 'Create New Receipt'}</h2>
                    </div>
                    <IonIcon icon={closeOutline} className="close-icon" onClick={() => setShowModal(false)} />
                </div>

                <IonContent className="modal-main-content">
                    <IonGrid>
                        <IonRow>
                            <IonCol size="12" sizeMd="6">
                                <label className="field-label">Customer Name</label>
                                <div className="autosuggest-wrapper">
                                    <IonInput
                                        className="styled-input"
                                        placeholder="Search customer..."
                                        value={formData.customer_name}
                                        onIonInput={e => handleCustomerSearch(e.detail.value!)}
                                    />
                                    {showSuggestions && (
                                        <div className="suggestion-dropdown">
                                            {customerSuggestions.map((c: any) => (
                                                <div key={c.id} className="suggestion-row" onClick={() => {
                                                    setFormData({ ...formData, customer_name: c.name });
                                                    setShowSuggestions(false);
                                                }}>
                                                    <div className="suggestion-main-text">{c.name}</div>
                                                    <div className="suggestion-sub-text">{c.mobile}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </IonCol>

                            <IonCol size="12" sizeMd="3">
                                <label className="field-label">Linked Invoice</label>
                                <div className="autosuggest-wrapper">
                                    <IonInput
                                        className="styled-input"
                                        placeholder="Invoice No..."
                                        value={invoiceSearchQuery}
                                        onIonInput={e => handleInvoiceSearch(e.detail.value!)}
                                    />
                                    {showInvoiceSuggestions && (
                                        <div className="suggestion-dropdown">
                                            {invoiceSuggestions.map((inv: any) => (
                                                <div key={inv.id} className="suggestion-row" onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        invoice_id: inv.id,
                                                        customer_name: inv.customer_name || formData.customer_name,
                                                        amount: parseFloat(inv.total_amount) || 0
                                                    });
                                                    setInvoiceSearchQuery(inv.invoice_number);
                                                    setShowInvoiceSuggestions(false);
                                                }}>
                                                    <div className="suggestion-main-text">{inv.invoice_number}</div>
                                                    <div className="suggestion-sub-text">Due: ₹{inv.total_amount}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </IonCol>

                            <IonCol size="12" sizeMd="3">
                                <label className="field-label">Receipt Date</label>
                                <IonInput
                                    type="date"
                                    className="styled-input"
                                    value={formData.receipt_date}
                                    onIonInput={e => setFormData({ ...formData, receipt_date: e.detail.value! })}
                                />
                            </IonCol>
                        </IonRow>

                        <IonRow>
                            <IonCol size="12" sizeMd="4">
                                <label className="field-label">Amount Received</label>
                                <IonInput
                                    type="number"
                                    placeholder="₹0.00"
                                    className="styled-input"
                                    value={formData.amount || ''}
                                    onIonInput={e => setFormData({ ...formData, amount: parseFloat(e.detail.value!) || 0 })}
                                />
                            </IonCol>

                            <IonCol size="12" sizeMd="4">
                                <label className="field-label">Payment Method</label>
                                <IonSelect
                                    className="styled-input"
                                    interface="popover"
                                    value={formData.payment_method}
                                    onIonChange={e => setFormData({ ...formData, payment_method: e.detail.value! })}
                                >
                                    <IonSelectOption value="cash">Cash</IonSelectOption>
                                    <IonSelectOption value="bank_transfer">Bank Transfer</IonSelectOption>
                                    <IonSelectOption value="cheque">Cheque</IonSelectOption>
                                    <IonSelectOption value="upi">UPI / Digital</IonSelectOption>
                                </IonSelect>
                            </IonCol>

                            <IonCol size="12" sizeMd="4">
                                <label className="field-label">Ref (UTR / Chq No)</label>
                                <IonInput
                                    placeholder="Transaction Reference"
                                    className="styled-input"
                                    value={formData.transaction_reference}
                                    onIonInput={e => setFormData({ ...formData, transaction_reference: e.detail.value! })}
                                />
                            </IonCol>
                        </IonRow>

                        <IonRow>
                            <IonCol size="12">
                                <label className="field-label">Notes</label>
                                <IonTextarea
                                    className="styled-input"
                                    rows={2}
                                    placeholder="Add any specific payment details..."
                                    value={formData.notes || ''}
                                    onIonInput={e => setFormData({ ...formData, notes: e.detail.value! })}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonContent>

                <div className="modal-footer-erp">
                    <IonButton fill="clear" color="medium" onClick={() => setShowModal(false)}>Cancel</IonButton>
                    <IonButton className="btn-save" onClick={handleSubmit}>
                        <IonIcon icon={saveOutline} slot="start" /> {isEditMode ? 'Update' : 'Generate'}
                    </IonButton>
                </div>
            </IonModal>
        </div>
    );
};

export default ReceiptContainer;