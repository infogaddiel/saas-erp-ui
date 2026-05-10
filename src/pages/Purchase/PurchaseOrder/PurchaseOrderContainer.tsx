import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonInput, IonSelect,
    IonSelectOption, IonTextarea, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent
} from '@ionic/react';
import { addOutline, pencilOutline, trashOutline, closeOutline, downloadOutline } from 'ionicons/icons';
import Pagination from '../../../components/Pagination';
import { purchaseOrderService } from '../../../api/purchaseOrderService';
import { vendorService } from '../../../api/vendorService';
import { PurchaseOrder, PURCHASE_ORDER_STATUSES } from '../../../interfaces/PurchaseOrder';
import { formatDateToDMY } from '../../../utility/commonUtils';
import { canDelete } from '../../../utility/authUtils';

const PurchaseOrderContainer: React.FC = () => {
    const [pos, setPos] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();

    // Vendor Search State
    const [vendorSuggestions, setVendorSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1, limit: 10 });

    const initialFormState: PurchaseOrder = {
        po_number: '',
        vendor_id: null,
        vendor_name: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: '',
        total_amount: 0,
        status: 'Draft',
        items_description: '',
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const loadPOs = async (page: number) => {
        try {
            const res = await purchaseOrderService.getPurchaseOrders(page, 10);
            if (res.success) {
                setPos(res.data.purchase_orders);
                setPaginationData(res.data.pagination);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { loadPOs(currentPage); }, [currentPage]);

    const handleVendorSearch = async (query: string) => {
        setFormData({ ...formData, vendor_name: query });
        if (query.length > 2) {
            const res = await vendorService.getVendorsDropDown(query); // Adjust based on your API
            setVendorSuggestions(res.data);
            setShowSuggestions(true);
        } else { setShowSuggestions(false); }
    };

    const handleSubmit = async () => {
        if (!formData.vendor_id || !formData.order_date) {
            presentAlert({ header: 'Required', message: 'Vendor and Order Date are required', buttons: ['OK'] });
            return;
        }
        await presentLoading('Processing PO...');
        try {
            const payload = {
                ...formData,
                order_date: formatDateToDMY(formData.order_date!) ?? '',
                expected_delivery: formatDateToDMY(formData.expected_delivery!) ?? ''
            }
            if (isEditMode) await purchaseOrderService.updatePurchaseOrder((payload as any).id, payload);
            else await purchaseOrderService.addPurchaseOrder(payload);

            setShowModal(false);
            loadPOs(currentPage);
        } catch (err) { console.error(err); }
        finally { dismissLoading(); }
    };

    const handleDelete = (id: number, name: string) => {
        presentAlert({
            header: 'Confirm Delete',
            message: `Are you sure you want to delete "${name}"?`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        try {
                            await purchaseOrderService.deletePurchaseOrder(id);
                            loadPOs(currentPage);
                        } catch (err: any) {
                            console.error(err);
                        }
                    },
                },
            ],
        });
    };
    return (
        <>
            <div className="page-header-section">
                <div className="search-wrapper">
                    <IonSearchbar placeholder="Search POs..." className="erp-searchbar" />
                </div>
                <div className="page-action-bar">
                    <IonButton size="small" onClick={() => { setIsEditMode(false); setFormData(initialFormState); setShowModal(true); }}>
                        <IonIcon icon={addOutline} slot="start" /> New PO
                    </IonButton>
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-container table-responsive-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>PO Number</th>
                            <th>Vendor</th>
                            <th>Order Date</th>
                            <th>Expected Delivery</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.map((p: any) => (
                            <tr key={p.id}>
                                <td className="bold-text">{p.po_number}</td>
                                <td>{p.vendor?.vendor_name}</td>
                                <td>{p.order_date}</td>
                                <td className={p.status !== 'Received' ? 'text-warning' : ''}>
                                    {p.expected_delivery || 'N/A'}
                                </td>
                                <td>{p.total_amount?.toLocaleString()}</td>
                                <td><span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span></td>
                                <td>
                                    <IonButton fill="clear" onClick={() => { setIsEditMode(true); setFormData({ ...p, vendor_name: p.vendor?.vendor_name }); setShowModal(true); }}>
                                        <IonIcon icon={pencilOutline} color="primary" />
                                    </IonButton>
                                    {canDelete() && (
                                        <IonButton fill="clear" onClick={() => handleDelete(p.id!, p.po_number)}>
                                            <IonIcon icon={trashOutline} color="danger" />
                                        </IonButton>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={paginationData.totalPages}
                    totalItems={paginationData.total}
                    itemsPerPage={paginationData.limit}
                    onPageChange={(newPage) => setCurrentPage(newPage)}
                />
            </div>

            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="contract-modal">
                <div className="modal-header-custom">
                    <h2 className="modal-title">{isEditMode ? 'Edit PO' : 'New Purchase Order'}</h2>
                    <IonIcon icon={closeOutline} className="close-icon" onClick={() => setShowModal(false)} />
                </div>
                <IonContent className="modal-main-content">
                    <IonGrid>
                        <IonRow>
                            <IonCol size="12" size-md="6">
                                <label className="field-label">Vendor *</label>
                                <div className="relative-pos">
                                    <IonInput className="styled-input" placeholder="Search Vendor..." value={formData.vendor_name} onIonInput={e => handleVendorSearch(e.detail.value!)} />
                                    {showSuggestions && (
                                        <div className="suggestion-list">
                                            {vendorSuggestions.map(v => (
                                                <div key={v.id} className="suggestion-item" onClick={() => { setFormData({ ...formData, vendor_id: v.id, vendor_name: v.vendor_name }); setShowSuggestions(false); }}>
                                                    {v.vendor_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </IonCol>
                            <IonCol size="12" size-md="6">
                                <label className="field-label">Order Date</label>
                                <IonInput type="date" className="styled-input" value={formData.order_date} onIonInput={e => setFormData({ ...formData, order_date: e.detail.value! })} />
                            </IonCol>
                            {/* Added Expected Delivery Field */}
                            <IonCol size="12" size-md="6">
                                <label className="field-label">Expected Delivery</label>
                                <IonInput
                                    type="date"
                                    className="styled-input"
                                    value={formData.expected_delivery}
                                    onIonInput={e => setFormData({ ...formData, expected_delivery: e.detail.value! })}
                                />
                            </IonCol>
                            <IonCol size="12" size-md="6">
                                <label className="field-label">Total Amount</label>
                                <div className="currency-input-group">
                                    <span className="currency-symbol">₹</span>
                                    <IonInput
                                        type="number"
                                        placeholder="0"
                                        className="currency-inner-input"
                                        value={formData.total_amount}
                                        onIonInput={e => setFormData({ ...formData, total_amount: parseFloat(e.detail.value!) || 0 })}
                                    />
                                </div>
                            </IonCol>
                            <IonCol size="12" size-md="6">
                                <label className="field-label">Status</label>
                                <IonSelect className="styled-input" value={formData.status} onIonChange={e => setFormData({ ...formData, status: e.detail.value })}>
                                    {PURCHASE_ORDER_STATUSES.map(s => <IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
                                </IonSelect>
                            </IonCol>
                            <IonCol size="12">
                                <label className="field-label">Items Description</label>
                                <IonTextarea className="styled-input" rows={3} value={formData.items_description} onIonInput={e => setFormData({ ...formData, items_description: e.detail.value! })} />
                            </IonCol>
                            <IonCol size="12">
                                <label className="field-label">Notes</label>
                                <IonTextarea className="styled-input" rows={3} value={formData.notes} onIonInput={e => setFormData({ ...formData, notes: e.detail.value! })} />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonContent>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => setShowModal(false)}>CANCEL</button>
                    <button className="btn-save-sales" onClick={handleSubmit}>{isEditMode ? 'UPDATE PO' : 'CREATE PO'}</button>
                </div>
            </IonModal>
        </>
    );
};

export default PurchaseOrderContainer;