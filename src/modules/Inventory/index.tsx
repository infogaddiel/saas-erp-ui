import React from 'react'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react'

const InventoryModule: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inventory</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h3>Inventory Module</h3>
        <p>Inventory features go here.</p>
        <IonButton routerLink="/dashboard">Go to Dashboard</IonButton>
      </IonContent>
    </IonPage>
  )
}

export default InventoryModule
