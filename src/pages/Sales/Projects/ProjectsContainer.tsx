import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent
} from '@ionic/react';
import { addOutline, pencilOutline, trashOutline, personOutline, calendarOutline, cashOutline, closeOutline } from 'ionicons/icons';
import Pagination from '../../../components/Pagination';
import { projectService } from '../../../api/projectService'; // You'll need to create this
import { customerService } from '../../../api/customerService';
import { canDelete } from '../../../utility/authUtils';
import { Project } from '../../../interfaces/Project';
import { formatDateToDMY } from '../../../utility/commonUtils';

const ProjectsContainer: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
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

    const initialFormState: Project = {
        project_name: '',
        customer_id: null as number | null,
        customer_name: '', // UI Helper
        project_manager: '',
        start_date: '',
        end_date: '',
        budget: 0,
        status: 'Planning',
        description: '',
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const loadProjects = async (page: number) => {
        try {
            const response: any = await projectService.getProjects(page, 10);
            if (response && response.success) {
                setProjects(response.data.projects);
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
        loadProjects(currentPage);
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
        if (!formData.customer_id || !formData.project_name) {
            presentAlert({ header: 'Required', message: 'Please fill in Customer and Project Name', buttons: ['OK'] });
            return;
        }

        await presentLoading('Saving Project...');
        try {
            const payload = {
                ...formData,
                start_date: formatDateToDMY(formData.start_date!),
                end_date: formatDateToDMY(formData.end_date!)
            };
            if (isEditMode && (formData as any).id) {
                await projectService.updateProject((formData as any).id, payload);
            } else {
                await projectService.addProject(payload);
            }
            setShowModal(false);
            loadProjects(currentPage);
            presentAlert({
                header: 'Success',
                message: `Project ${isEditMode ? 'Updated' : 'Created'} Successfully`,
                buttons: ['OK'],
            });
        } catch (err: any) {
            presentAlert({
                header: 'Error',
                message: err.response?.data?.message || 'Failed to save project.',
                buttons: ['OK'],
            });
        } finally {
            dismissLoading();
        }
    };

    const handleEdit = (project: any) => {
        setIsEditMode(true);
        setFormData({
            ...project,
            customer_name: project.customer?.name || ''
        });
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
                            await projectService.deleteProject(id);
                            loadProjects(currentPage);
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
                    <IonSearchbar placeholder="Search projects..." className="erp-searchbar" />
                </div>
                <IonButton onClick={() => { setIsEditMode(false); setFormData(initialFormState); setShowModal(true); }} className="add-btn">
                    <IonIcon slot="start" icon={addOutline} /> Create New Project
                </IonButton>
            </div>

            <div className="table-wrapper">
                <div className="table-container table-responsive-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Project No.</th>
                                <th>Project Name</th>
                                <th>Customer</th>
                                <th>Manager</th>
                                <th>Timeline</th>
                                <th>Budget</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p: any) => (
                                <tr key={p.id}>
                                     <td className="bold-text">{p.project_number}</td>
                                    <td className="bold-text">{p.project_name}</td>
                                    <td>{p.customer?.name}</td>
                                    <td>{p.project_manager}</td>
                                    <td>{p.start_date} - {p.end_date}</td>
                                    <td>{p.budget?.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${p.status.toLowerCase().replace(' ', '-')}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <IonButton fill="clear" onClick={() => handleEdit(p)}>
                                                <IonIcon icon={pencilOutline} color="primary" />
                                            </IonButton>
                                            {canDelete() && (
                                                <IonButton fill="clear" onClick={() => handleDelete(p.id!, p.project_name)}>
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
                    <h2 className="modal-title">{isEditMode ? 'Edit Project' : 'Create New Project'}</h2>
                    <IonIcon icon={closeOutline} className="close-icon" onClick={() => setShowModal(false)} />
                </div>

                <IonContent className="modal-main-content">
                    <div className="form-wrapper">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12">
                                    <label className="field-label">Project Name *</label>
                                    <IonInput
                                        className="styled-input"
                                        placeholder="Project Title"
                                        value={formData.project_name}
                                        onIonInput={e => setFormData({ ...formData, project_name: e.detail.value! })}
                                    />
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Customer *</label>
                                    <div className="relative-pos">
                                        <IonInput
                                            className="styled-input"
                                            placeholder="Search Customer..."
                                            value={formData.customer_name}
                                            onIonInput={(e) => handleCustomerSearch(e.detail.value!)}
                                            onIonFocus={() => setShowSuggestions(true)}
                                            onIonBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        />
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
                                    <label className="field-label">Project Manager</label>
                                    <IonInput
                                        className="styled-input"
                                        placeholder="Name of PM"
                                        value={formData.project_manager}
                                        onIonInput={e => setFormData({ ...formData, project_manager: e.detail.value! })}
                                    />
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Start Date</label>
                                    <IonInput type="date" className="styled-input" value={formData.start_date} onIonInput={e => setFormData({ ...formData, start_date: e.detail.value! })} />
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">End Date</label>
                                    <IonInput type="date" className="styled-input" value={formData.end_date} onIonInput={e => setFormData({ ...formData, end_date: e.detail.value! })} />
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Budget</label>
                                    <IonInput type="number" className="styled-input" value={formData.budget} onIonInput={e => setFormData({ ...formData, budget: parseFloat(e.detail.value!) })} />
                                </IonCol>
                                <IonCol size="6">
                                    <label className="field-label">Status</label>
                                    <IonSelect className="styled-input" interface="popover" value={formData.status} onIonChange={e => setFormData({ ...formData, status: e.detail.value })}>
                                        <IonSelectOption value="Planning">Planning</IonSelectOption>
                                        <IonSelectOption value="In Progress">In Progress</IonSelectOption>
                                        <IonSelectOption value="On Hold">On Hold</IonSelectOption>
                                        <IonSelectOption value="Cancelled">Cancelled</IonSelectOption>
                                         <IonSelectOption value="Completed">Completed</IonSelectOption>
                                    </IonSelect>
                                </IonCol>
                                <IonCol size="12">
                                    <label className="field-label">Description</label>
                                    <IonTextarea className="styled-input text-area-fix" rows={3} value={formData.description} onIonInput={e => setFormData({ ...formData, description: e.detail.value! })} />
                                </IonCol>
                                <IonCol size="12">
                                    <label className="field-label">Internal Notes</label>
                                    <IonTextarea className="styled-input text-area-fix" rows={2} value={formData.notes} onIonInput={e => setFormData({ ...formData, notes: e.detail.value! })} />
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                </IonContent>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => setShowModal(false)}>CANCEL</button>
                    <button className="btn-save" onClick={handleSubmit}>{isEditMode ? 'UPDATE PROJECT' : 'CREATE PROJECT'}</button>
                </div>
            </IonModal>
        </>
    );
};

export default ProjectsContainer;