import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import StaffContainer from './StaffContainer';
import './Staff.css';
import Header from '../../components/Header';

const StaffPage: React.FC = () => {
  return (
    <IonPage>
        <Header title="Staff & Technicians" details="Manage users and their permissions" />
          <IonContent className="ion-padding gray-bg">
            <StaffContainer />
          </IonContent>
    </IonPage>
  );
};



export default StaffPage;