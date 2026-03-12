import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import VendorContainer from './VendorContainer';
import Header from '../../components/Header';
// Sharing the same ERP layout styles for consistent background and spacing
import './Vendor.css'; 

const VendorPage: React.FC = () => {
  return (
    <IonPage>
      {/* Consistent Header with Vendor context */}
      <Header 
        title="Vendor Management" 
        details="Manage vendor relationships, categories, and contact information" 
      />
      
      <IonContent className="ion-padding gray-bg">
        {/* The Container handles the actual logic, API calls, and table display */}
        <VendorContainer />
      </IonContent>
    </IonPage>
  );
};

export default VendorPage;