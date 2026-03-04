import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent
} from '@ionic/react';
import { addOutline, pencilOutline, trashOutline, personOutline, calendarOutline, cashOutline, closeOutline, documentOutline, downloadOutline, documentTextOutline } from 'ionicons/icons';
import Pagination from '../../../components/Pagination';
import { projectService } from '../../../api/projectService'; // You'll need to create this
import { customerService } from '../../../api/customerService';
import { canDelete } from '../../../utility/authUtils';
import { Project, ProjectDocument } from '../../../interfaces/Project';
import { formatDateToDMY, getDocumentType, normalizeOptionalText } from '../../../utility/commonUtils';
import { ticketService } from '../../../api/ticketService';
import { downloadTemplate } from '../../../utility/downloaTemplate';
import BulkUploadContainer from '../../../components/BulkUploadContainer';

const ProjectsContainer: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();
    const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>([]);
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
        notes: '',
        documents:[]
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
            const formattedDocuments = projectDocuments.map(doc => ({
                ...(doc.id && { id: doc.id }),
                document_name: doc.document_name.trim(),
                document_url: doc.document_url?.trim() || "",
                document_type: normalizeOptionalText(doc.document_type),
                notes: normalizeOptionalText(doc.notes)
            }));
            const payload = {
                ...formData,
                start_date: formatDateToDMY(formData.start_date!),
                end_date: formatDateToDMY(formData.end_date!),
                documents: formattedDocuments
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
        // 2. Map existing documents from the API to your local state
        if (project.documents && Array.isArray(project.documents)) {
            const existingDocs = project.documents.map((doc: any) => ({
                id: doc.id, // Keep the ID for the backend to recognize existing records
                document_name: doc.document_name || '',
                document_url: doc.document_url || '',
                document_type: doc.document_type || '',
                notes: doc.notes || '',
                file: null // No local file object yet as it's already on the server
            }));
            setProjectDocuments(existingDocs);
        } else {
            setProjectDocuments([]); // Ensure it's an empty array if no docs exist
        }
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
    const addDocumentRow = () => {
        setProjectDocuments([...projectDocuments, {
            document_name: '',
            document_type: 'Other',
            notes: '',
            document_url: null
        }]);
    };
    const handleDocumentChange = async (index: number, field: string, value: any) => {
        const updatedDocs: any = [...projectDocuments];

        if (field === 'file' && value) {
            await presentLoading('Uploading document...');
            try {
                // Step 1: Upload the file to the server immediately
                const uploadRes = await ticketService.upload(value);

                if (uploadRes) {
                    // Step 2: Save the returned URL and metadata
                    updatedDocs[index]['document_url'] = uploadRes;
                    if (!updatedDocs[index]['document_name']) {
                        updatedDocs[index]['document_name'] = value.name.split('.')[0];
                    }
                    updatedDocs[index]['document_type'] = getDocumentType(value.name);
                    updatedDocs[index]['file'] = value; // Keep reference for UI display
                }
            } catch (err) {
                presentAlert({ header: 'Upload Failed', message: 'Could not upload file.', buttons: ['OK'] });
            } finally {
                dismissLoading();
            }
        } else {
            updatedDocs[index][field] = value;
        }

        setProjectDocuments(updatedDocs);
    };
    const removeDocumentRow = (index: number) => {
        const updatedDocs = projectDocuments.filter((_, i) => i !== index);
        setProjectDocuments(updatedDocs);
    };

    const handleExport = async () => {
        await presentLoading('Preparing Excel file...');
        try {
            const data = await projectService.exportToExcel();

            // 1. Create a Blob from the response data
            const blob = new Blob([data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // 2. Create a temporary URL for the Blob
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // 3. Set the filename
            // Note: We use a timestamp to ensure uniqueness
            const filename = `Projects_Report_${new Date().toLocaleDateString()}.xlsx`;
            link.setAttribute('download', filename);

            // 4. Trigger download
            document.body.appendChild(link);
            link.click();

            // 5. Cleanup
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Export Error:", err);
            presentAlert({
                header: 'Export Failed',
                message: 'Could not generate report. Please try again.',
                buttons: ['OK']
            });
        } finally {
            dismissLoading();
        }
    };

    const sampleData = {
        project_name: "XYZ", // Sample data helps users understand the format
        customer_id: "Customer Id",
        project_manager: "PM name", // Mention valid types: Individual or Corporate
        start_date: "YYYY-mm-dd",
        end_date: "YYYY-mm-dd",
        budget: "100000",
        description: "Project Description",
        notes: "Project Notes",
        status: "In Progress"

    }
    return (
        <>
            <div className="page-header-section">
                <div className="search-wrapper">
                    <IonSearchbar placeholder="Search projects..." className="erp-searchbar" />
                </div>
                <div className="page-action-bar">
                    <IonButton size="small" onClick={() => { setIsEditMode(false); setProjectDocuments([]); setFormData(initialFormState); setShowModal(true); }}>
                        <IonIcon icon={addOutline} slot="start" /> New Project
                    </IonButton>
                    <IonButton size="small" color="success" onClick={handleExport} className="export-btn">
                        <IonIcon slot="start" icon={downloadOutline} />
                        Export
                    </IonButton>
                    <IonButton size="small"
                        fill="outline"
                        color="medium"
                        onClick={() => downloadTemplate(sampleData, 'Projects')}
                    ><IonIcon slot="start" icon={documentTextOutline} />
                        Template
                    </IonButton>
                    <BulkUploadContainer
                        title="Import Projects"
                        onUpload={projectService.bulkCreate}
                        onSuccess={() => loadProjects(currentPage)}
                    />
                </div>
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
                            <IonRow>
                                <IonCol size="12">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                        <label className="field-label">Project Documents</label>
                                        <IonButton fill="outline" size="small" onClick={addDocumentRow}>
                                            <IonIcon slot="start" icon={addOutline} /> Add Document
                                        </IonButton>
                                    </div>
                                </IonCol>

                                {projectDocuments.map((doc, index) => (
                                    <IonCol size="12" key={index} className="document-row-container">
                                        <div className="document-row-header">
                                            <span className="doc-number">Document #{index + 1}</span>
                                            <IonButton fill="clear" color="danger" onClick={() => removeDocumentRow(index)}>
                                                <IonIcon icon={trashOutline} slot="icon-only" />
                                            </IonButton>
                                        </div>

                                        <IonRow>
                                            <IonCol size="6">
                                                <label className="field-label">Document Name *</label>
                                                <IonInput
                                                    className="styled-input"
                                                    value={doc.document_name}
                                                    onIonInput={e => handleDocumentChange(index, 'document_name', e.detail.value!)}
                                                />
                                            </IonCol>

                                            <IonCol size="6">
                                                <label className="field-label">Type</label>
                                                <div className="type-badge-container">
                                                    <span className={`type-badge ${doc.document_type?.toLowerCase()}`}>
                                                        {doc.document_type || 'Unknown'}
                                                    </span>
                                                </div>
                                            </IonCol>

                                            <IonCol size="6">
                                                <label className="field-label">File (.xls, .ppt, .doc, .pdf)</label>
                                                <input
                                                    type="file"
                                                    accept=".xls,.xlsx,.ppt,.pptx,.doc,.docx,.pdf"
                                                    onChange={(e) => handleDocumentChange(index, 'file', e.target.files?.[0])}
                                                />
                                            </IonCol>
                                            <IonCol size="6">
                                                {/* Inside your document loop in the Modal */}
                                                {doc.document_url && (
                                                    <div className="file-preview-link">
                                                        <IonIcon icon={documentOutline} />
                                                        <a href={doc.document_url} target="_blank" rel="noreferrer">
                                                            View Current {doc.document_type}
                                                        </a>
                                                    </div>
                                                )}
                                            </IonCol>
                                        </IonRow>
                                    </IonCol>
                                ))}
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