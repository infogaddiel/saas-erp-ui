import React from 'react';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonButtons, IonList, IonItem, 
  IonLabel, IonIcon, IonNote, IonModal 
} from '@ionic/react';
import { alertCircleOutline, closeOutline } from 'ionicons/icons';

interface ErrorModalProps {
  isOpen: boolean;
  errors: string[];
  onDismiss: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, errors, onDismiss }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} breakpoints={[0, 0.5, 0.8]} initialBreakpoint={0.8}>
      <IonHeader>
        <IonToolbar color="danger">
          <IonTitle>Validation Errors</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={closeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonNote color="medium" style={{ display: 'block', marginBottom: '10px' }}>
          Found <b>{errors.length}</b> issues in the excel sheet.
        </IonNote>
        <IonList lines="full">
          {errors.map((err, index) => (
            <IonItem key={index}>
              <IonIcon icon={alertCircleOutline} color="danger" slot="start" />
              <IonLabel className="ion-text-wrap">
                <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#333' }}>
                  {err.replace(/"/g, '')}
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonModal>
  );
};
export default ErrorModal;