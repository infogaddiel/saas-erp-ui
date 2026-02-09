import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonGrid, IonRow, IonCol,
    useIonAlert, useIonLoading, IonContent, IonSpinner
} from '@ionic/react';
import { addOutline, pencilOutline, trashOutline, ticketOutline, calendarOutline, personOutline } from 'ionicons/icons';
import Pagination from '../../components/Pagination';
import { ticketService } from '../../api/ticketService'; // Assuming you have this
import { userService } from '../../api/userService';
import { Ticket } from '../../interfaces/Ticket';


const TicketsContainer: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<any[]>([]);
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

    const initialFormState : Ticket = {
        email:'',
        mobile:'',
        service_address: '',
        priority: 'Low',
        service_type: 'Repair',
        scheduled_date: '',
        issue_description: '',
        equipment_model: '',
        assigned_technician_id: null
    };

    const [formData, setFormData] = useState<Ticket>(initialFormState);

    const loadTickets = async (page: number) => {
        try {
            const response: any = await ticketService.getTickets(page, 10);
            if (response && response.success) {
                setTickets(response.data.tickets);
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

    const fetchTechnicians = async () => {
        try {
            const response = await userService.getUsersByRole(3);
            setTechnicians(response.data || []);
        } catch (err) {
            console.error("Could not load technicians", err);
        }
    };

    useEffect(() => {
        loadTickets(currentPage);
        fetchTechnicians();
    }, [currentPage]);

    const handleSubmit = async () => {
        await presentLoading('Saving Ticket...');
        try {
            if (isEditMode && (formData as any).id) {
                await ticketService.updateTicket((formData as any).id, formData);
            } else {
                await ticketService.addTicket(formData);
            }
            setShowModal(false);
            loadTickets(currentPage);
            presentAlert({
                header: 'Success',
                message: `Ticket ${isEditMode ? 'Updated' : 'Created'} Successfully`,
                buttons: ['OK'],
            });
        } catch (err) {
            presentAlert({
                header: 'Error',
                message: 'Failed to save ticket. Please check your data.',
                buttons: ['OK'],
            });
        } finally {
            dismissLoading();
        }
    };

    const handleDelete = (id: number, ticketNo: string) => {
        presentAlert({
            header: 'Confirm Delete',
            message: `Are you sure you want to delete Ticket ${ticketNo}?`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        await ticketService.deleteTicket(id);
                        loadTickets(currentPage);
                    }
                }
            ]
        });
    };

    const handleEdit = (ticket: any) => {
        setIsEditMode(true);
        setFormData(ticket);
        setShowModal(true);
    };

    const handleAddClick = () => {
        setIsEditMode(false);
        setFormData(initialFormState);
        setShowModal(true);
    };

    return (
        <>
            <div className="page-header-section">
                <div className="search-wrapper">
                    <IonSearchbar placeholder="Search tickets by ID or Customer..." className="erp-searchbar" />
                </div>
                <IonButton onClick={handleAddClick} className="add-btn">
                    <IonIcon slot="start" icon={addOutline} /> Create New Ticket
                </IonButton>
            </div>

            <div className="table-wrapper">
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Customer</th>
                                <th>Technician</th>
                                <th>Scheduled Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((t: any) => (
                                <tr key={t.id}>
                                    <td className="bold-text">{t.ticket_no}</td>
                                    <td>
                                        <div className="cell-main">{t.customer_name}</div>
                                        <div className="cell-sub">{t.mobile}</div>
                                    </td>
                                    <td>{t.technician_name || 'Unassigned'}</td>
                                    <td>{t.scheduled_date}</td>
                                    <td>
                                        <span className={`status-badge ${t.status?.toLowerCase().replace(' ', '-')}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <IonButton fill="clear" onClick={() => handleEdit(t)}>
                                                <IonIcon icon={pencilOutline} color="primary" />
                                            </IonButton>
                                            <IonButton fill="clear" onClick={() => handleDelete(t.id, t.ticket_no)}>
                                                <IonIcon icon={trashOutline} color="danger" />
                                            </IonButton>
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
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="staff-modal">
                <div className="modal-header">
                    <h3>{isEditMode ? 'Edit Service Ticket' : 'Add New Service Ticket'}</h3>
                </div>
                <IonContent className="modal-scroll-content">
                    <div className="modal-body compact-form">
                        
                        <div className="permission-header">
                            <IonIcon icon={personOutline} />
                            <span>Customer Information</span>
                        </div>
                        <div className="form-grid">
                            <IonItem lines="none" className="modal-input full-width">
                                <IonLabel position="stacked">Customer Name *</IonLabel>
                                <IonInput value={formData.customer_name}
                                    onIonInput={e => setFormData({ ...formData, customer_name: e.detail.value! })}
                                    placeholder="Enter full name" />
                            </IonItem>
                            <IonItem lines="none" className="modal-input">
                                <IonLabel position="stacked">Email</IonLabel>
                                <IonInput type="email" value={formData.email}
                                    onIonInput={e => setFormData({ ...formData, email: e.detail.value! })} />
                            </IonItem>
                            <IonItem lines="none" className="modal-input">
                                <IonLabel position="stacked">Mobile Number *</IonLabel>
                                <IonInput type="tel" value={formData.mobile}
                                    onIonInput={e => setFormData({ ...formData, mobile: e.detail.value! })} />
                            </IonItem>
                            <IonItem lines="none" className="modal-input full-width">
                                <IonLabel position="stacked">Service Address *</IonLabel>
                                <IonInput value={formData.service_address}
                                    onIonInput={e => setFormData({ ...formData, service_address: e.detail.value! })} />
                            </IonItem>
                        </div>

                        <div className="permission-header">
                            <IonIcon icon={ticketOutline} />
                            <span>Ticket Details</span>
                        </div>
                        <div className="form-grid">
                            <IonItem lines="none" className="modal-input">
                                <IonLabel position="stacked">Priority</IonLabel>
                                <IonSelect value={formData.priority} onIonChange={e => setFormData({ ...formData, priority: e.detail.value })}>
                                    <IonSelectOption value="Low">Low</IonSelectOption>
                                    <IonSelectOption value="Medium">Medium</IonSelectOption>
                                    <IonSelectOption value="High">High</IonSelectOption>
                                    <IonSelectOption value="Urgent">Urgent</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                            <IonItem lines="none" className="modal-input">
                                <IonLabel position="stacked">Service Type</IonLabel>
                                <IonSelect value={formData.service_type} onIonChange={e => setFormData({ ...formData, service_type: e.detail.value })}>
                                    <IonSelectOption value="Repair">Repair</IonSelectOption>
                                    <IonSelectOption value="Installation">Installation</IonSelectOption>
                                    <IonSelectOption value="Maintenance">Maintenance</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                            <IonItem lines="none" className="modal-input">
                                <IonLabel position="stacked">Assign Technician</IonLabel>
                                <IonSelect value={formData.assigned_technician_id} onIonChange={e => setFormData({ ...formData, assigned_technician_id: e.detail.value })}>
                                    {technicians.map(tech => (
                                        <IonSelectOption key={tech.id} value={tech.id}>{tech.name}</IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                            <IonItem lines="none" className="modal-input">
                                <IonLabel position="stacked">Scheduled Date</IonLabel>
                                <IonInput type="date" value={formData.scheduled_date}
                                    onIonInput={e => setFormData({ ...formData, scheduled_date: e.detail.value! })} />
                            </IonItem>
                            <IonItem lines="none" className="modal-input full-width">
                                <IonLabel position="stacked">Issue Description *</IonLabel>
                                <IonTextarea value={formData.issue_description}
                                    onIonInput={e => setFormData({ ...formData, issue_description: e.detail.value! })}
                                    placeholder="Describe the issue in detail..." />
                            </IonItem>
                        </div>
                    </div>
                </IonContent>
                <div className="modal-footer">
                    <IonButton fill="clear" color="medium" onClick={() => setShowModal(false)}>Cancel</IonButton>
                    <IonButton onClick={handleSubmit} className="save-btn" color="primary">
                        {isEditMode ? 'Update Ticket' : 'Create Ticket'}
                    </IonButton>
                </div>
            </IonModal>
        </>
    );
};

export default TicketsContainer;