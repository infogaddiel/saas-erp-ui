import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent
} from '@ionic/react';
import { addOutline, pencilOutline, trashOutline, documentTextOutline, personOutline, calendarOutline, cashOutline, closeOutline } from 'ionicons/icons';
import Pagination from '../../../components/Pagination';
import { contractService } from '../../../api/contractService';
import { customerService } from '../../../api/customerService';
import { canDelete } from '../../../utility/authUtils';
import { ContractStatus, ContractType } from '../../../interfaces/Contract';

const ContractsContainer: React.FC = () => {
    const [contracts, setContracts] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();

    // Search & Suggestions
    const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [paginationData, setPaginationData] = useState({
        total: 0,
        totalPages: 1,
        limit: 10
    });

    const initialFormState = {
        name: '',
        description: '',
        customer_id: null as number | null,
        customer_name: '', // UI Helper
        contract_type: 'Service' as ContractType,
        status: 'Draft' as ContractStatus,
        start_date: '',
        end_date: '',
        total_value: 0,
        currency: 'INR'
    };

    const [formData, setFormData] = useState(initialFormState);

    const loadContracts = async (page: number) => {
        try {
            const response: any = await contractService.getContracts(page, 10);
            if (response && response.success) {
                setContracts(response.data.contracts);
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
        loadContracts(currentPage);
    }, [currentPage]);

    const handleCustomerSearch = async (query: string) => {
        setFormData({ ...formData, customer_name: query });
        if (query.length > 2) {
            try {
                const res = await customerService.getCustomersDropDown(query);
                setCustomerSuggestions(res.data);
                setShowSuggestions(true);
            } catch (err) { console.error(err); }
        } else {
            setShowSuggestions(false);
        }
    };

    const selectCustomer = (customer: any) => {
        setFormData({
            ...formData,
            customer_id: customer.id,
            customer_name: customer.name
        });
        setShowSuggestions(false);
    };

    const handleSubmit = async () => {
        if (!formData.customer_id || !formData.name) {
            presentAlert({ header: 'Required', message: 'Please fill in Customer and Project Name', buttons: ['OK'] });
            return;
        }

        await presentLoading('Saving Contract...');
        try {
            if (isEditMode && (formData as any).id) {
                await contractService.updateContract((formData as any).id, formData);
            } else {
                const contractPayload = {
                    ...formData,
                }
                await contractService.addContract(contractPayload);
            }
            setShowModal(false);
            loadContracts(currentPage);
            presentAlert({
                header: 'Success',
                message: `Contract ${isEditMode ? 'Updated' : 'Created'} Successfully`,
                buttons: ['OK'],
            });
        } catch (err: any) {
            presentAlert({
                header: 'Error',
                subHeader: 'Action Failed', // Optional
                message: err.response?.data?.message || err.message || 'Failed to save contract. Please try again.',
                buttons: ['OK'],
            });
        } finally {
            dismissLoading();
        }
    };

    const handleEdit = (contract: any) => {
        setIsEditMode(true);
        setFormData({
            ...contract,
            customer_name: contract.customer?.name || ''
        });
        setShowModal(true);
    };

    const handleDelete = (id: number, name: string) => {
        presentAlert({
            header: 'Confirm Delete',
            message: `Are you sure you want to delete the contract "${name}"? This action cannot be undone.`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        try {
                            await contractService.deleteContract(id);
                            presentAlert({
                                header: 'Success',
                                message: 'Contract deleted successfully',
                                buttons: ['OK']
                            });
                            loadContracts(currentPage);
                        } catch (err:any) {
                            presentAlert({
                                header: 'Error',
                                subHeader: 'Action Failed', // Optional
                                message: err.response?.data?.message || err.message || 'Failed to delete contract. Please try again.',
                            });
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
                    <IonSearchbar placeholder="Search contracts..." className="erp-searchbar" />
                </div>
                <IonButton onClick={() => { setIsEditMode(false); setFormData(initialFormState); setShowModal(true); }} className="add-btn">
                    <IonIcon slot="start" icon={addOutline} /> Create New Contract
                </IonButton>
            </div>

            <div className="table-wrapper">
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Contract No.</th>
                                <th>Contract Name</th>
                                <th>Customer</th>
                                <th>Type</th>
                                <th>Start - End Date</th>
                                <th>Value</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map((c: any) => (
                                <tr key={c.id}>
                                    <td className="bold-text">{c.contract_number}</td>
                                    <td className="bold-text">{c.name}</td>
                                    <td>{c.customer?.name}</td>
                                    <td>{c.contract_type}</td>
                                    <td>{c.start_date} to {c.end_date}</td>
                                    <td>{c.currency} {c.total_value}</td>
                                    <td>
                                        <span className={`status-badge ${c.status.toLowerCase()}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <IonButton fill="clear" onClick={() => handleEdit(c)}>
                                                <IonIcon icon={pencilOutline} color="primary" />
                                            </IonButton>
                                            {canDelete() && (
                                                <IonButton fill="clear" onClick={() => handleDelete(c.id!, c.name)}>
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

            {/* --- ADD/EDIT MODAL --- */}
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="contract-modal">
                {/* Header */}
                <div className="modal-header-custom">
                    <h2 className="modal-title">Create New Contract</h2>
                    <IonIcon icon={closeOutline} className="close-icon" onClick={() => setShowModal(false)} />
                </div>

                {/* Content Area - Ensure it has a height and overflow */}
                <IonContent className="modal-main-content">
                    <div className="form-wrapper">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12">
                                    <label className="field-label">Title *</label>
                                    <IonInput
                                        className="styled-input"
                                        placeholder="e.g. Annual Maintenance - Tower A"
                                        value={formData.name}
                                        maxlength={255} // Enforces Joi.max(255)
                                        onIonInput={e => setFormData({ ...formData, name: e.detail.value! })}
                                    />
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Customer Name *</label>
                                    <div className="relative-pos">
                                        <IonInput
                                            className="styled-input"
                                            placeholder="Customer name"
                                            value={formData.customer_name}
                                            onIonInput={(e) => handleCustomerSearch(e.detail.value!)}
                                            onIonFocus={() => setShowSuggestions(true)}
                                            onIonBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        />
                                        {/* The Suggestion List */}
                                        {showSuggestions && customerSuggestions.length > 0 && (
                                            <div className="suggestion-list">
                                                {customerSuggestions.map((c) => (
                                                    <div key={c.id} className="suggestion-item" onClick={() => selectCustomer(c)}>
                                                        <div className="s-name">{c.name}</div>
                                                        <div className="s-sub">{c.mobile}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </IonCol>

                                <IonCol size="6">
                                    <label className="field-label">Project Name *</label>
                                    <IonInput
                                        className="styled-input"
                                        placeholder="HVAC Installation"
                                        value={formData.name}
                                        onIonInput={e => setFormData({ ...formData, name: e.detail.value! })}
                                    />
                                </IonCol>

                                <IonCol size="6">
                                    <label className="field-label">Start Date *</label>
                                    <IonInput
                                        type="date"
                                        className="styled-input"
                                        value={formData.start_date}
                                        onIonInput={e => setFormData({ ...formData, start_date: e.detail.value! })}
                                    />
                                </IonCol>

                                <IonCol size="6">
                                    <label className="field-label">End Date *</label>
                                    <IonInput
                                        type="date"
                                        className="styled-input"
                                        value={formData.end_date}
                                        onIonInput={e => setFormData({ ...formData, end_date: e.detail.value! })}
                                    />
                                </IonCol>

                                <IonCol size="6">
                                    <label className="field-label">Contract Value *</label>
                                    <IonInput
                                        type="number"
                                        className="styled-input"
                                        placeholder="0.00"
                                        value={formData.total_value}
                                        onIonInput={e => setFormData({ ...formData, total_value: e.detail.value ? parseFloat(e.detail.value) : 0 })}
                                    />
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Contract Type *</label>
                                    <IonSelect
                                        className="styled-input"
                                        interface="popover"
                                        value={formData.contract_type}
                                        onIonChange={e => setFormData({ ...formData, contract_type: e.detail.value })}
                                    >
                                        <IonSelectOption value="AMC">AMC</IonSelectOption>
                                        <IonSelectOption value="Service">Service</IonSelectOption>
                                        <IonSelectOption value="Subscription">Subscription</IonSelectOption>
                                    </IonSelect>
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Status</label>
                                    <IonSelect
                                        className="styled-input"
                                        interface="popover"
                                        value={formData.status}
                                        onIonChange={e => setFormData({ ...formData, status: e.detail.value })}
                                    >
                                        <IonSelectOption value="Draft">Draft</IonSelectOption>
                                        <IonSelectOption value="Active">Active</IonSelectOption>
                                    </IonSelect>
                                </IonCol>

                                <IonCol size="12">
                                    <label className="field-label">Scope / Terms & Conditions</label>
                                    <IonTextarea
                                        className="styled-input text-area-fix"
                                        rows={4}
                                        placeholder="Enter contract terms..."
                                        value={formData.description}
                                        maxlength={10000}
                                        onIonInput={e => setFormData({ ...formData, description: e.detail.value! })}
                                    />
                                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        {formData.description?.length || 0} / 10000 characters
                                    </div>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                </IonContent>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => setShowModal(false)}>CANCEL</button>
                    <button className="btn-save" onClick={handleSubmit}>CREATE CONTRACT</button>
                </div>
            </IonModal>
        </>
    );
};

export default ContractsContainer;