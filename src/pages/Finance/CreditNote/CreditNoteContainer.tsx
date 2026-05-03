import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonInput, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent, IonTextarea, IonSelect, IonSelectOption
} from '@ionic/react';
import {
    addOutline, pencilOutline, trashOutline, closeOutline,
    receiptOutline, saveOutline, documentTextOutline
} from 'ionicons/icons';
import { creditNoteService } from '../../../api/creditNoteService';
import { customerService } from '../../../api/customerService';
import { invoiceService } from '../../../api/invoiceService';
import Pagination from '../../../components/Pagination';
import { CreditNote } from '../../../interfaces/CreditDebitNote';

const CreditNoteContainer: React.FC = () => {
    const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1, limit: 10 });

    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();

    // Customer Auto-suggest
    const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Invoice Auto-suggest
    const [invoiceSuggestions, setInvoiceSuggestions] = useState<any[]>([]);
    const [showInvoiceSuggestions, setShowInvoiceSuggestions] = useState(false);
    const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');

    const initialFormState: CreditNote = {
        customer_name: '',
        invoice_id: 0,
        issue_date: new Date().toISOString().split('T')[0],
        amount: 0,
        reason: 'Goods Returned',
        status: 'Open',
        description: '',
        notes: ''
    };

    const [formData, setFormData] = useState<CreditNote>(initialFormState);

    const loadData = async () => {
        try {
            const response = await creditNoteService.getCreditNotes(currentPage, 10);
            if (response?.success || response?.data) {
                setCreditNotes(response.data.creditNotes || response.data);
                if (response.data.pagination) {
                    setPaginationData({
                        total: response.data.pagination.total,
                        totalPages: response.data.pagination.totalPages,
                        limit: response.data.pagination.limit
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching credit notes:', err);
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
                // Handle response if wrapped in 'data' array
                const items = res.data || res || [];
                setInvoiceSuggestions(items);
                setShowInvoiceSuggestions(true);
            } catch (err) {
                console.error("Invoice fetch error:", err);
                setInvoiceSuggestions([]);
            }
        } else {
            setInvoiceSuggestions([]);
            setShowInvoiceSuggestions(false);
            setFormData(prev => ({ ...prev, invoice_id: 0 }));
        }
    };

    const handleEdit = (cn: CreditNote) => {
        setIsEditMode(true);
        setFormData({
            ...cn,
            issue_date: cn.issue_date ? cn.issue_date.split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setInvoiceSearchQuery(cn.invoice_id ? cn.invoice_id.toString() : '');
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        presentAlert({
            header: 'Delete Note',
            message: 'Are you sure you want to delete this credit note?',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        await presentLoading('Deleting...');
                        try {
                            await creditNoteService.deleteCreditNote(id);
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
        if (!formData.customer_name || !formData.amount) {
            presentAlert({ header: 'Error', message: 'Customer Name and Amount are required.', buttons: ['OK'] });
            return;
        }

        await presentLoading('Saving Credit Note...');
        try {
            if (isEditMode && formData.id) {
                await creditNoteService.updateCreditNote(formData.id, formData);
            } else {
                await creditNoteService.addCreditNote(formData);
            }
            setShowModal(false);
            loadData();
        } catch (err: any) {
            console.error(err);
            presentAlert({
                header: 'Save Failed',
                message: err.response?.data?.message || 'Failed to save credit note.',
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
                    <IonSearchbar placeholder="Search Credit Notes..." className="erp-searchbar" />
                </div>
                <div className="page-action-bar">
                    <IonButton size="small" className="btn-primary" onClick={() => { setIsEditMode(false); setFormData(initialFormState); setInvoiceSearchQuery(''); setShowModal(true); }}>
                        <IonIcon icon={addOutline} slot="start" /> New Credit Note
                    </IonButton>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Customer</th>
                            <th>Invoice Ref</th>
                            <th>Issue Date</th>
                            <th>Amount</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th className="ion-text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {creditNotes?.map((cn) => (
                            <tr key={cn.id}>
                                <td className="bold-text">{cn.crn_number}</td>
                                <td className="bold-text">{cn.customer_name}</td>
                                <td>{cn.invoice?.invoice_number}</td>
                                <td>{cn.issue_date}</td>
                                <td>₹{Number(cn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td>{cn.reason}</td>
                                <td>
                                    <span className={`status-badge ${cn.status?.toLowerCase()}`}>
                                        {cn.status}
                                    </span>
                                </td>
                                <td className="ion-text-center">
                                    <IonButton fill="clear" onClick={() => handleEdit(cn)}>
                                        <IonIcon icon={pencilOutline} color="primary" />
                                    </IonButton>
                                    <IonButton fill="clear" onClick={() => handleDelete(cn.id!)}>
                                        <IonIcon icon={trashOutline} color="danger" />
                                    </IonButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

            {/* Modal - Credit Note CRUD */}
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="large-erp-modal">
                <div className="modal-header-custom">
                    <div className="header-title-box">
                        <IonIcon icon={documentTextOutline} className="header-icon" />
                        <h2>{isEditMode ? 'Update Credit Note' : 'Issue Credit Note'}</h2>
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
                                        placeholder="Enter customer name..."
                                        value={formData.customer_name}
                                        onIonInput={e => handleCustomerSearch(e.detail.value!)}
                                    />
                                    {showSuggestions && (
                                        <div className="suggestion-dropdown">
                                            {customerSuggestions.map((c: any) => (
                                                <div
                                                    key={c.id}
                                                    className="suggestion-row"
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            customer_name: c.name,
                                                            notes: formData.notes || `Contact Info: ${c.mobile || 'N/A'}`
                                                        });
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <div className="suggestion-main-text">{c.name}</div>
                                                    <div className="suggestion-sub-text">{c.customerType?.name} | {c.mobile}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </IonCol>

                            <IonCol size="6" sizeMd="3">
                                <label className="field-label">Invoice Ref</label>
                                <div className="autosuggest-wrapper">
                                    <IonInput
                                        type="text"
                                        className="styled-input"
                                        placeholder="Search Invoice No..."
                                        value={invoiceSearchQuery}
                                        onIonInput={e => handleInvoiceSearch(e.detail.value!)}
                                    />
                                    {showInvoiceSuggestions && (
                                        <div className="suggestion-dropdown">
                                            {invoiceSuggestions.map((inv: any) => (
                                                <div
                                                    key={inv.id}
                                                    className="suggestion-row"
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            invoice_id: inv.id,
                                                            customer_name: inv.customer_name || formData.customer_name,
                                                            amount: parseFloat(inv.total_amount) || 0
                                                        });
                                                        setInvoiceSearchQuery(inv.invoice_number);
                                                        setShowInvoiceSuggestions(false);
                                                    }}
                                                >
                                                    <div className="suggestion-main-text">{inv.invoice_number}</div>
                                                    <div className="suggestion-sub-text">
                                                        {inv.customer_name} | ₹{Number(inv.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({inv.payment_status})
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </IonCol>

                            <IonCol size="6" sizeMd="3">
                                <label className="field-label">Issue Date</label>
                                <IonInput
                                    type="date"
                                    className="styled-input"
                                    value={formData.issue_date}
                                    onIonInput={e => setFormData({ ...formData, issue_date: e.detail.value! })}
                                />
                            </IonCol>
                        </IonRow>

                        <IonRow>
                            <IonCol size="12" sizeMd="4">
                                <label className="field-label">Refund Amount</label>
                                <IonInput
                                    type="number"
                                    placeholder="₹0.00"
                                    className="styled-input"
                                    value={formData.amount || ''}
                                    onIonInput={e => setFormData({ ...formData, amount: parseFloat(e.detail.value!) || 0 })}
                                />
                            </IonCol>

                            <IonCol size="12" sizeMd="4">
                                <label className="field-label">Reason</label>
                                <IonSelect
                                    className="styled-input"
                                    interface="popover"
                                    value={formData.reason}
                                    onIonChange={e => setFormData({ ...formData, reason: e.detail.value! })}
                                >
                                    <IonSelectOption value="Goods Returned">Goods Returned</IonSelectOption>
                                    <IonSelectOption value="Overcharged">Pricing Error / Overcharged</IonSelectOption>
                                    <IonSelectOption value="Damaged Goods">Damaged Items</IonSelectOption>
                                    <IonSelectOption value="Service Cancellation">Service Cancellation</IonSelectOption>
                                </IonSelect>
                            </IonCol>

                            <IonCol size="12" sizeMd="4">
                                <label className="field-label">Status</label>
                                <IonSelect
                                    className="styled-input"
                                    interface="popover"
                                    value={formData.status}
                                    onIonChange={e => setFormData({ ...formData, status: e.detail.value! })}
                                >
                                    <IonSelectOption value="Open">Open</IonSelectOption>
                                    <IonSelectOption value="Applied">Applied</IonSelectOption>
                                    <IonSelectOption value="Refunded">Refunded</IonSelectOption>
                                </IonSelect>
                            </IonCol>
                        </IonRow>

                        <IonRow>
                            <IonCol size="12">
                                <label className="field-label">Internal Description / Notes</label>
                                <IonTextarea
                                    className="styled-input"
                                    rows={3}
                                    placeholder="Contextual records for the financial audit..."
                                    value={formData.description || ''}
                                    onIonInput={e => setFormData({ ...formData, description: e.detail.value! })}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonContent>

                <div className="modal-footer-erp">
                    <IonButton fill="clear" color="medium" onClick={() => setShowModal(false)}>Cancel</IonButton>
                    <IonButton className="btn-save" onClick={handleSubmit}>
                        <IonIcon icon={saveOutline} slot="start" /> {isEditMode ? 'Update Credit Note' : 'Create Credit Note'}
                    </IonButton>
                </div>
            </IonModal>
        </div>
    );
};

export default CreditNoteContainer;