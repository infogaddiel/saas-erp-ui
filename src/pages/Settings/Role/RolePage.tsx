import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import RoleContainer from './RoleContainer';
import Header from '../../../components/Header';
import '../Question/Question.css';

const RolePage: React.FC = () => {
  return (
    <IonPage>
      <Header
        title="Role Management"
        details="Define roles and permission levels for your company users"
      />
      <IonContent className="ion-padding gray-bg">
        <RoleContainer />
      </IonContent>
    </IonPage>
  );
};

export default RolePage;
