import React, { useEffect, useState } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons,
    IonBackButton, IonGrid, IonRow, IonCol, IonBadge, IonIcon, IonSpinner, IonText
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { calendarOutline, personOutline, buildOutline, videocamOutline, imageOutline } from 'ionicons/icons';
import { ticketService } from '../../api/ticketService';

const ServiceReportViewPage: React.FC = () => {
    const { ticketId, serviceId } = useParams<{ ticketId: string, serviceId: string }>();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                const response = await ticketService.getServiceReportById(Number(ticketId), Number(serviceId));
                if (response.success) setReport(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReportDetails();
    }, [ticketId, serviceId]);

    if (loading) return (
        <IonPage><IonContent className="ion-text-center ion-padding"><IonSpinner name="crescent" /></IonContent></IonPage>
    );

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/service-reports" />
                    </IonButtons>
                    <IonTitle>Report #{serviceId}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding grey-bg">
                <IonGrid>
                    {/* Status and Header */}
                    <IonRow className="view-card ion-padding">
                        <IonCol size="12">
                            <div className="flex-justify">
                                <h1 className="customer-title">{report.customer_name}</h1>
                                <IonBadge color="success">{report.report_status}</IonBadge>
                            </div>
                            <p className="ticket-ref">Ticket ID: {report.ticket_id}</p>
                        </IonCol>
                    </IonRow>

                    {/* 2. Technician Information - New Section */}
                    <h3 className="section-title">Technician Details</h3>
                    <IonRow className="view-card ion-padding">
                        <IonCol size="12">
                            <div className="technician-info">
                                <div className="avatar-circle">
                                    {report.technician?.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="tech-name">{report.technician?.name}</h2>
                                    <p className="tech-meta">{report.technician?.email}</p>
                                    <p className="tech-meta">Mob: {report.technician?.mobile}</p>
                                </div>
                            </div>
                        </IonCol>
                    </IonRow>

                    {/* 3. Job Details */}
                    <h3 className="section-title">Service Details</h3>
                    <IonRow className="view-card ion-padding">
                        <IonCol size="6">
                            <label className="view-label">Service Type</label>
                            <div className="view-value">{report.service_type}</div>
                        </IonCol>
                        <IonCol size="6">
                            <label className="view-label">Service Date</label>
                            <div className="view-value">{report.service_date}</div>
                        </IonCol>
                        <IonCol size="12" className="ion-margin-top">
                            <label className="view-label">Work Performed</label>
                            <div className="view-value-box">
                                {report.work_performed || "No work details provided"}
                            </div>
                        </IonCol>
                    </IonRow>

                    {/* Media Section */}
                    <h3 className="section-title">Media Attachments</h3>
                    <IonRow className="view-card ion-padding">
                        <IonCol size="12">
                            <label className="view-label"><IonIcon icon={imageOutline} /> Photos</label>
                            <div className="photo-grid">
                                {report.photos?.map((url: string, i: number) => (
                                    <img key={i} src={url} alt="Service" onClick={() => window.open(url)} />
                                ))}
                            </div>
                        </IonCol>
                        {report.video && (
                            <>
                                <h3 className="section-title">Video Report</h3>
                                <IonCol size="12" className="ion-margin-top">
                                    <label className="view-label"><IonIcon icon={videocamOutline} /> Video Report</label>
                                    <div className="video-container">
                                        <video controls className="report-video">
                                            <source src={report.video} type="video/mp4" />
                                        </video>
                                    </div>
                                </IonCol>
                            </>
                        )}
                    </IonRow>

                    {/* Signature Section */}
                    <h3 className="section-title">Authorization</h3>
                    <IonRow className="view-card ion-padding ion-margin-bottom">
                        <IonCol size="12" className="ion-text-center">
                            <label className="view-label">Customer Signature</label>
                            <div className="signature-view-container">
                                <img src={report.customer_signature} alt="Signature" />
                            </div>
                            <IonText color="medium">
                                <p className="ion-no-margin">Signed by {report.customer_name}</p>
                            </IonText>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};
export default ServiceReportViewPage;