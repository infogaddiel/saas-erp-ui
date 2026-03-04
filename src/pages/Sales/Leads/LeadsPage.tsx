import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import LeadsContainer from './LeadsContainer';
import Header from '../../../components/Header';

// Reusing the same CSS for visual consistency across the ERP
import './Leads.css'; 

const LeadsPage: React.FC = () => {
  return (
    <IonPage>
      {/* Consistent Header with Lead context */}
      <Header 
        title="Lead Management" 
        details="Manage inquiries, track lead sources, and monitor conversion statuses" 
      />
      
      <IonContent className="ion-padding gray-bg">
        {/* The LeadsContainer handles the table, modals, and lead-specific logic */}
        <LeadsContainer />
      </IonContent>
    </IonPage>
  );
};

export default LeadsPage;