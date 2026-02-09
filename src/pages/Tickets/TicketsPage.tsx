import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import TicketsContainer from './TicketsContainer';
import './Tickets.css';
import Header from '../../components/Header';

const TicketsPage: React.FC = () => {
  return (
    <IonPage>
      {/* Dynamic Header matching your ERP theme */}
      <Header 
        title="Ticket Management" 
        details="Track and manage service requests and technician assignments" 
      />
      <IonContent className="ion-padding gray-bg">
        {/* The Container handles the actual logic and table */}
        <TicketsContainer />
      </IonContent>
    </IonPage>
  );
};

export default TicketsPage;