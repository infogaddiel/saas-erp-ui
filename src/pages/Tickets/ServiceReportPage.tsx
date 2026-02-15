import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import './ServiceReport.css';
import Header from '../../components/Header';
import ServiceReportContainer from './ServiceReportContainer';

const ServiceReportPage: React.FC = () => {
  return (
    <IonPage className="erp-page">
      <Header 
        title="New Service Report" 
        details="Create and document a new service report for client approval" 
      />
      <IonContent className="ion-padding gray-bg">
        <div className="container-wrapper">
           <ServiceReportContainer />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ServiceReportPage;