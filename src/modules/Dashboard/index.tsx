import React from 'react'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react'

const DashboardModule: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h3>Welcome to the Dashboard module</h3>
        <p>This is an example module. Replace with your features.</p>
        <IonButton routerLink="/sales">Go to Sales</IonButton>
      </IonContent>
    </IonPage>
  )
}

export default DashboardModule
