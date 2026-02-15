import React, { useState, useEffect } from 'react';
import { 
    IonList, IonItem, IonLabel, IonBadge, IonRefresher, 
    IonRefresherContent, IonSpinner, IonIcon, IonNote, 
    IonSearchbar,
    IonButton
} from '@ionic/react';
import { addOutline, calendarOutline, documentTextOutline } from 'ionicons/icons';
import Pagination from '../../components/Pagination';
import { ticketService } from '../../api/ticketService';
import { useHistory } from 'react-router-dom';

const ServiceReportListContainer: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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
                            <IonItem 
                                key={report.id} 
                                routerLink={`/dashboard/tickets/${report.ticket_id}/services/${report.id}`} 
                                className="report-item-card"
                            >
                                <div slot="start" className="report-icon-box">
                                    <IonIcon icon={documentTextOutline} color="primary" />
                                </div>
                                <IonLabel>
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
                            </IonItem>
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