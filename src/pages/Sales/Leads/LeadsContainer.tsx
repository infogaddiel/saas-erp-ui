import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonInput, IonSelect,
    IonSelectOption, IonTextarea, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent
} from '@ionic/react';
import { addOutline, pencilOutline, trashOutline, closeOutline, downloadOutline, documentTextOutline } from 'ionicons/icons';
import Pagination from '../../../components/Pagination';
import { leadService } from '../../../api/leadService';
import { canDelete } from '../../../utility/authUtils';
import { downloadTemplate } from '../../../utility/downloaTemplate';
import BulkUploadContainer from '../../../components/BulkUploadContainer';
import { Lead } from '../../../interfaces/Lead';
import { getStatusClass } from '../../../utility/commonUtils';

const LeadsContainer: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const initialFormState: Lead = {
        title_of_lead: '',
        contact_person: '',
        company_name: '',
        contact_no: '',
        address: '',
        lead_source: 'Walk-in',
        lead_status_id: 1,
        product_required: ''
    };
    const [formData, setFormData] = useState<Lead>(initialFormState);

    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();
    const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1, limit: 10 });
    const [statusOptions, setStatusOptions] = useState<any[]>([]);
    const loadLeads = async (page: number) => {
        try {
            const response: any = await leadService.getLeads(page, 10);
            if (response && response.success) {
                setLeads(response.data.leads);
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
        const fetchStatuses = async () => {
            try {
                const res = await leadService.getLeadStatusDropdown();
                // Assuming res.data is an array of { id: number, status_name: string }
                if (res && res.data) {
                    setStatusOptions(res.data);
                }
            } catch (err) {
                console.error("Failed to load lead statuses", err);
            }
        };
        fetchStatuses();
    }, []);
    useEffect(() => {
        loadLeads(currentPage);
    }, [currentPage]);

    const handleSubmit = async () => {
        if (!formData.title_of_lead || !formData.contact_no) {
            presentAlert({ header: 'Required', message: 'Please fill in Lead Title and Contact Number', buttons: ['OK'] });
            return;
        }

        await presentLoading('Saving Lead...');
        try {
            if (isEditMode && formData.id) {
                await leadService.updateLead(formData.id, formData);
            } else {
                await leadService.addLead(formData);
            }
            setShowModal(false);
            loadLeads(currentPage);
            presentAlert({ header: 'Success', message: `Lead ${isEditMode ? 'Updated' : 'Created'} Successfully`, buttons: ['OK'] });
        } catch (err: any) {
            presentAlert({ header: 'Error', message: err.response?.data?.message || 'Failed to save lead.', buttons: ['OK'] });
        } finally {
            dismissLoading();
        }
    };

    const handleDelete = (id: number, title: string) => {
        presentAlert({
            header: 'Confirm Delete',
            message: `Delete lead "${title}"?`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        try {
                            await leadService.deleteLead(id);
                            loadLeads(currentPage);
                        } catch (err) { console.error(err); }
                    },
                },
            ],
        });
    };

    const sampleLeadTemplate = {
        title_of_lead: "Software Inquiry",
        contact_person: "John Doe",
        company_name: "Tech Corp",
        contact_no: "9876543210",
        address: "Mumbai, India",
        lead_source: "Google",
        lead_status_id: "1",
        product_required: "ERP System"
    };

    return (
        <>
            <div className="page-header-section">
                <div className="search-wrapper">
                    <IonSearchbar placeholder="Search leads..." className="erp-searchbar" />
                </div>
                <div className="page-action-bar">
                    <IonButton size="small" onClick={() => { setIsEditMode(false); setFormData(initialFormState); setShowModal(true); }}>
                        <IonIcon icon={addOutline} slot="start" /> New Lead
                    </IonButton>
                    {/* <IonButton size="small" fill="outline" color="medium" onClick={() => downloadTemplate(sampleLeadTemplate, 'Leads')}>
                        <IonIcon slot="start" icon={documentTextOutline} /> Template
                    </IonButton>
                    <BulkUploadContainer
                        title="Import Leads"
                        onUpload={leadService.bulkCreate}
                        onSuccess={() => loadLeads(currentPage)}
                    /> */}
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-container table-responsive-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Company</th>
                                <th>Contact Person</th>
                                <th>Mobile</th>
                                <th>Source</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((l) => (
                                <tr key={l.id}>
                                    <td className="bold-text">{l.id}</td>
                                    <td className="bold-text">{l.title_of_lead}</td>
                                    <td>{l.company_name}</td>
                                    <td>{l.contact_person}</td>
                                    <td>{l.contact_no}</td>
                                    <td>{l.lead_source}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(l.lead_status_id)}`}>
                                            {statusOptions.find(s => s.id === l.lead_status_id)?.name || 'New'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <IonButton fill="clear" onClick={() => { setIsEditMode(true); setFormData(l); setShowModal(true); }}>
                                                <IonIcon icon={pencilOutline} color="primary" />
                                            </IonButton>
                                            {canDelete() && (
                                                <IonButton fill="clear" onClick={() => handleDelete(l.id!, l.title_of_lead)}>
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
                    onPageChange={(p) => setCurrentPage(p)}
                />
            </div>

            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="contract-modal">
                <div className="modal-header-custom">
                    <h2 className="modal-title">{isEditMode ? 'Edit Lead' : 'New Lead Entry'}</h2>
                    <IonIcon icon={closeOutline} className="close-icon" onClick={() => setShowModal(false)} />
                </div>

                <IonContent className="modal-main-content">
                    <div className="form-wrapper">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12">
                                    <label className="field-label">Title of Lead *</label>
                                    <IonInput className="styled-input" value={formData.title_of_lead} onIonInput={e => setFormData({ ...formData, title_of_lead: e.detail.value! })} />
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Contact Person</label>
                                    <IonInput className="styled-input" value={formData.contact_person} onIonInput={e => setFormData({ ...formData, contact_person: e.detail.value! })} />
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Contact No *</label>
                                    <IonInput className="styled-input" value={formData.contact_no} onIonInput={e => setFormData({ ...formData, contact_no: e.detail.value! })} />
                                </IonCol>
                                <IonCol size="12">
                                    <label className="field-label">Company Name</label>
                                    <IonInput className="styled-input" value={formData.company_name} onIonInput={e => setFormData({ ...formData, company_name: e.detail.value! })} />
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Lead Source</label>
                                    <IonSelect className="styled-input" interface="popover" value={formData.lead_source} onIonChange={e => setFormData({ ...formData, lead_source: e.detail.value })}>
                                        <IonSelectOption value="Google">Google</IonSelectOption>
                                        <IonSelectOption value="Referral">Referral</IonSelectOption>
                                        <IonSelectOption value="Exhibition">Exhibition</IonSelectOption>
                                        <IonSelectOption value="Walk-in">Walk-in</IonSelectOption>
                                    </IonSelect>
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Lead Status</label>
                                    <IonSelect className="styled-input" interface="popover" value={formData.lead_status_id} onIonChange={e => setFormData({ ...formData, lead_status_id: e.detail.value })}>
                                        {statusOptions.map((status) => (
                                            <IonSelectOption key={status.id} value={status.id}>
                                                {status.name}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonCol>
                                <IonCol size="12">
                                    <label className="field-label">Address</label>
                                    <IonTextarea className="styled-input text-area-fix" rows={2} value={formData.address} onIonInput={e => setFormData({ ...formData, address: e.detail.value! })} />
                                </IonCol>
                                <IonCol size="12">
                                    <label className="field-label">Product Required</label>
                                    <IonTextarea className="styled-input text-area-fix" rows={3} value={formData.product_required} onIonInput={e => setFormData({ ...formData, product_required: e.detail.value! })} />
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                </IonContent>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => setShowModal(false)}>CANCEL</button>
                    <button className="btn-save" onClick={handleSubmit}>{isEditMode ? 'UPDATE LEAD' : 'CREATE LEAD'}</button>
                </div>
            </IonModal>
        </>
    );
};

export default LeadsContainer;