import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonMenuButton } from '@ionic/react';
import Header from '../../components/Header';

const CustomersPage: React.FC = () => (
  <IonPage>
    <Header title="Customers" />
    <IonContent className="ion-padding">
      <h1>Customer Directory</h1>
      <p>Management of all SEMAK service clients.</p>
    </IonContent>
  </IonPage>
);
export default CustomersPage;