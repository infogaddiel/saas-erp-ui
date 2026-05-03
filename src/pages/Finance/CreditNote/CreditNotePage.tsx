import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import CreditNoteContainer from './CreditNoteContainer';
import Header from '../../../components/Header';
import './CreditNote.css'; // Reuses the shared styling rules for consistency

const CreditNotePage: React.FC = () => {
  return (
    <IonPage>
      <Header 
        title="Credit Notes" 
        details="Issue refunds, adjust customer balances, manage product returns, and process financial credits" 
      />
      
      <IonContent className="ion-padding gray-bg">
        <CreditNoteContainer />
      </IonContent>
    </IonPage>
  );
};

export default CreditNotePage;