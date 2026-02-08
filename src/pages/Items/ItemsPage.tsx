import React from 'react';
import { 
  IonButtons, IonContent, IonHeader, IonMenuButton, 
  IonPage, IonTitle, IonToolbar 
} from '@ionic/react';
import ItemsContainer from './ItemsContainer';
import './Items.css';

const ItemsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Inventory Items</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="items-page-content">
        <ItemsContainer />
      </IonContent>
    </IonPage>
  );
};

export default ItemsPage;