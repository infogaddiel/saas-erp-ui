import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import DebitNoteContainer from './DebitNoteContainer';
import Header from '../../../components/Header';
import './DebitNote.css'; 

const DebitNotePage: React.FC = () => {
  return (
    <IonPage>
      <Header 
        title="Debit Notes" 
        details="Adjust pricing discrepancies, charge for extra goods or services, and update customer balances" 
      />
      
      <IonContent className="ion-padding gray-bg">
        <DebitNoteContainer />
      </IonContent>
    </IonPage>
  );
};

export default DebitNotePage;