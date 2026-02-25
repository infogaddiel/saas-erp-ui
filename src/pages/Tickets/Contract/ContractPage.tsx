import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import ContractsContainer from './ContractContainer';
import Header from '../../../components/Header';
// Reuse your existing Tickets.css or create a specific Contracts.css if needed
import './Contract.css'; 

const ContractsPage: React.FC = () => {
  return (
    <IonPage>
      {/* Dynamic Header matching your ERP theme */}
      <Header 
        title="Contract Management" 
        details="Manage customer service agreements, AMCs, and subscriptions" 
      />
      
      <IonContent className="ion-padding gray-bg">
        {/* The Container handles the actual logic, API calls, and table display */}
        <ContractsContainer />
      </IonContent>
    </IonPage>
  );
};

export default ContractsPage;