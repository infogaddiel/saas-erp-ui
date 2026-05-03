import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonInput, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent, IonTextarea, IonSelect, IonSelectOption
} from '@ionic/react';
import {
    addOutline, pencilOutline, trashOutline, closeOutline,
    addCircleOutline, receiptOutline, saveOutline
} from 'ionicons/icons';
import { invoiceService } from '../../../api/invoiceService';
import { customerService } from '../../../api/customerService';
import Pagination from '../../../components/Pagination';
import './Invoice.css';
import { itemService } from '../../../api/itemService';

const InvoiceContainer: React.FC = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1, limit: 10 });

    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();

    // Customer Auto-suggest
    const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    // 2. Item Auto-suggest State
    const [itemSuggestions, setItemSuggestions] = useState<any[]>([]);
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

    const initialFormState = {
        customer_name: '',
        payment_status: 'Unpaid',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        sub_total: 0,
        tax_amount: 0,
        total_amount: 0,
        amount_paid: 0,
        line_items: [{ item_id: null, description: '', quantity: 1, price: 0, tax: 0, final_price: 0 }],
        notes: '',
        created_by: 1
    };

    const [formData, setFormData] = useState(initialFormState);

    const loadData = async () => {
        try {
            const response = await invoiceService.getInvoices(currentPage, 10);
            if (response?.success) {
                setInvoices(response.data);
                setPaginationData({
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages,
                    limit: response.pagination.limit
                });
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { loadData(); }, [currentPage]);

    const handleCustomerSearch = async (query: string) => {
        setFormData({ ...formData, customer_name: query });
        if (query.length > 2) {
            try {
                const res = await customerService.getCustomersDropDown(query);
                // res.data is the array you provided
                setCustomerSuggestions(res.data || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Customer fetch error:", err);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    const handleItemSearch = async (index: number, query: string) => {
        const updatedItems = [...formData.line_items];
        updatedItems[index].description = query;
        setFormData({ ...formData, line_items: updatedItems });

        if (query.length > 1) {
            try {
                const res = await itemService.getItemsDropdown(query); // 3. Fetch items from API
                setItemSuggestions(res.data || []);
                setActiveItemIndex(index);
            } catch (err) {
                console.error("Item fetch error:", err);
            }
        } else {
            setActiveItemIndex(null);
        }
    };

    const selectItem = (index: number, item: any) => {
        const updatedItems = [...formData.line_items];
        updatedItems[index] = {
            ...updatedItems[index],
            item_id: item.id,
            description: item.item_name, // Mapping from your JSON "item_name"
            tax: item.gst_percentage || 0,
            price: item.unit_price || 0,
            final_price: (updatedItems[index].quantity || 1) * (item.unit_price || 0) * ((item.gst_percentage * 0.01 || 0) + 1)
        };
        calculateTotals(updatedItems, formData.tax_amount);
        setActiveItemIndex(null);
    };
    const calculateTotals = (items: any[], tax: number) => {
        const subTotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const taxTotal = items.reduce((acc, item) => acc + (item.quantity * item.price * item.tax * 0.01), 0);
        setFormData(prev => ({
            ...prev,
            line_items: items,
            sub_total: subTotal,
            tax_amount: taxTotal,
            total_amount: subTotal + taxTotal
        }));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const updatedItems = [...formData.line_items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        updatedItems[index].final_price = updatedItems[index].quantity * updatedItems[index].price * (updatedItems[index].tax * 0.01 + 1);
        calculateTotals(updatedItems, formData.tax_amount);
    };

    const handleSubmit = async () => {
        if (!formData.customer_name) {
            presentAlert({ header: 'Error', message: 'Customer Name is required', buttons: ['OK'] });
            return;
        }
        await presentLoading('Saving Invoice...');
        try {

            if (isEditMode) await invoiceService.updateInvoice((formData as any).id, formData);
            else await invoiceService.addInvoice(formData);
            setShowModal(false);
            loadData();
        } finally { dismissLoading(); }
    };

    const handleEdit = (inv: any) => {
        setIsEditMode(true);

        // Normalize the data: The API gives 'lineItems', we need 'line_items'
        // We also ensure every item has an 'item_id' to prevent validation errors
        const normalizedData = {
            ...inv,
            line_items: (inv.lineItems || inv.line_items || []).map((item: any) => ({
                item_id: item.item_id || item.id, // Fallback to id if item_id isn't present
                description: item.description || item.item?.item_name,
                quantity: item.quantity || 1,
                price: item.price || item.item?.unit_price || 0,
                tax: item.tax || item.item?.gst_percentage || 0,
                final_price: item.final_price || (item.quantity * item.item.unit_price * ((item.item?.gst_percentage * 0.01 || 0) + 1)) || 0
            }))
        };

        setFormData(normalizedData);
        setShowModal(true);
    };

    const handleDelete = (id: number, name: string) => {
        presentAlert({
            header: 'Confirm Delete',
            message: `Are you sure you want to delete Invoice of ${name}?`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        await invoiceService.deleteInvoice(id);
                        loadData();
                    }
                }
            ]
        });
    };

    return (
        <div className="invoice-container">
            <div className="page-header-section">
                <div className="search-wrapper">
                    <IonSearchbar placeholder="Search Customer..." className="erp-searchbar" />
                </div>
                <div className="page-action-bar">
                    <IonButton size="small" className="btn-primary"
                        onClick={() => { setIsEditMode(false); setFormData(initialFormState); setShowModal(true); }}>
                        <IonIcon icon={addOutline} slot="start" /> New Invoice
                    </IonButton>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Customer Name</th>
                            <th>Date</th>
                            <th>Sub Total</th>
                            <th>Tax Amount</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Created By</th>
                            <th className="ion-text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices?.map((inv) => (
                            <tr key={inv.id}>
                                 <td className="bold-text">{inv.invoice_number}</td>
                                <td className="bold-text">{inv.customer_name}</td>
                                <td>{inv.invoice_date}</td>
                                <td>₹{Number(inv.sub_total || 0)?.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}</td>
                                <td>₹{Number(inv.tax_amount || 0)?.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}</td>
                                <td>₹{Number(inv.total_amount || 0)?.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}</td>
                                <td><span className={`status-badge ${inv.payment_status?.toLowerCase()}`}>{inv.payment_status}</span></td>
                                <td>{inv.createdBy?.name}</td>
                                <td className="ion-text-center">
                                    <IonButton fill="clear"
                                        onClick={() => handleEdit(inv)}>
                                        <IonIcon icon={pencilOutline} color="primary" />
                                    </IonButton>
                                    <IonButton fill="clear" onClick={() => handleDelete(inv.id!, inv.customer_name)}>
                                        <IonIcon icon={trashOutline} color="danger" />
                                    </IonButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination
                    currentPage={currentPage}
                    totalPages={paginationData.totalPages}
                    totalItems={paginationData.total}
                    itemsPerPage={paginationData.limit}
                    onPageChange={(newPage) => setCurrentPage(newPage)}
                />
            </div>

            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="large-erp-modal">
                <div className="modal-header-custom">
                    <div className="header-title-box">
                        <IonIcon icon={receiptOutline} className="header-icon" />
                        <h2>{isEditMode ? 'Update Invoice' : 'Generate New Invoice'}</h2>
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
                                                            // Senior Architect Tip: Auto-fill address in notes if notes are empty
                                                            notes: formData.notes || `Billing Address: ${c.address}\nContact: ${c.mobile}`
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
                                <label className="field-label">Invoice Date</label>
                                <IonInput type="date" className="styled-input" value={formData.invoice_date} onIonInput={e => setFormData({ ...formData, invoice_date: e.detail.value! })} />
                            </IonCol>
                            <IonCol size="6" sizeMd="3">
                                <label className="field-label">Due Date</label>
                                <IonInput type="date" className="styled-input" value={formData.due_date} onIonInput={e => setFormData({ ...formData, due_date: e.detail.value! })} />
                            </IonCol>
                        </IonRow>

                        <div className="items-table-container">
                            <div className="items-header">
                                <span>Item Description</span>
                                <span>Qty</span>
                                <span>Unit Price</span>
                                <span>GST %</span>
                                <span>Amount</span>
                                <span></span>
                            </div>
                            {formData.line_items?.map((item, idx) => (
                                <div key={idx} className="items-row">
                                    <IonInput placeholder="Service or product..." value={item.description}
                                        onIonInput={e => handleItemSearch(idx, e.detail.value!)}
                                    />
                                    {activeItemIndex === idx && itemSuggestions.length > 0 && (
                                        <div className="suggestion-dropdown" style={{ top: '45px' }}>
                                            {itemSuggestions.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    className="suggestion-row"
                                                    onClick={() => selectItem(idx, item)}
                                                >
                                                    <div className="suggestion-main-text">{item.item_name}</div>
                                                    <div className="suggestion-sub-text">
                                                        Code: {item.item_code || 'N/A'} | Price: ₹{item.unit_price} | Stock: {item.stock_quantity}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <IonInput type="number" className="ion-text-center" value={item.quantity} onIonInput={e => handleItemChange(idx, 'quantity', parseInt(e.detail.value!) || 0)} />
                                    <IonInput type="number" value={item.price} onIonInput={e => handleItemChange(idx, 'price', parseFloat(e.detail.value!) || 0)} />
                                    <div className="calc-amount">{item.tax?.toLocaleString()}</div>
                                    <div className="calc-amount">₹{item.final_price.toLocaleString()}</div>
                                    <IonIcon
                                        icon={trashOutline}
                                        className="delete-item-icon"
                                        onClick={() => calculateTotals(formData.line_items.filter((_, i) => i !== idx), formData.tax_amount)}
                                    />
                                </div>
                            ))}
                            <IonButton fill="clear" size="small" onClick={() => setFormData({ ...formData, line_items: [...formData.line_items, { description: '', quantity: 1, price: 0, final_price: 0 }] })}>
                                <IonIcon icon={addCircleOutline} slot="start" /> Add Line Item
                            </IonButton>
                        </div>

                        <IonRow>
                            <IonCol size="12" sizeMd="7">
                                <label className="field-label">Notes</label>
                                <IonTextarea className="styled-input" rows={4} placeholder="Terms, conditions, or bank details..." value={formData.notes} onIonInput={e => setFormData({ ...formData, notes: e.detail.value! })} />
                            </IonCol>
                            <IonCol size="12" sizeMd="5">
                                <div className="summary-card">
                                    <div className="summary-item"><span>Sub Total</span> <span>₹{formData.sub_total.toLocaleString()}</span></div>
                                    <div className="summary-item">
                                        <span>Tax Amount</span>
                                        <IonInput type="number" className="tax-input" value={formData.tax_amount} onIonInput={e => calculateTotals(formData.line_items, parseFloat(e.detail.value!) || 0)} />
                                    </div>
                                    <div className="summary-item total-bold"><span>Grand Total</span> <span>₹{formData.total_amount.toLocaleString()}</span></div>
                                </div>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonContent>
                <div className="modal-footer-erp">
                    <IonButton fill="clear" color="medium" onClick={() => setShowModal(false)}>Cancel</IonButton>
                    <IonButton className="btn-save" onClick={handleSubmit}>
                        <IonIcon icon={saveOutline} slot="start" /> {isEditMode ? 'Update Invoice' : 'Create Invoice'}
                    </IonButton>
                </div>
            </IonModal>
        </div>
    );
};

export default InvoiceContainer;