import React from 'react';
import { 
  IonButtons, IonContent, IonHeader, IonMenuButton, 
  IonPage, IonTitle, IonToolbar 
} from '@ionic/react';
import ItemsContainer from './ItemsContainer';
import './Items.css';
import Header from '../../components/Header';

const ItemsPage: React.FC = () => {
  return (
    <IonPage>
      <Header title="Inventory Items" details="Manage Items" />
      <IonContent fullscreen className="items-page-content">
        <ItemsContainer />
      </IonContent>
    </IonPage>
  );
};

export default ItemsPage;