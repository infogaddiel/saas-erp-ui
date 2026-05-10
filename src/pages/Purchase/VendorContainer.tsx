import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent
} from '@ionic/react';
import { 
    addOutline, pencilOutline, trashOutline, closeOutline, 
    downloadOutline, documentTextOutline, businessOutline 
} from 'ionicons/icons';
import Pagination from '../../components/Pagination';
import { vendorService } from '../../api/vendorService';
import { canDelete } from '../../utility/authUtils';
import { Vendor } from '../../interfaces/Vendor';
import { downloadTemplate } from '../../utility/downloaTemplate';
import BulkUploadContainer from '../../components/BulkUploadContainer';

const VendorContainer: React.FC = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();

    const [paginationData, setPaginationData] = useState({
        total: 0,
        totalPages: 1,
        limit: 10
    });

    const initialFormState: Vendor = {
        vendor_name: '',
        company: '',
        email: '',
        phone: '',
        category: 'Supplier',
        address: '',
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const loadVendors = async (page: number) => {
        try {
            const response: any = await vendorService.getVendors(page, 10);
            if (response && response.success) {
                setVendors(response.data.vendors);
                setPaginationData({
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages,
                    limit: response.data.pagination.limit
                });
            }
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    useEffect(() => {
        loadVendors(currentPage);
    }, [currentPage]);

    const handleSubmit = async () => {
        if (!formData.vendor_name || !formData.phone) {
            presentAlert({ header: 'Required', message: 'Please fill in Vendor Name and Phone', buttons: ['OK'] });
            return;
        }

        await presentLoading('Saving Vendor...');
        try {
            if (isEditMode && (formData as any).id) {
                await vendorService.updateVendor((formData as any).id, formData);
            } else {
                await vendorService.addVendor(formData);
            }
            setShowModal(false);
            loadVendors(currentPage);
            presentAlert({
                header: 'Success',
                message: `Vendor ${isEditMode ? 'Updated' : 'Created'} Successfully`,
                buttons: ['OK'],
            });
        } catch (err: any) {
            presentAlert({
                header: 'Error',
                message: err.response?.data?.message || 'Failed to save vendor.',
                buttons: ['OK'],
            });
        } finally {
            dismissLoading();
        }
    };

    const handleEdit = (vendor: any) => {
        setIsEditMode(true);
        setFormData({ ...vendor });
        setShowModal(true);
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
                            await vendorService.deleteVendor(id);
                            loadVendors(currentPage);
                        } catch (err: any) {
                            console.error(err);
                        }
                    },
                },
            ],
        });
    };

    const handleExport = async () => {
        await presentLoading('Preparing Excel file...');
        try {
            const data = await vendorService.exportToExcel();
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Vendors_Report_${new Date().toLocaleDateString()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            presentAlert({ header: 'Export Failed', message: 'Could not generate report.', buttons: ['OK'] });
        } finally {
            dismissLoading();
        }
    };

    const sampleData = {
        vendor_name: "Vendor Name Inc",
        company: "John Doe",
        email: "vendor@example.com",
        phone: "1234567890",
        category: "Supplier",
        address:"Vendor Address",
        notes:""
    };

    return (
        <>
            <div className="page-header-section">
                <div className="search-wrapper">
                    <IonSearchbar placeholder="Search vendors..." className="erp-searchbar" />
                </div>
                <div className="page-action-bar">
                    <IonButton size="small" onClick={() => { setIsEditMode(false); setFormData(initialFormState); setShowModal(true); }}>
                        <IonIcon icon={addOutline} slot="start" /> New Vendor
                    </IonButton>
                    <IonButton size="small" color="success" onClick={handleExport} className="export-btn">
                        <IonIcon slot="start" icon={downloadOutline} /> Export
                    </IonButton>
                    <IonButton size="small" fill="outline" color="medium" onClick={() => downloadTemplate(sampleData, 'Vendors')}>
                        <IonIcon slot="start" icon={documentTextOutline} /> Template
                    </IonButton>
                    <BulkUploadContainer
                        title="Import Vendors"
                        onUpload={vendorService.bulkCreate}
                        onSuccess={() => loadVendors(currentPage)}
                    />
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-container table-responsive-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Vendor Name</th>
                                <th>Contact Person</th>
                                <th>Email</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map((v: any) => (
                                <tr key={v.id}>
                                    <td className="bold-text">{v.vendor_name}</td>
                                    <td>{v.company}</td>
                                    <td>{v.email}</td>
                                    <td>{v.category}</td>
                                    <td>
                                        <span className={`status-badge ${v.status? 'active':'inactive'}`}>
                                            {v.status ? 'Active':'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <IonButton fill="clear" onClick={() => handleEdit(v)}>
                                                <IonIcon icon={pencilOutline} color="primary" />
                                            </IonButton>
                                            {canDelete() && (
                                                <IonButton fill="clear" onClick={() => handleDelete(v.id!, v.vendor_name)}>
                                                    <IonIcon icon={trashOutline} color="danger" />
                                                </IonButton>
                                            )}
                                        </div>
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
                    <h2 className="modal-title">{isEditMode ? 'Edit Vendor' : 'Create New Vendor'}</h2>
                    <IonIcon icon={closeOutline} className="close-icon" onClick={() => setShowModal(false)} />
                </div>

                <IonContent className="modal-main-content">
                    <div className="form-wrapper">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12">
                                    <label className="field-label">Vendor Name *</label>
                                    <IonInput 
                                        className="styled-input" 
                                        value={formData.vendor_name} 
                                        onIonInput={e => setFormData({ ...formData, vendor_name: e.detail.value! })} 
                                    />
                                </IonCol>
                                <IonCol size="12" size-md="6">
                                    <label className="field-label">Company</label>
                                    <IonInput 
                                        className="styled-input" 
                                        value={formData.company} 
                                        onIonInput={e => setFormData({ ...formData, company: e.detail.value! })} 
                                    />
                                </IonCol>
                                <IonCol size="12" size-md="6">
                                    <label className="field-label">Category</label>
                                    <IonSelect 
                                        className="styled-input" 
                                        value={formData.category} 
                                        onIonChange={e => setFormData({ ...formData, category: e.detail.value })}
                                    >
                                        <IonSelectOption value="Equipments">Equipments</IonSelectOption>
                                        <IonSelectOption value="Parts">Parts</IonSelectOption>
                                         <IonSelectOption value="Materials">Materials</IonSelectOption>
                                        <IonSelectOption value="Services">Services</IonSelectOption>
                                        <IonSelectOption value="Consultant">Consultant</IonSelectOption>
                                    </IonSelect>
                                </IonCol>
                                <IonCol size="12" size-md="6">
                                    <label className="field-label">Email *</label>
                                    <IonInput 
                                        type="email" 
                                        className="styled-input" 
                                        value={formData.email} 
                                        onIonInput={e => setFormData({ ...formData, email: e.detail.value! })} 
                                    />
                                </IonCol>
                                <IonCol size="12" size-md="6">
                                    <label className="field-label">Phone</label>
                                    <IonInput 
                                        className="styled-input" 
                                        value={formData.phone} 
                                        onIonInput={e => setFormData({ ...formData, phone: e.detail.value! })} 
                                    />
                                </IonCol>
                                <IonCol size="12">
                                    <label className="field-label">Address</label>
                                    <IonTextarea 
                                        className="styled-input" 
                                        rows={2} 
                                        value={formData.address} 
                                        onIonInput={e => setFormData({ ...formData, address: e.detail.value! })} 
                                    />
                                </IonCol>
                                 <IonCol size="12">
                                    <label className="field-label">Notes</label>
                                    <IonTextarea 
                                        className="styled-input" 
                                        rows={2} 
                                        value={formData.notes} 
                                        onIonInput={e => setFormData({ ...formData, notes: e.detail.value! })} 
                                    />
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                </IonContent>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => setShowModal(false)}>CANCEL</button>
                    <button className="btn-save-sales" onClick={handleSubmit}>
                        {isEditMode ? 'UPDATE VENDOR' : 'CREATE VENDOR'}
                    </button>
                </div>
            </IonModal>
        </>
    );
};

export default VendorContainer;