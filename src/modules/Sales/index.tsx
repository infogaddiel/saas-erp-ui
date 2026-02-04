import React from 'react'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react'

const SalesModule: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sales</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h3>Sales Module</h3>
        <p>Place sales related features here.</p>
        <IonButton routerLink="/inventory">Go to Inventory</IonButton>
      </IonContent>
    </IonPage>
  )
}

export default SalesModule
