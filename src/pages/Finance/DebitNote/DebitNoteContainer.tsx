import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonInput, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent, IonTextarea, IonSelect, IonSelectOption
} from '@ionic/react';
import {
    addOutline, pencilOutline, trashOutline, closeOutline,
    saveOutline, documentTextOutline
} from 'ionicons/icons';
import { debitNoteService } from '../../../api/debitNoteService';
import { customerService } from '../../../api/customerService';
import { invoiceService } from '../../../api/invoiceService';
import Pagination from '../../../components/Pagination';
import { DebitNote } from '../../../interfaces/CreditDebitNote';

const DebitNoteContainer: React.FC = () => {
    const [debitNotes, setDebitNotes] = useState<DebitNote[]>([]);
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

    const initialFormState: DebitNote = {
        customer_name: '',
        invoice_id: 0,
        issue_date: new Date().toISOString().split('T')[0],
        amount: 0,
        reason: 'Undercharged',
        status: 'Open',
        description: '',
        notes: ''
    };

    const [formData, setFormData] = useState<DebitNote>(initialFormState);

    const loadData = async () => {
        try {
            const response = await debitNoteService.getDebitNotes(currentPage, 10);
            if (response?.success || response?.data) {
                setDebitNotes(response.data.debitNotes || response.data);
                if (response.data.pagination) {
                    setPaginationData({
                        total: response.data.pagination.total,
                        totalPages: response.data.pagination.totalPages,
                        limit: response.data.pagination.limit
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching debit notes:', err);
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

    const handleEdit = (dn: DebitNote) => {
        setIsEditMode(true);
        setFormData({
            ...dn,
            issue_date: dn.issue_date ? dn.issue_date.split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setInvoiceSearchQuery(dn.invoice?.invoice_number || dn.invoice_id.toString());
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        presentAlert({
            header: 'Delete Note',
            message: 'Are you sure you want to delete this debit note?',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        await presentLoading('Deleting...');
                        try {
                            await debitNoteService.deleteDebitNote(id);
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

        await presentLoading('Saving Debit Note...');
        try {
            if (isEditMode && formData.id) {
                await debitNoteService.updateDebitNote(formData.id, formData);
            } else {
                await debitNoteService.addDebitNote(formData);
            }
            setShowModal(false);
            loadData();
        } catch (err: any) {
            console.error(err);
            presentAlert({
                header: 'Save Failed',
                message: err.response?.data?.message || 'Failed to save debit note.',
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
                    <IonSearchbar placeholder="Search Debit Notes..." className="erp-searchbar" />
                </div>
                <div className="page-action-bar">
                    <IonButton size="small" className="btn-primary" onClick={() => { setIsEditMode(false); setFormData(initialFormState); setInvoiceSearchQuery(''); setShowModal(true); }}>
                        <IonIcon icon={addOutline} slot="start" /> New Debit Note
                    </IonButton>
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-container table-responsive-wrapper">
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
                            {debitNotes?.map((dn) => (
                                <tr key={dn.id}>
                                    <td className="bold-text">{dn.crn_number}</td>
                                    <td className="bold-text">{dn.customer_name}</td>
                                    <td>{dn.invoice?.invoice_number ? dn.invoice.invoice_number : `#${dn.invoice_id}`}</td>
                                    <td>{dn.issue_date}</td>
                                    <td>₹{Number(dn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td>{dn.reason}</td>
                                    <td>
                                        <span className={`status-badge ${dn.status?.toLowerCase()}`}>
                                            {dn.status}
                                        </span>
                                    </td>
                                    <td className="ion-text-center">
                                        <IonButton fill="clear" onClick={() => handleEdit(dn)}>
                                            <IonIcon icon={pencilOutline} color="primary" />
                                        </IonButton>
                                        <IonButton fill="clear" onClick={() => handleDelete(dn.id!)}>
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

            {/* Modal - Debit Note CRUD */}
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="large-erp-modal">
                <div className="modal-header-custom">
                    <div className="header-title-box">
                        <IonIcon icon={documentTextOutline} className="header-icon" />
                        <h2>{isEditMode ? 'Update Debit Note' : 'Issue Debit Note'}</h2>
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

                            <IonCol size="12" sizeMd="3">
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
                                                            customer_name: inv.customer_name || formData.customer_name
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

                            <IonCol size="12" sizeMd="3">
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
                                <label className="field-label">Charge Amount</label>
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
                                    <IonSelectOption value="Undercharged">Pricing Error / Undercharged</IonSelectOption>
                                    <IonSelectOption value="Additional Items">Extra Goods Supplied</IonSelectOption>
                                    <IonSelectOption value="Interest Charge">Late Payment Interest</IonSelectOption>
                                    <IonSelectOption value="Other">Other Adjustment</IonSelectOption>
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
                                    <IonSelectOption value="Paid">Paid</IonSelectOption>
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
                        <IonIcon icon={saveOutline} slot="start" /> {isEditMode ? 'Update' : 'Create'}
                    </IonButton>
                </div>
            </IonModal>
        </div>
    );
};

export default DebitNoteContainer;