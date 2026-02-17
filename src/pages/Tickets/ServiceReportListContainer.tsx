import React, { useState, useEffect } from 'react';
import {
    IonList, IonItem, IonLabel, IonBadge, IonRefresher,
    IonRefresherContent, IonSpinner, IonIcon, IonNote,
    IonSearchbar,
    IonButton,
    useIonLoading,
    useIonAlert,
    IonItemOption,
    IonItemOptions,
    IonItemSliding
} from '@ionic/react';
import { addOutline, calendarOutline, createOutline, documentTextOutline, trashOutline } from 'ionicons/icons';
import Pagination from '../../components/Pagination';
import { ticketService } from '../../api/ticketService';
import { useHistory } from 'react-router-dom';

const ServiceReportListContainer: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();
    const [paginationData, setPaginationData] = useState({
        total: 0,
        totalPages: 1,
        limit: 10
    });

    // Automatically triggers when currentPage changes via Pagination component
    useEffect(() => {
        loadReports(currentPage);
    }, [currentPage]);

    const loadReports = async (page: number) => {
        setLoading(true);
        try {
            const response: any = await ticketService.getServiceReports(page, 10);

            if (response && response.data.services) {
                setReports(response.data.services);
                // Map the pagination object exactly as returned
                setPaginationData({
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages,
                    limit: response.data.pagination.limit
                });
            }
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (event: any) => {
        await loadReports(1);
        setCurrentPage(1);
        event.detail.complete();
    };

    const history = useHistory();

    const handleAddClick = () => {
        // Navigates to the "New" service report page
        history.push('/dashboard/tickets/service-report/new');
    };

    const handleDelete = async (ticketId: number, serviceId: number) => {
        presentAlert({
            header: 'Delete Report',
            message: 'Are you sure you want to delete this service report? This action cannot be undone.',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        await presentLoading('Deleting report...');
                        try {
                            await ticketService.deleteServiceReport(ticketId, serviceId);
                            // Optimistic UI update: Remove from list immediately
                            setReports(prev => prev.filter(r => r.id !== serviceId));
                        } catch (err) {
                            console.error("Delete error", err);
                            presentAlert({header:'Error',message: 'Failed to delete the report. Please try again.'});
                        } finally {
                            await dismissLoading();
                        }
                    }
                }
            ]
        });
    };

    const handleEdit = (ticketId: number, serviceId: number) => {
        // Navigates to the edit route
        history.push(`/dashboard/tickets/${ticketId}/services/${serviceId}/edit`);
    };

    return (
        <>
            <div className="service-report-container">
                <div className="page-header-section">
                    <div className="search-wrapper">
                        <IonSearchbar
                            placeholder="Search reports by ID or Customer..."
                            className="erp-searchbar"
                            value={searchTerm}
                            onIonInput={(e) => {
                                setSearchTerm(e.detail.value!);
                                setCurrentPage(1); // Reset to page 1 on search
                            }}
                            debounce={500}
                        />
                    </div>
                    <IonButton onClick={handleAddClick} className="add-btn">
                        <IonIcon slot="start" icon={addOutline} /> Create New Report
                    </IonButton>
                </div>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                {loading ? (
                    <div className="ion-text-center ion-padding">
                        <IonSpinner name="crescent" />
                    </div>
                ) : (
                    <>
                        <IonList lines="none" className="report-list-container">
                            {reports.map((report) => (
                                <IonItemSliding key={report.id}>
                                    {/* Action Options when Swiped (Mobile) */}
                                    <IonItemOptions side="end">
                                        <IonItemOption color="primary" onClick={() => handleEdit(report.ticket_id, report.id)}>
                                            <IonIcon slot="icon-only" icon={createOutline} />
                                        </IonItemOption>
                                        <IonItemOption color="danger" onClick={() => handleDelete(report.ticket_id, report.id)}>
                                            <IonIcon slot="icon-only" icon={trashOutline} />
                                        </IonItemOption>
                                    </IonItemOptions>

                                    {/* Main Item */}
                                <IonItem
                                    className="report-item-card"
                                    detail={false}
                                >
                                    <div slot="start" className="report-icon-box" onClick={() => history.push(`/dashboard/tickets/${report.ticket_id}/services/${report.id}`)}>
                                            <IonIcon icon={documentTextOutline} color="primary" />
                                        </div>
                                    <IonLabel onClick={() => history.push(`/dashboard/tickets/${report.ticket_id}/services/${report.id}`)}>
                                        <div className="report-header">
                                            <h2>{report.customer_name}</h2>
                                            <IonBadge color="success">Verified</IonBadge>
                                        </div>
                                        <p className="sub-text">Ticket: #{report.ticket_id}</p>
                                        <IonNote className="report-footer">
                                            <IonIcon icon={calendarOutline} />
                                            {new Date(report.service_date).toLocaleDateString()}
                                        </IonNote>
                                    </IonLabel>
                                    <div slot="end" className="desktop-actions ion-hide-sm-down">
                                        <IonButton fill="clear" color="medium" onClick={() => handleEdit(report.ticket_id, report.id)}>
                                            <IonIcon icon={createOutline} slot="icon-only" />
                                        </IonButton>
                                        <IonButton fill="clear" color="danger" onClick={() => handleDelete(report.ticket_id, report.id)}>
                                            <IonIcon icon={trashOutline} slot="icon-only" />
                                        </IonButton>
                                    </div>
                                </IonItem>
                                </IonItemSliding>
                            ))}
                        </IonList>

                        {/* Using your standard Pagination component */}
                        <div className="ion-padding">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={paginationData.totalPages}
                                totalItems={paginationData.total}
                                itemsPerPage={paginationData.limit}
                                onPageChange={(newPage) => setCurrentPage(newPage)}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ServiceReportListContainer;