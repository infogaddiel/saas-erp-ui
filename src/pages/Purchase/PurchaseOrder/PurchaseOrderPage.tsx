import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import PurchaseOrderContainer from './PurchaseOrderContainer';
import Header from '../../../components/Header';
// Sharing the same ERP layout styles for consistent background and spacing
import './PurchaseOrder.css'; 

const PurchaseOrderPage: React.FC = () => {
  return (
    <IonPage>
      {/* Consistent Header with Purchase Order context */}
      <Header 
        title="Purchase Orders" 
        details="Create, approve, and track procurement orders with your vendors" 
      />
      
      <IonContent className="ion-padding gray-bg">
        {/* The Container handles the logic, API calls, and table display */}
        <PurchaseOrderContainer />
      </IonContent>
    </IonPage>
  );
};

export default PurchaseOrderPage;