import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonMenuButton } from '@ionic/react';
import Header from '../../components/Header';

const LeadsPage: React.FC = () => (
  <IonPage>
     <Header title="Leads" />
    <IonContent className="ion-padding">
      <h1>Sales Leads</h1>
      <p>Tracking potential new installations and contracts.</p>
    </IonContent>
  </IonPage>
);
export default LeadsPage;