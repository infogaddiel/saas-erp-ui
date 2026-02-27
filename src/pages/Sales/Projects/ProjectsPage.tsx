import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import ProjectsContainer from './ProjectsContainer';
import Header from '../../../components/Header';
// Sharing the same ERP layout styles
import './Projects.css'; 

const ProjectsPage: React.FC = () => {
  return (
    <IonPage>
      {/* Consistent Header with Project context */}
      <Header 
        title="Project Management" 
        details="Track project lifecycles, budgets, and milestones" 
      />
      
      <IonContent className="ion-padding gray-bg">
        {/* The Container handles the actual logic, API calls, and table display */}
        <ProjectsContainer />
      </IonContent>
    </IonPage>
  );
};

export default ProjectsPage;