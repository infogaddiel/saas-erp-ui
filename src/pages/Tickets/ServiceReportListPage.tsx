import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import Header from '../../components/Header';
import ServiceReportListContainer from './ServiceReportListContainer';

const ServiceReportListPage: React.FC = () => {
    return (
        <IonPage>
            <Header
                title="Service Report List"
                details="Service Report List"
            />
            <IonContent className="ion-padding gray-bg">
                <div className="container-wrapper">
                    <ServiceReportListContainer />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ServiceReportListPage;