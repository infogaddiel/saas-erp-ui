import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import QuestionContainer from './QuestionContainer';
import Header from '../../../components/Header';
import './Question.css'; // Reuses your existing shared stylesheet

const QuestionPage: React.FC = () => {
  return (
    <IonPage>
      <Header 
        title="Question Management" 
        details="Create, review, filter, and delete questions within the settings module" 
      />
      
      <IonContent className="ion-padding gray-bg">
        <QuestionContainer />
      </IonContent>
    </IonPage>
  );
};

export default QuestionPage;