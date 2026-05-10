import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import ReceiptContainer from './ReceiptContainer';
import Header from '../../../components/Header';
import './Receipt.css'; // Reuses the shared styling rules for consistency

const ReceiptPage: React.FC = () => {
  return (
    <IonPage>
      <Header 
        title="Payment Receipts" 
        details="Record customer payments, manage collections, track transaction references, and settle outstanding invoices" 
      />
      
      <IonContent className="ion-padding gray-bg">
        {/* The Container handles the List, Form, and API interactions */}
        <ReceiptContainer />
      </IonContent>
    </IonPage>
  );
};

export default ReceiptPage;