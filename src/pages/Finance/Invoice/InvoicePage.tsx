import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import InvoiceContainer from './InvoiceContainer';
import Header from '../../../components/Header';
import './Invoice.css'; 

const InvoicePage: React.FC = () => {
  return (
    <IonPage>
      <Header 
        title="Invoices" 
        details="Manage customer billings, track payment status, and generate financial reports" 
      />
      
      <IonContent className="ion-padding gray-bg">
        <InvoiceContainer />
      </IonContent>
    </IonPage>
  );
};

export default InvoicePage;